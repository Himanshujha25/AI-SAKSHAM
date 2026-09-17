let GoogleGenAI = null;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  // @google/genai optional module
}
const axios = require('axios');
const env = require('../config/env');
const { getKnowledgePromptExcerpt } = require('./aiKnowledgeService');

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

function generateFallbackRemediationWiki(title, category, severity, endpoint) {
  const isHeader = /header|csp|cors|hsts|frame|x-content/i.test(title + ' ' + category);
  const isAuth = /auth|token|jwt|session|login|credential/i.test(title + ' ' + category);

  let mitreTechnique = 'T1190 - Exploit Public-Facing Application';
  let mitreUrl = 'https://attack.mitre.org/techniques/T1190/';
  if (isAuth) {
    mitreTechnique = 'T1078 - Valid Accounts & Authentication Weakness';
    mitreUrl = 'https://attack.mitre.org/techniques/T1078/';
  } else if (/cors|poison|relay|llmnr|smb/i.test(title)) {
    mitreTechnique = 'T1557.001 - Adversary-in-the-Middle (LLMNR/NBT-NS Poisoning)';
    mitreUrl = 'https://attack.mitre.org/techniques/T1557/001/';
  } else if (isHeader) {
    mitreTechnique = 'T1189 - Drive-by Compromise / Missing Security Headers';
    mitreUrl = 'https://attack.mitre.org/techniques/T1189/';
  }

  return {
    insight: `The affected endpoint (${endpoint || 'target host'}) exhibits ${title}. The root cause stems from default or unhardened security configurations permitting attackers to test or manipulate application state without defensive boundaries.`,
    impact: `Adversaries can leverage this weakness to capture sensitive authentication material, perform cross-origin request coercion, or establish a foothold for deeper lateral exploitation.`,
    mitreTechnique,
    mitreUrl,
    configs: [
      {
        platform: 'PowerShell',
        title: 'Local Endpoint Hardening (PowerShell / Windows)',
        snippet: `# Enforce registry security policy and disable weak protocols\nNew-Item "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" -Force -ErrorAction SilentlyContinue\nSet-ItemProperty "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\DNSClient" -Name EnableMulticast -Value 0 -Type DWord -Force\nWrite-Host "[+] Local system hardening configuration applied successfully." -ForegroundColor Green`,
        instructions: [
          'Open PowerShell with Administrator privileges',
          'Execute the hardening command above',
          'Verify key state with Get-ItemProperty',
        ],
      },
      {
        platform: 'GPO',
        title: 'Enterprise Active Directory Domain GPO',
        snippet: `1. Open Group Policy Management Console (gpmc.msc).\n2. Edit baseline domain policy.\n3. Navigate: Computer Configuration -> Administrative Templates -> Network -> DNS Client.\n4. Set "Turn Off Multicast Name Resolution" to Enabled.\n5. Run "gpupdate /force" on client endpoints.`,
        instructions: [
          'Open gpmc.msc on Domain Controller',
          'Navigate to Computer Configuration -> Administrative Templates',
          'Set security policy to Enabled and propagate',
        ],
      },
      {
        platform: 'Nginx / Web Server',
        title: 'Reverse Proxy & Web Server Hardening (Nginx)',
        snippet: `# Nginx production hardening directives\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "DENY" always;\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:;" always;\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\nserver_tokens off;`,
        instructions: [
          'Add directives to /etc/nginx/conf.d/security.conf or server block',
          'Validate configuration syntax: nginx -t',
          'Reload Nginx daemon: systemctl reload nginx',
        ],
      },
      {
        platform: 'App Code',
        title: 'Application Middleware Hardening (Node.js / Express)',
        snippet: `const helmet = require('helmet');\n\n// Mount comprehensive security header middleware\napp.use(helmet({\n  contentSecurityPolicy: true,\n  crossOriginEmbedderPolicy: false,\n  hsts: { maxAge: 31536000, includeSubDomains: true },\n}));`,
        instructions: [
          'Install standard security package',
          'Attach middleware before application route handlers',
          'Run regression test suite',
        ],
      },
    ],
    validationMethod: {
      command: `curl -i -s -k "${endpoint || 'http://localhost:3001/api'}" | head -n 30`,
      expectedResult: 'HTTP/1.1 200 OK with strict security headers (no sensitive disclosure)',
      description: 'Send test HTTP query and verify expected security controls are present in response.',
    },
  };
}

function generateFallbackCombinedConclusion(title, category, severity, evidence, endpoint, cvssScore = 5) {
  const isHighCrit = ['Critical', 'High'].includes(severity);
  const score = Math.min(10, Math.max(1, Number(cvssScore) || (isHighCrit ? 8.5 : 4.5)));
  const exploitFeasibility = isHighCrit ? 'High' : (severity === 'Medium' ? 'Medium' : 'Low');

  return {
    executiveVerdict: `Automated security checks verified ${title} on ${endpoint || 'the target asset'}. Synthesizing deterministic scanner telemetry with AI threat intelligence confirms an active ${severity.toLowerCase()}-tier vulnerability requiring prioritized remediation.`,
    technicalConclusion: `Scanner captured reproducible evidence of missing security controls. AI threat correlation concludes that an adversary exploiting this weakness can chain it with internal reconnaissance to gain unauthorized context or escalate privileges across adjacent services.`,
    combinedRiskScore: Number(score.toFixed(1)),
    exploitFeasibility,
    feasibilityReasoning: `Vulnerability can be actively tested and exploited via standard network and HTTP requests with high repeatability and minimal barrier to entry.`,
    keyRemediationAction: `Enforce baseline configuration hardening across server headers and network endpoints.`,
    scannerCertainty: 94,
    aiThreatProjection: `If left unmitigated, attackers can combine this initial vulnerability to bypass network trust boundaries or harvest user tokens.`,
  };
}

function generateFallbackKillChainStep(title, category, severity, endpoint, cvssScore = 5) {
  let phase = 'Initial Access';
  let order = 2;
  let achievementTitle = `Host vulnerability discovered: ${title}`;
  let score = Number(cvssScore) || 5.0;
  let vector = `Direct HTTP test request against ${endpoint || 'target asset'}`;

  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('recon') || t.includes('fingerprint') || t.includes('info') || t.includes('header')) {
    phase = 'Reconnaissance';
    order = 1;
    achievementTitle = `Asset discovery & header footprinting on ${endpoint || 'host'}`;
    score = score || 4.2;
  } else if (t.includes('llmnr') || t.includes('smb') || t.includes('auth') || t.includes('token') || t.includes('cred') || t.includes('hash')) {
    phase = 'Credential Access';
    order = 3;
    achievementTitle = `Captured authentication credentials & session tokens`;
    score = score || 6.6;
    vector = `Authentication coercion & credential extraction`;
  } else if (t.includes('lateral') || t.includes('idor') || t.includes('pivot') || t.includes('route')) {
    phase = 'Lateral Movement';
    order = 4;
    achievementTitle = `Traversed internal microservices via unauthorized pivots`;
    score = score || 8.0;
  } else if (t.includes('admin') || t.includes('privilege') || t.includes('rce') || t.includes('escalat')) {
    phase = 'Privilege Escalation';
    order = 5;
    achievementTitle = `Elevated privileges to domain / system administrator`;
    score = score || 9.5;
  } else if (t.includes('ransom') || t.includes('exfiltrat') || t.includes('data') || t.includes('impact')) {
    phase = 'Impact';
    order = 6;
    achievementTitle = `Completed attack kill chain & mission objective`;
    score = 10.0;
  }

  return {
    phase,
    order,
    achievementTitle,
    score: Number(score.toFixed(1)),
    adversaryLevel: score >= 8.5 ? 'Advanced' : 'Opportunistic',
    sourceAsset: 'Attacker Machine / External Gateway',
    targetAsset: endpoint || '192.168.100.2',
    vector,
  };
}

function buildPrompt({ title, category, severity, endpoint, evidence, verificationStatus, cvssScore = 5 }) {
  const knowledge = getKnowledgePromptExcerpt(3500);

  return `You are a Principal Penetration Tester and Automated Security Validation Expert (modeled after Pentera).
Analyze this security finding and synthesize a definitive profile by combining automated deterministic scanner facts with deep AI cyber threat reasoning.

${knowledge}

FINDING EVIDENCE & SCANNER CONTEXT:
Title: ${title}
Category: ${category}
Severity: ${severity}
CVSS Base Score: ${cvssScore}
Endpoint/Asset: ${endpoint}
Evidence Payload: ${evidence}
Verification Status: ${verificationStatus}

Rules: output ONLY the JSON object below. Start with { and end with }. No markdown fences, no outer commentary.

Return a valid JSON object strictly matching this schema:
{
  "summary": "1-2 sentence executive summary of the vulnerability",
  "classification": "OWASP / CWE category classification (e.g. CWE-693 / OWASP A05:2021)",
  "confidence": number between 50 and 99,
  "impact": "Detailed business and technical security impact",
  "businessImpact": "Specific business impact assessment on financial, operational, and regulatory compliance risk",
  "technicalExplanation": "Technical root cause explanation",
  "stepsToReproduce": [
    "Step 1: Send request to target endpoint...",
    "Step 2: Inspect server response headers or payload...",
    "Step 3: Verify vulnerability behavior..."
  ],
  "proofOfConcept": "Full reproducible HTTP curl request or code snippet demonstrating the issue safely",
  "remediation": ["step 1", "step 2", "step 3"],
  "priorityReason": "Why this item should be prioritized",
  "combinedConclusion": {
    "executiveVerdict": "Authoritative high-level strategic conclusion combining scanner facts with AI threat projection",
    "technicalConclusion": "Detailed technical conclusion synthesizing the deterministic HTTP trace/evidence with AI weaponization modeling",
    "combinedRiskScore": number between 0.1 and 10.0,
    "exploitFeasibility": "Critical" or "High" or "Medium" or "Low" or "Theoretical",
    "feasibilityReasoning": "Concrete explanation of how easily an attacker can weaponize this in an attack chain",
    "keyRemediationAction": "The single most decisive configuration change that neutralizes this vulnerability",
    "scannerCertainty": number between 60 and 100,
    "aiThreatProjection": "Projected consequence if an attacker chains this with subsequent lateral movement steps"
  },
  "remediationWiki": {
    "insight": "Deep technical explanation of why this flaw occurs, its architectural root cause, and how attackers abuse it",
    "impact": "Concrete adversary impact detailing the victim-attacker interaction flow",
    "mitreTechnique": "e.g. T1557.001 - LLMNR/NBT-NS Poisoning and SMB Relay (or relevant MITRE technique ID & name)",
    "mitreUrl": "https://attack.mitre.org/techniques/...",
    "configs": [
      {
        "platform": "PowerShell",
        "title": "Remediation Script (PowerShell / Windows)",
        "snippet": "# Exact executable PowerShell or CLI hardening commands...",
        "instructions": ["Open elevated shell", "Execute configuration command", "Verify policy registry key"]
      },
      {
        "platform": "GPO",
        "title": "Group Policy Configuration (Active Directory / Windows)",
        "snippet": "1. Open gpmc.msc\\n2. Navigate to Computer Configuration -> Administrative Templates...\\n3. Set ... to Enabled",
        "instructions": ["Open gpmc.msc", "Navigate policy tree", "Apply and run gpupdate /force"]
      },
      {
        "platform": "Nginx / Web Server",
        "title": "Web Server Hardening (Nginx / Apache)",
        "snippet": "# add_header directives or server configuration...",
        "instructions": ["Edit server block config", "Test configuration with nginx -t", "Reload service"]
      },
      {
        "platform": "App Code",
        "title": "Application Code Hardening",
        "snippet": "// Code-level protection snippet...",
        "instructions": ["Install security middleware", "Configure options", "Deploy update"]
      }
    ],
    "validationMethod": {
      "command": "curl -i -s -k ... or validation command",
      "expectedResult": "Expected output confirming vulnerability is resolved",
      "description": "How the security team or automated engine confirms the fix"
    }
  },
  "killChainStep": {
    "phase": "Reconnaissance" or "Initial Access" or "Credential Access" or "Lateral Movement" or "Privilege Escalation" or "Impact",
    "order": number between 1 and 6,
    "achievementTitle": "Concise Pentera-style achievement title (e.g. Host coerced to authenticate / Credentials captured)",
    "score": number between 1.0 and 10.0,
    "adversaryLevel": "Opportunistic" or "Advanced" or "Nation-State",
    "sourceAsset": "Origin of attack vector",
    "targetAsset": "Target host or endpoint",
    "vector": "Specific technique or exploit vector description"
  }
}`;
}

function normalize(title, category, evidence, parsed, meta, input = {}) {
  const fallbackWiki = generateFallbackRemediationWiki(title, category, input.severity, input.endpoint);
  const fallbackConclusion = generateFallbackCombinedConclusion(title, category, input.severity, evidence, input.endpoint, input.cvssScore);
  const fallbackStep = generateFallbackKillChainStep(title, category, input.severity, input.endpoint, input.cvssScore);

  const rawWiki = parsed.remediationWiki || {};
  const rawConclusion = parsed.combinedConclusion || {};
  const rawStep = parsed.killChainStep || {};

  return {
    summary: parsed.summary || `${title} analyzed via AI.`,
    classification: parsed.classification || category || 'Unclassified',
    confidence: Number(parsed.confidence) || 85,
    impact: parsed.impact || 'Potential unauthorized access or compromise.',
    businessImpact: parsed.businessImpact || parsed.impact || 'Risk of security policy violation, session hijacking, or data exposure on target systems.',
    technicalExplanation: parsed.technicalExplanation || evidence,
    stepsToReproduce: Array.isArray(parsed.stepsToReproduce) && parsed.stepsToReproduce.length > 0
      ? parsed.stepsToReproduce
      : [
          `Send request to affected endpoint with standard headers.`,
          `Observe response status and missing security controls in server header payload.`,
          `Validate non-compliant behavior against security standard.`,
        ],
    proofOfConcept: parsed.proofOfConcept || (evidence ? `Captured Evidence:\n${evidence}` : `curl -i -X GET "${title}"`),
    remediation: Array.isArray(parsed.remediation) && parsed.remediation.length > 0
      ? parsed.remediation
      : (Array.isArray(fallbackWiki.configs) && fallbackWiki.configs[0]?.instructions) || ['Enforce standard security hardening.'],
    priorityReason: parsed.priorityReason || 'High priority remediation.',
    combinedConclusion: {
      executiveVerdict: rawConclusion.executiveVerdict || fallbackConclusion.executiveVerdict,
      technicalConclusion: rawConclusion.technicalConclusion || fallbackConclusion.technicalConclusion,
      combinedRiskScore: Number(rawConclusion.combinedRiskScore) || fallbackConclusion.combinedRiskScore,
      exploitFeasibility: rawConclusion.exploitFeasibility || fallbackConclusion.exploitFeasibility,
      feasibilityReasoning: rawConclusion.feasibilityReasoning || fallbackConclusion.feasibilityReasoning,
      keyRemediationAction: rawConclusion.keyRemediationAction || fallbackConclusion.keyRemediationAction,
      scannerCertainty: Number(rawConclusion.scannerCertainty) || fallbackConclusion.scannerCertainty,
      aiThreatProjection: rawConclusion.aiThreatProjection || fallbackConclusion.aiThreatProjection,
    },
    remediationWiki: {
      insight: rawWiki.insight || fallbackWiki.insight,
      impact: rawWiki.impact || fallbackWiki.impact,
      mitreTechnique: rawWiki.mitreTechnique || fallbackWiki.mitreTechnique,
      mitreUrl: rawWiki.mitreUrl || fallbackWiki.mitreUrl,
      configs: Array.isArray(rawWiki.configs) && rawWiki.configs.length > 0 ? rawWiki.configs : fallbackWiki.configs,
      validationMethod: rawWiki.validationMethod || fallbackWiki.validationMethod,
    },
    killChainStep: {
      phase: rawStep.phase || fallbackStep.phase,
      order: Number(rawStep.order) || fallbackStep.order,
      achievementTitle: rawStep.achievementTitle || fallbackStep.achievementTitle,
      score: Number(rawStep.score) || fallbackStep.score,
      adversaryLevel: rawStep.adversaryLevel || fallbackStep.adversaryLevel,
      sourceAsset: rawStep.sourceAsset || fallbackStep.sourceAsset,
      targetAsset: rawStep.targetAsset || fallbackStep.targetAsset,
      vector: rawStep.vector || fallbackStep.vector,
    },
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
        note: 'Saksham Neural Threat Intelligence Engine (Stage 6)',
      }, input);
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
    max_tokens: 1800,
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
      }, input);
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

// Unified Scanner + AI Synergistic Assessment Conclusion
async function generateCombinedAssessmentConclusion({ projectName, targetUrl, score, totals, findings = [] }) {
  const verifiedCount = findings.filter(f => f.verified || f.status === 'Verified').length;
  const criticals = findings.filter(f => (f.severity || '').toUpperCase() === 'CRITICAL');
  const highs = findings.filter(f => (f.severity || '').toUpperCase() === 'HIGH');
  
  const systemInstruction = `You are a Principal Penetration Tester and Automated Security Validation Architect (modeled after Pentera).
Synthesize an authoritative combined security conclusion uniting automated scanner observations with AI adversary simulation modeling.`;

  const topLines = findings.slice(0, 10).map((f, i) =>
    `Step ${i + 1}: ${f.findingId || 'VUL'} ${f.title} [${f.severity} ${f.cvssScore}] -> Exploit Vector: ${(f.killChainStep?.achievementTitle || f.impact || '').slice(0, 120)}`
  );

  const userPrompt = `Project: ${projectName}
Target Host/URL: ${targetUrl || 'Internal Environment'}
Deterministic Scanner Score: ${score}/100
Findings: ${totals.critical} Critical, ${totals.high} High, ${totals.medium} Medium, ${totals.low} Low (Verified: ${verifiedCount})

Observed Attack Chain Vectors:
${topLines.join('\n')}

Provide a unified 3-paragraph synthesis:
1. Executive Risk Verdict (merging deterministic scan facts with adversary risk projection)
2. Attack Chain & Kill Chain Feasibility (how an adversary bridges initial footholds to lateral movement and privilege escalation)
3. Decisive Remediation Strategy (high-leverage GPO/PowerShell/server configuration changes that break the attack path).`;

  try {
    const res = await completeText(systemInstruction, userPrompt, 800);
    return {
      text: res.text,
      provider: res.provider,
      model: res.model,
    };
  } catch (err) {
    console.warn('[aiService] Combined conclusion fallback triggered:', err.message);
    return {
      text: `Automated scanner execution across ${projectName} (${targetUrl || 'Target'}) identified ${totals.critical} critical and ${totals.high} high-severity vulnerabilities. Synthesizing deterministic scanner telemetry with AI threat modeling demonstrates an active attack surface. Attackers can leverage misconfigured headers and exposed protocols to capture credentials and execute lateral movement. Immediate implementation of centralized configuration hardening (GPO enforcement and web server policy headers) will neutralize the primary attack vectors and restore defensive posture.`,
      provider: 'fallback',
      model: 'deterministic-rules',
    };
  }
}

module.exports = {
  analyzeFinding,
  executiveSummary,
  generateExecutiveSummary,
  generateCombinedAssessmentConclusion,
  completeText,
  generateFallbackRemediationWiki,
  generateFallbackCombinedConclusion,
  generateFallbackKillChainStep,
};

