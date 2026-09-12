let GoogleGenAI = null;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  // @google/genai optional module
}
const env = require('../config/env');

const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || env.aiApiKey;
let aiClient = null;
if (apiKey && GoogleGenAI) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('[aiService] Failed to initialize GoogleGenAI client:', e.message);
  }
}

const REMEDIATION_LIBRARY = {
  'Broken Access Control': [
    'Implement server-side authorization checks.',
    'Validate resource ownership before returning data.',
    'Apply least-privilege access rules.',
  ],
  'Security Misconfiguration': [
    'Harden security headers (CSP, HSTS, X-Frame-Options).',
    'Disable verbose errors and directory listing in test env.',
  ],
  default: [
    'Validate input server-side and encode output.',
    'Add regression tests for this finding.',
  ],
};

async function analyzeFinding(input) {
  const { title = '', category = '', severity = '', endpoint = '', evidence = '', verificationStatus = '' } = input;

  if (aiClient) {
    try {
      const prompt = `You are a Senior Cyber Security Analyst & Principal Penetration Tester. Analyze this security finding:
Title: ${title}
Category: ${category}
Severity: ${severity}
Endpoint/Asset: ${endpoint}
Evidence Payload: ${evidence}
Verification Status: ${verificationStatus}

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

      const response = await aiClient.models.generateContent({
        model: env.aiModel || 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          summary: parsed.summary || `${title} analyzed via Gemini AI.`,
          classification: parsed.classification || category || 'Unclassified',
          confidence: Number(parsed.confidence) || 85,
          impact: parsed.impact || 'Potential unauthorized access or compromise.',
          technicalExplanation: parsed.technicalExplanation || evidence,
          remediation: Array.isArray(parsed.remediation) ? parsed.remediation : [parsed.remediation],
          priorityReason: parsed.priorityReason || 'High priority remediation.',
          _meta: { model: env.aiModel || 'gemini-2.5-flash', note: 'Live Gemini LLM Analysis' },
        };
      }
    } catch (err) {
      console.warn('[aiService] Gemini API call failed, falling back to mock:', err.message);
    }
  }

  // Deterministic fallback
  const key = category && REMEDIATION_LIBRARY[category] ? category : 'default';
  const classification = category || title || 'Unclassified';
  const confidence = verificationStatus === 'Verified' || verificationStatus === 'VERIFIED' ? 90 : 72;

  return {
    summary: `${classification} analyzed for ${endpoint || 'target'} with ${severity || 'unknown'} severity.`,
    classification,
    confidence,
    impact: 'Exploitation could expose sensitive data or weaken security controls. See evidence and verification status.',
    technicalExplanation: `Evidence reviewed: ${String(evidence).slice(0, 280) || 'no evidence provided'}`,
    remediation: REMEDIATION_LIBRARY[key],
    priorityReason: severity === 'Critical' || severity === 'High'
      ? 'High severity with reachable endpoint — fix first.'
      : 'Fix per sprint priority after higher severities.',
    _meta: { model: 'mock-v1', note: 'Deterministic Fallback. Set GEMINI_API_KEY for live LLM analysis.' },
  };
}

function executiveSummary({ projectName, score, totals }) {
  return `Security assessment of ${projectName}: score ${score}/100 with `
    + `${totals.critical} critical, ${totals.high} high, ${totals.medium} medium, ${totals.low} low findings. `
    + `Verified findings: ${totals.verified}. Prioritize critical/high verified items, then harden headers and access controls.`;
}

module.exports = { analyzeFinding, executiveSummary };

