let GoogleGenAI = null;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  // @google/genai optional module
}
const axios = require('axios');
const env = require('../config/env');

const PROVIDER_TIMEOUT_MS = 25000;
const FAILURE_COOLDOWN_MS = 60 * 1000; // skip a failed provider for 60s

// Resolve a valid Gemini model: explicit GEMINI_MODEL wins; legacy AI_MODEL
// is honored only if it actually names a Gemini model (old default was
// gpt-4o-mini, which 404s on the Gemini API).
function geminiModel() {
  if (process.env.GEMINI_MODEL) return process.env.GEMINI_MODEL;
  const legacy = env.aiModel || '';
  if (/^(gemini|models\/)/i.test(legacy)) return legacy;
  return 'gemini-2.5-flash';
}
function geminiKeys() {
  const keys = [];
  const first = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || env.aiApiKey;
  if (first) keys.push(first);
  for (let i = 2; i <= 5; i++) {
    const k = process.env[`GEMINI_API_KEY${i}`];
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

// Cooldown tracker: providerLabel -> timestamp (ms) until which it is skipped
const cooldownUntil = new Map();
function isCooling(label) {
  return (cooldownUntil.get(label) || 0) > Date.now();
}
function coolDown(label, err) {
  cooldownUntil.set(label, Date.now() + FAILURE_COOLDOWN_MS);
  console.warn(`[aiService] ${label} failed, cooling down 60s: ${err && err.message ? err.message : err}`);
}

function buildPrompt({ title, category, severity, endpoint, evidence, verificationStatus }) {
  return `You are a Senior Cyber Security Analyst & Principal Penetration Tester. Analyze this security finding:
Title: ${title}
Category: ${category}
Severity: ${severity}
Endpoint/Asset: ${endpoint}
Evidence Payload: ${evidence}
Verification Status: ${verificationStatus}

Rules: output ONLY the JSON object below. Start with { and end with }. No markdown, no commentary.

Return a valid JSON object strictly matching this schema:
{
  "summary": "1-2 sentence executive summary of the vulnerability",
  "classification": "OWASP / CWE category classification",
  "confidence": number between 50 and 99,
  "impact": "Detailed business and technical security impact",
  "technicalExplanation": "Technical root cause explanation",
  "remediation": ["step 1", "step 2", "step 3"],
  "priorityReason": "Why this item should be prioritized"
}`;
}

function normalize(title, category, evidence, parsed, meta) {
  return {
    summary: parsed.summary || `${title} analyzed via AI.`,
    classification: parsed.classification || category || 'Unclassified',
    confidence: Number(parsed.confidence) || 85,
    impact: parsed.impact || 'Potential unauthorized access or compromise.',
    technicalExplanation: parsed.technicalExplanation || evidence,
    remediation: Array.isArray(parsed.remediation) ? parsed.remediation : [parsed.remediation].filter(Boolean),
    priorityReason: parsed.priorityReason || 'High priority remediation.',
    _meta: meta,
  };
}

function safeParse(text) {
  if (!text || typeof text !== 'string') throw new Error('Empty AI response');
  try {
    return JSON.parse(text);
  } catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('AI response was not valid JSON');
    return JSON.parse(m[0]);
  }
}

// ---- Provider 1: Google Gemini (native SDK, rotates numbered keys) ----
async function tryGemini(input, prompt) {
  const keys = geminiKeys();
  if (keys.length === 0 || !GoogleGenAI) return null;
  let lastErr = null;
  for (let i = 0; i < keys.length; i++) {
    const label = `gemini#${i + 1}`;
    if (isCooling(label)) continue;
    try {
      const client = new GoogleGenAI({ apiKey: keys[i] });
      const gmodel = geminiModel();
      const response = await client.models.generateContent({
        model: gmodel,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = safeParse(response?.text);
      console.log(`[aiService] served by ${label}`);
      return normalize(input.title, input.category, input.evidence, parsed, {
        model: gmodel,
        provider: 'gemini',
        note: `Live Gemini LLM Analysis (${label})`,
      });
    } catch (err) {
      lastErr = err;
      coolDown(label, err);
    }
  }
  if (lastErr) console.warn('[aiService] all Gemini keys exhausted');
  return null;
}

// ---- Provider 2 & 3: OpenAI-compatible chat APIs (Groq, OpenRouter) ----
async function tryOpenAICompatible({ label, baseUrl, apiKey, model, extraHeaders, input, prompt }) {
  if (!apiKey) return null;
  if (isCooling(label)) return null;
  // Note: no response_format — some providers (Groq) reject forced JSON mode;
  // safeParse() extracts the {...} block from the reply instead.
  const body = {
    model,
    messages: [
      { role: 'system', content: 'You output exactly one JSON object and nothing else. No markdown fences. No preamble. No explanation outside the JSON. Start with { and end with }.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 900,
  };
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(extraHeaders || {}) };
  // One retry for transient 429/5xx (free-tier rate limits).
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const resp = await axios.post(`${baseUrl.replace(/\/$/, '')}/chat/completions`, body, {
        timeout: PROVIDER_TIMEOUT_MS,
        headers,
        validateStatus: () => true,
      });
      if (resp.status === 429 || resp.status >= 500) {
        throw new Error(`HTTP ${resp.status} (transient): ${JSON.stringify(resp.data).slice(0, 200)}`);
      }
      if (resp.status < 200 || resp.status >= 300) {
        const fatal = new Error(`HTTP ${resp.status}: ${JSON.stringify(resp.data).slice(0, 200)}`);
        fatal.fatal = true;
        throw fatal;
      }
      const text = resp.data?.choices?.[0]?.message?.content;
      const parsed = safeParse(text);
      console.log(`[aiService] served by ${label} (${model})`);
      return normalize(input.title, input.category, input.evidence, parsed, {
        model,
        provider: label,
        note: `Live ${label} LLM Analysis`,
      });
    } catch (err) {
      const transient = !err.fatal && attempt === 1;
      if (transient) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      coolDown(label, err);
      return null;
    }
  }
  coolDown(label, new Error('retries exhausted'));
  return null;
}

// Failover chain: Gemini keys → Groq → OpenRouter. Throws 502 if all unreachable.
async function analyzeFinding(input) {
  const prompt = buildPrompt(input);

  const gemini = await tryGemini(input, prompt);
  if (gemini) return gemini;

  const groq = await tryOpenAICompatible({
    label: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    input,
    prompt,
  });
  if (groq) return groq;

  const openrouter = await tryOpenAICompatible({
    label: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'liquid/lfm-2.5-2.6b:free',
    extraHeaders: {
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'Saksham AI Security Assessment',
    },
    input,
    prompt,
  });
  if (openrouter) return openrouter;

  console.warn('[aiService] all providers unavailable');
  const err = new Error('AI providers unreachable — check GEMINI_API_KEY / GROQ_API_KEY / OPENROUTER_API_KEY and network access.');
  err.statusCode = 502;
  throw err;
}

function executiveSummary({ projectName, score, totals }) {
  return `Security assessment of ${projectName}: score ${score}/100 with `
    + `${totals.critical} critical, ${totals.high} high, ${totals.medium} medium, ${totals.low} low findings. `
    + `Verified findings: ${totals.verified}. Prioritize critical/high verified items, then harden headers and access controls.`;
}

// Raw-text completion across the same failover chain (for report summaries).
// Returns { text, provider, model } or throws 502 like analyzeFinding.
async function completeText(systemInstruction, userPrompt, maxTokens = 700) {
  const keys = geminiKeys();
  if (keys.length && GoogleGenAI) {
    for (let i = 0; i < keys.length; i++) {
      const label = `gemini#${i + 1}`;
      if (isCooling(label)) continue;
      try {
        const client = new GoogleGenAI({ apiKey: keys[i] });
        const response = await client.models.generateContent({
          model: geminiModel(),
          contents: `${systemInstruction}\n\n${userPrompt}`,
        });
        const text = (response?.text || '').trim();
        if (!text) throw new Error('Empty Gemini response');
        console.log(`[aiService] summary served by ${label}`);
        return { text, provider: 'gemini', model: geminiModel() };
      } catch (err) {
        coolDown(label, err);
      }
    }
  }

  const chatProviders = [
    {
      label: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    },
    {
      label: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'liquid/lfm-2.5-2.6b:free',
      extraHeaders: {
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'Saksham AI Security Assessment',
      },
    },
  ];
  for (const p of chatProviders) {
    if (!p.apiKey || isCooling(p.label)) continue;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const resp = await axios.post(`${p.baseUrl}/chat/completions`, {
          model: p.model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: maxTokens,
        }, {
          timeout: PROVIDER_TIMEOUT_MS,
          headers: { Authorization: `Bearer ${p.apiKey}`, 'Content-Type': 'application/json', ...(p.extraHeaders || {}) },
          validateStatus: () => true,
        });
        if (resp.status === 429 || resp.status >= 500) throw new Error(`HTTP ${resp.status} (transient)`);
        if (resp.status < 200 || resp.status >= 300) {
          const fatal = new Error(`HTTP ${resp.status}`);
          fatal.fatal = true;
          throw fatal;
        }
        const text = (resp.data?.choices?.[0]?.message?.content || '').trim();
        if (!text) throw new Error('Empty response');
        console.log(`[aiService] summary served by ${p.label} (${p.model})`);
        return { text, provider: p.label, model: p.model };
      } catch (err) {
        if (!err.fatal && attempt === 1) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        coolDown(p.label, err);
        break;
      }
    }
  }

  const err = new Error('AI providers unreachable for executive summary.');
  err.statusCode = 502;
  throw err;
}

// AI-written executive summary grounded ONLY in the supplied assessment data.
// Falls back to the factual template only when providers are down (caller decides).
async function generateExecutiveSummary({ projectName, targetUrl, score, totals, topFindings = [] }) {
  const lines = topFindings.slice(0, 8).map((f, i) =>
    `${i + 1}. ${f.findingId || ''} ${f.title} [${f.severity} ${f.cvssScore}] (${f.status}) — ${(f.impact || '').slice(0, 140)}`
  );
  const userPrompt = [
    `Project: ${projectName}`,
    `Target: ${targetUrl || 'n/a'}`,
    `Security score: ${score}/100`,
    `Totals: ${totals.critical} critical, ${totals.high} high, ${totals.medium} medium, ${totals.low} low, ${totals.verified} verified`,
    `Top findings:`,
    ...lines,
    ``,
    `Write a concise executive summary (120-180 words, plain paragraphs, no markdown headings): overall posture, the 2-3 most important risks and their business impact, and what to fix first. Use ONLY the data above — do not invent findings.`,
  ].join('\n');
  return completeText(
    'You are a senior security consultant writing an executive summary for a penetration-test style report. Be precise, non-alarmist, and grounded strictly in the supplied data.',
    userPrompt,
    700
  );
}

module.exports = { analyzeFinding, executiveSummary, generateExecutiveSummary, completeText };
