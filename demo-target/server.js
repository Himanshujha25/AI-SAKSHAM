/**
 * SentinelAI Demo Target — INTENTIONALLY VULNERABLE local app.
 * AUTHORIZED LOCAL DEMO ONLY. Never expose to the internet.
 *
 * Run:  node server.js   (listens on http://127.0.0.1:5199)
 * Then in SentinelAI: add target http://127.0.0.1:5199 and start an assessment.
 *
 * Expected findings: missing CSP/HSTS, wildcard CORS, missing rate-limit
 * headers, IDOR on /api/users/:id, SQL error disclosure on /search?q=
 */
const http = require('http');

const PORT = 5199;
const HOST = '127.0.0.1';

const USERS = {
  123: { id: 123, email: 'admin@demo.local', role: 'admin' },
  124: { id: 124, email: 'analyst@demo.local', role: 'analyst' },
};

function weakHeaders(res) {
  // Deliberately weak on purpose (demo): no CSP, no HSTS, wildcard CORS.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Powered-By', 'Express');
}

function send(res, status, body, contentType = 'application/json') {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  weakHeaders(res);
  const u = new URL(req.url, `http://${HOST}:${PORT}`);

  // Home — links help the scanner discover endpoints.
  if (u.pathname === '/' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<html><head><title>Demo Vulnerable App</title></head><body>
      <h1>Demo Vulnerable App (local authorized target)</h1>
      <a href="/api/users/123">user 123</a>
      <a href="/api/users/124">user 124</a>
      <a href="/api/admin/users">admin users</a>
      <a href="/search?q=demo">search</a>
      <a href="/login">login</a>
    </body></html>`);
  }

  // Login — verbose errors (enumeration signal), accepts demo creds.
  if (u.pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let creds = {};
      try { creds = JSON.parse(body || '{}'); } catch (e) { /* ignore */ }
      if (creds.email !== 'admin@demo.local') {
        return send(res, 401, { error: 'Unknown email address. No such account.' });
      }
      if (creds.password !== 'demo1234') {
        return send(res, 401, { error: 'Wrong password for admin@demo.local.' });
      }
      return send(res, 200, { token: 'demo-token-abc', role: 'admin' });
    });
    return;
  }

  // IDOR demo — predictable numeric IDs, zero auth checks (intentional).
  const userMatch = u.pathname.match(/^\/api\/users\/(\d+)$/);
  if (userMatch && req.method === 'GET') {
    const user = USERS[userMatch[1]];
    if (!user) return send(res, 404, { error: 'Not found' });
    return send(res, 200, user);
  }

  // Admin endpoint — no auth check (intentional).
  if (u.pathname === '/api/admin/users' && req.method === 'GET') {
    return send(res, 200, { users: Object.values(USERS) });
  }

  // SQLi demo — quote triggers verbose DB error (intentional).
  if (u.pathname === '/search' && req.method === 'GET') {
    const decoded = decodeURIComponent(u.search);
    if (decoded.includes("'")) {
      return send(res, 500, "Warning: mysql_fetch_array() SQL syntax error near ''' at line 1", 'text/plain');
    }
    return send(res, 200, { results: [] });
  }

  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[demo-target] AUTHORIZED LOCAL DEMO ONLY — http://${HOST}:${PORT}`);
});
