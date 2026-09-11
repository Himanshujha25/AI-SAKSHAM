// Deterministic demo assessment data so demos are reproducible.
// Safe: no real scanning — generates plausible assets/findings for the authorized demo target.
const { severityFromScore } = require('./security');

function buildDemoAssets() {
  return [
    { type: 'api', name: 'Login API', url: '/api/login', method: 'POST', authentication: 'Public', metadata: { risk: 'Medium' } },
    { type: 'api', name: 'Profile API', url: '/api/profile', method: 'GET', authentication: 'Required', metadata: { risk: 'Low' } },
    { type: 'api', name: 'Report detail API', url: '/api/reports/:id', method: 'GET', authentication: 'Required', metadata: { risk: 'High' } },
    { type: 'api', name: 'Admin users API', url: '/api/admin/users', method: 'GET', authentication: 'Admin', metadata: { risk: 'High' } },
    { type: 'route', name: '/login page', url: '/login', method: 'GET', authentication: 'Public', metadata: {} },
    { type: 'route', name: '/dashboard page', url: '/dashboard', method: 'GET', authentication: 'Required', metadata: {} },
    { type: 'technology', name: 'React 19', url: '', method: 'ANY', authentication: 'Public', metadata: { version: '19.x' } },
    { type: 'technology', name: 'Express 4', url: '', method: 'ANY', authentication: 'Public', metadata: { version: '4.x' } },
    { type: 'header', name: 'Content-Security-Policy', url: '', method: 'ANY', authentication: 'Public', metadata: { present: false } },
    { type: 'header', name: 'Strict-Transport-Security', url: '', method: 'ANY', authentication: 'Public', metadata: { present: true } },
    { type: 'js', name: 'main bundle', url: '/assets/index.js', method: 'GET', authentication: 'Public', metadata: {} },
    { type: 'dependency', name: 'lodash', url: '', method: 'ANY', authentication: 'Public', metadata: { version: '4.17.21', note: 'audit for known CVEs' } },
  ];
}

function buildDemoFindings() {
  const raw = [
    {
      title: 'Broken Access Control',
      category: 'Broken Access Control',
      cvssScore: 8.1,
      status: 'Verified',
      confidence: 94,
      affectedAssets: ['/api/reports/:id'],
      description: 'Resource-level authorization may not be enforced on report detail endpoint.',
      evidence: 'Controlled authorization test in authorized env returned data outside expected access scope.',
      impact: 'Unauthorized users may gain access to protected application resources.',
      remediation: ['Implement server-side authorization checks.', 'Validate resource ownership before returning data.', 'Apply least-privilege access rules.'],
      verified: true,
    },
    {
      title: 'Missing Security Header (CSP)',
      category: 'Security Misconfiguration',
      cvssScore: 5.3,
      status: 'Under Review',
      confidence: 82,
      affectedAssets: ['/'],
      description: 'Content-Security-Policy header not observed.',
      evidence: 'Header inspection of authorized demo target showed no CSP header.',
      impact: 'Increases XSS impact; limits browser-side exploit mitigation.',
      remediation: ['Add a strict Content-Security-Policy header.', 'Test for inline-script breakage before enforcing.'],
      verified: false,
    },
    {
      title: 'Verbose Error Message',
      category: 'Information Disclosure',
      cvssScore: 3.7,
      status: 'Potential',
      confidence: 64,
      affectedAssets: ['/api/login'],
      description: 'Login errors may reveal whether an account exists.',
      evidence: 'Controlled login test showed different messages for unknown vs wrong-password cases.',
      impact: 'Assists account enumeration.',
      remediation: ['Return generic authentication failure messages.'],
      verified: false,
    },
  ];
  return raw.map((f) => ({ ...f, severity: severityFromScore(f.cvssScore) }));
}

module.exports = { buildDemoAssets, buildDemoFindings };
