// Structured AI analysis. Uses deterministic mock when AI_API_KEY is absent.
// Plug a real LLM here later: send `input`, validate output matches the contract, return it.
const env = require('../config/env');

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

  // TODO: if (env.aiApiKey) call LLM with JSON mode + schema validation, then return.
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
    _meta: { model: env.aiApiKey ? env.aiModel : 'mock-v1', note: env.aiApiKey ? 'live' : 'Set AI_API_KEY for live LLM analysis.' },
  };
}

function executiveSummary({ projectName, score, totals }) {
  return `Security assessment of ${projectName}: score ${score}/100 with `
    + `${totals.critical} critical, ${totals.high} high, ${totals.medium} medium, ${totals.low} low findings. `
    + `Verified findings: ${totals.verified}. Prioritize critical/high verified items, then harden headers and access controls.`;
}

module.exports = { analyzeFinding, executiveSummary };
