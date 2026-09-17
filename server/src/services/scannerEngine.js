/**
 * Live Security Probing Engine
 * Audits security headers, CORS, server banners, SSL/TLS, custom headers, and extracts live endpoints from HTML/JS.
 * Profiles tune depth: Quick = headers-only fast pass; Standard = full default;
 * Comprehensive = deeper endpoint capture; API Audit = API-focused; Infrastructure = headers/TLS/tech only.
 */
async function safeFetch(urlStr, options = {}) {
  try {
    return await fetch(urlStr, options);
  } catch (err) {
    if (urlStr.includes('localhost') || urlStr.includes('127.0.0.1') || urlStr.includes('[::1]')) {
      const fallbacks = [];
      if (urlStr.includes('localhost')) {
        fallbacks.push(urlStr.replace('localhost', '127.0.0.1'));
        fallbacks.push(urlStr.replace('localhost', '[::1]'));
      } else if (urlStr.includes('127.0.0.1')) {
        fallbacks.push(urlStr.replace('127.0.0.1', 'localhost'));
        fallbacks.push(urlStr.replace('127.0.0.1', '[::1]'));
      } else if (urlStr.includes('[::1]')) {
        fallbacks.push(urlStr.replace('[::1]', 'localhost'));
        fallbacks.push(urlStr.replace('[::1]', '127.0.0.1'));
      }
      for (const altUrl of fallbacks) {
        try {
          return await fetch(altUrl, options);
        } catch (e2) {
          // continue fallback loop
        }
      }
    }
    throw err;
  }
}

async function scanTarget(targetUrl, customHeadersString = '', profile = 'Standard', httpMethod = 'GET', requestBodyString = '') {
  const assets = [];
  const findings = [];
  // Endpoint capture depth + active screens per audit profile
  const DEPTH = profile === 'Quick' ? 3 : profile === 'Comprehensive' ? 12 : 6;
  const SCREENS_ON = !['Quick', 'Infrastructure'].includes(profile);
  let normalizedUrl = targetUrl;

  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (e) {
    parsedUrl = { hostname: 'target.local', protocol: 'https:' };
  }

  const hostname = parsedUrl.hostname || 'target.local';
  const isHttps = parsedUrl.protocol === 'https:';

  // Build HTTP Request Headers
  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Origin': parsedUrl.protocol + '//' + hostname,
  };

  // Set default Content-Type to application/json if sending a payload and not specified
  const effectiveMethod = (httpMethod || 'GET').toUpperCase();
  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(effectiveMethod) && requestBodyString && requestBodyString.trim().length > 0;
  if (hasBody) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  function sanitizeHeaderPair(rawKey, rawVal) {
    if (!rawKey || typeof rawKey !== 'string') return null;
    let cleanKey = rawKey.trim().replace(/^["'`\s]+|["'`\s]+$/g, '');
    cleanKey = cleanKey.replace(/[^\w-]/g, '');
    if (!cleanKey) return null;

    let cleanVal = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal || '').trim();
    if ((cleanVal.startsWith('"') && cleanVal.endsWith('"')) || (cleanVal.startsWith("'") && cleanVal.endsWith("'"))) {
      cleanVal = cleanVal.slice(1, -1).trim();
    }
    cleanVal = cleanVal.replace(/[\r\n]/g, '');
    
    if (cleanKey.toLowerCase() === 'authorization' && cleanVal.length > 0) {
      if (!/^Bearer\s+/i.test(cleanVal) && !/^(Basic|Digest)\s+/i.test(cleanVal)) {
        cleanVal = 'Bearer ' + cleanVal;
      }
    }

    return { key: cleanKey, val: cleanVal };
  }

  // Parse custom user headers (e.g. Bearer token, Cookie, Admin Key)
  if (customHeadersString && typeof customHeadersString === 'string') {
    try {
      const trimmed = customHeadersString.trim();
      if (trimmed.startsWith('{')) {
        const parsedObj = JSON.parse(trimmed);
        for (const [k, v] of Object.entries(parsedObj)) {
          const sanitized = sanitizeHeaderPair(k, v);
          if (sanitized) reqHeaders[sanitized.key] = sanitized.val;
        }
      } else {
        trimmed.split('\n').forEach((line) => {
          let cleanLine = line.replace(/^\s*-H\s+/i, '').trim();
          if ((cleanLine.startsWith('"') && cleanLine.endsWith('"')) || (cleanLine.startsWith("'") && cleanLine.endsWith("'"))) {
            cleanLine = cleanLine.slice(1, -1).trim();
          }
          const colonIdx = cleanLine.indexOf(':');
          if (colonIdx > 0) {
            const key = cleanLine.substring(0, colonIdx);
            const val = cleanLine.substring(colonIdx + 1);
            const sanitized = sanitizeHeaderPair(key, val);
            if (sanitized) reqHeaders[sanitized.key] = sanitized.val;
          }
        });
      }
    } catch (err) {
      console.warn('[scanner] Error parsing custom headers:', err.message);
    }
  }

  let response = null;
  let responseText = '';
  let errorMsg = null;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const fetchOptions = {
      method: effectiveMethod,
      signal: controller.signal,
      redirect: 'follow',
      headers: reqHeaders,
    };
    if (hasBody) {
      fetchOptions.body = requestBodyString;
    }
    response = await safeFetch(normalizedUrl, fetchOptions);
    clearTimeout(timeoutId);
    try {
      responseText = await response.text();
    } catch (e) {
      // body read error ignored
    }
  } catch (err) {
    errorMsg = err.message;
  }

  const responseTimeMs = Date.now() - startTime;

  // Asset 1: Primary Target Endpoint
  assets.push({
    name: `${hostname} (Root Target)`,
    type: 'api',
    url: normalizedUrl,
    value: normalizedUrl,
    method: effectiveMethod,
    authentication: reqHeaders.Authorization || reqHeaders.authorization || reqHeaders.Cookie ? 'Required' : 'Public',
    metadata: {
      status: response ? response.status : 'UNREACHABLE',
      statusText: response ? (response.statusText || 'OK') : (errorMsg || 'Connection Failed'),
      latencyMs: responseTimeMs,
      error: errorMsg,
      requestMethod: effectiveMethod,
      requestHeaders: reqHeaders,
      requestBody: hasBody ? requestBodyString : null,
      responseHeaders: {},
      responseBody: '',
    },
  });

  if (!response) {
    findings.push({
      title: 'Target Application Unreachable or Connection Timed Out',
      category: 'Network Reachability',
      severity: 'Low',
      cvssScore: 3.1,
      affectedAssets: [normalizedUrl],
      evidence: `HTTP connection to ${normalizedUrl} failed: ${errorMsg}`,
      impact: 'Automated scanners cannot perform active HTTP probing when target is offline or blocking requests.',
      status: 'Potential',
    });
    return { assets, findings };
  }

  const headers = {};
  if (response.headers) {
    if (typeof response.headers.forEach === 'function') {
      response.headers.forEach((val, key) => { headers[key.toLowerCase()] = val; });
    } else {
      Object.keys(response.headers).forEach((k) => { headers[k.toLowerCase()] = response.headers[k]; });
    }
  }
  const status = response.status;
  const body = responseText || '';

  // Attach response payload and headers to Root Target asset metadata for modal inspection
  if (assets.length > 0) {
    assets[0].metadata.status = status;
    assets[0].metadata.statusText = response.statusText || (status === 200 ? 'OK' : `HTTP ${status}`);
    assets[0].metadata.responseBody = body;
    assets[0].metadata.responseHeaders = headers;
  }

  // Flag probe errors if target responded with HTTP 4xx/5xx (e.g. 405 Method Not Allowed, 401, 403)
  if (status >= 400) {
    let faultTitle = `Target Returned HTTP ${status} Error`;
    let faultSeverity = 'Medium';
    let faultImpact = `The target API rejected the probe request with HTTP ${status}.`;
    let faultRemediation = ['Verify HTTP Method, Bearer token/API key, and target route configuration.'];

    if (status === 405) {
      faultTitle = 'Target Method Mismatch (HTTP 405 Method Not Allowed)';
      faultSeverity = 'High';
      faultImpact = `Target endpoint does not accept ${effectiveMethod} requests (HTTP 405 Method Not Allowed). Verify endpoint routing.`;
      faultRemediation = [
        'Switch the HTTP Method to GET (or appropriate method) in Step 1 of the assessment setup.',
        'Verify API route documentation for allowed HTTP methods.',
      ];
    } else if (status === 401 || status === 403) {
      faultTitle = `Target Authentication Failure (HTTP ${status})`;
      faultSeverity = 'High';
      faultImpact = `Target endpoint rejected automated security check due to missing or invalid authentication credentials (HTTP ${status}).`;
      faultRemediation = [
        'Check Bearer JWT session token or Developer API Key in Step 2 of the assessment setup.',
        'Ensure token has not expired and has permissions to access target asset.',
      ];
    } else if (status === 404) {
      faultTitle = 'Target Route Not Found (HTTP 404)';
      faultSeverity = 'Medium';
      faultImpact = `Target endpoint path returned HTTP 404 Not Found at ${normalizedUrl}.`;
      faultRemediation = [
        'Verify target URL endpoint path and ensure local API server is active.',
      ];
    }

    findings.push({
      title: faultTitle,
      category: 'API Configuration & Protocol Error',
      severity: faultSeverity,
      cvssScore: status === 405 || status === 401 || status === 403 ? 7.2 : 5.0,
      cwe: 'CWE-200',
      owasp: 'A05:2021',
      affectedAssets: [normalizedUrl],
      evidence: `HTTP/${status} - Target server responded: "${body ? body.slice(0, 250) : 'Method Not Allowed / Auth Error'}"`,
      impact: faultImpact,
      status: 'Verified',
      remediation: faultRemediation,
      httpTrace: { method: effectiveMethod, url: normalizedUrl, statusCode: status },
    });
  }

  // 1. Security Header Audits
  // A. Content-Security-Policy
  const csp = headers['content-security-policy'];
  assets.push({ name: 'Content-Security-Policy', type: 'header', value: csp ? csp.slice(0, 60) + '...' : 'MISSING', method: 'ANY', authentication: 'Public' });
  if (!csp) {
    findings.push({
      title: 'Missing Content-Security-Policy (CSP) Header',
      category: 'Security Misconfiguration',
      severity: 'Medium',
      cvssScore: 5.4,
      cwe: 'CWE-693',
      owasp: 'A05:2021',
      affectedAssets: [normalizedUrl],
      evidence: `HTTP/${response.status} - Content-Security-Policy header is absent from server response.`,
      impact: 'Without CSP, the application is vulnerable to Cross-Site Scripting (XSS) and data injection.',
      status: 'Verified',
      remediation: ['Define a strict Content-Security-Policy header.'],
      httpTrace: { method: 'GET', url: normalizedUrl, statusCode: status },
    });
  }

  // B. Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  assets.push({ name: 'Strict-Transport-Security', type: 'header', value: hsts || 'MISSING', method: 'ANY', authentication: 'Public' });
  if (isHttps && !hsts) {
    findings.push({
      title: 'Missing HTTP Strict-Transport-Security (HSTS)',
      category: 'Security Misconfiguration',
      severity: 'Medium',
      cvssScore: 5.3,
      cwe: 'CWE-319',
      owasp: 'A02:2021',
      affectedAssets: [normalizedUrl],
      evidence: `HTTPS response from ${hostname} lacks Strict-Transport-Security header.`,
      impact: 'Users may be subjected to SSL-stripping and downgrade attacks.',
      status: 'Verified',
      remediation: ['Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'],
      httpTrace: { method: 'GET', url: normalizedUrl, statusCode: status },
    });
  }

  // E. CORS wildcard policy (missing/weak access control on APIs)
  const acao = headers['access-control-allow-origin'];
  assets.push({ name: 'Access-Control-Allow-Origin', type: 'header', value: acao || 'MISSING', method: 'ANY', authentication: 'Public' });
  if (acao && acao.trim() === '*') {
    findings.push({
      title: 'Permissive CORS Policy (Wildcard Origin)',
      category: 'Security Misconfiguration',
      severity: 'Medium',
      cvssScore: 6.1,
      cwe: 'CWE-942',
      owasp: 'A01:2021',
      affectedAssets: [normalizedUrl],
      evidence: `Server responds with Access-Control-Allow-Origin: * — any origin can read cross-origin responses.`,
      impact: 'Sensitive API data may be exfiltrated by malicious third-party origins.',
      status: 'Verified',
      remediation: ['Replace wildcard with an explicit allow-list of trusted origins.', 'Avoid reflecting arbitrary Origin headers with credentials allowed.'],
      httpTrace: { method: 'GET', url: normalizedUrl, statusCode: status },
    });
  }

  // F. Rate-limiting headers (API abuse / brute-force protection signal)
  const rateLimit = headers['x-ratelimit-limit'] || headers['ratelimit-limit'] || headers['x-rate-limit-limit'];
  assets.push({ name: 'Rate-Limit Headers', type: 'header', value: rateLimit ? String(rateLimit) : 'MISSING', method: 'ANY', authentication: 'Public' });
  if (!rateLimit) {
    findings.push({
      title: 'Missing Rate-Limiting Headers',
      category: 'Security Misconfiguration',
      severity: 'Low',
      cvssScore: 3.7,
      cwe: 'CWE-770',
      owasp: 'A04:2021',
      affectedAssets: [normalizedUrl],
      evidence: `No X-RateLimit-Limit / RateLimit-Limit header observed on ${hostname} responses.`,
      impact: 'APIs without visible rate limiting are easier to abuse via brute-force or enumeration.',
      status: 'Potential',
      remediation: ['Emit rate-limit headers (RateLimit-Limit, RateLimit-Remaining, Retry-After).', 'Enforce server-side throttling on auth and sensitive endpoints.'],
      httpTrace: { method: 'GET', url: normalizedUrl, statusCode: status },
    });
  }

  // C. X-Frame-Options
  const xfo = headers['x-frame-options'];
  assets.push({ name: 'X-Frame-Options', type: 'header', value: xfo || 'MISSING', method: 'ANY', authentication: 'Public' });

  // D. Server Fingerprint & Tech Detection
  const serverHeader = headers['server'] || headers['x-powered-by'] || headers['via'];
  if (serverHeader) {
    assets.push({ name: String(serverHeader), type: 'technology', value: String(serverHeader), method: 'ANY', authentication: 'Public' });
  }

  // Detect frameworks in body
  if (body.includes('__NEXT_DATA__') || body.includes('/_next/')) {
    assets.push({ name: 'Next.js Framework', type: 'technology', value: 'Next.js', method: 'ANY', authentication: 'Public' });
  } else if (body.includes('react') || body.includes('react-dom')) {
    assets.push({ name: 'React Frontend', type: 'technology', value: 'React', method: 'ANY', authentication: 'Public' });
  }

  // 2. HTML & Asset Extraction
  if (body && typeof body === 'string') {
    // Extract Script Bundles (JS Assets)
    const scriptMatches = body.match(/<script[^>]+src=["']([^"']+)["']/gi) || [];
    const jsUrls = new Set();
    scriptMatches.forEach((m) => {
      const match = m.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) jsUrls.add(match[1]);
    });

    Array.from(jsUrls).slice(0, DEPTH).forEach((jsPath) => {
      assets.push({
        name: `JS Asset: ${jsPath.slice(0, 45)}`,
        type: 'js',
        value: jsPath,
        method: 'GET',
        authentication: 'Public',
      });
    });

    // Extract Hyperlink Routes
    const linkMatches = body.match(/<a[^>]+href=["']([^"']+)["']/gi) || [];
    const routes = new Set();
    linkMatches.forEach((m) => {
      const match = m.match(/href=["']([^"']+)["']/i);
      if (match && match[1]) {
        const href = match[1];
        if (href.startsWith('/') || href.startsWith('http')) {
          routes.add(href);
        }
      }
    });

    Array.from(routes).slice(0, DEPTH).forEach((route) => {
      assets.push({
        name: `Route: ${route.slice(0, 40)}`,
        type: 'route',
        value: route,
        method: 'GET',
        authentication: 'Public',
      });
    });

    // Regex extract API endpoints in body text
    const apiRegex = /(?:\/api\/|\/v1\/|\/v2\/|\/auth\/|\/admin\/|\/graphql)[a-zA-Z0-9_\-\/]+/g;
    const apiMatches = new Set(body.match(apiRegex) || []);

    Array.from(apiMatches).slice(0, DEPTH).forEach((apiRoute) => {
      assets.push({
        name: `API Endpoint: ${apiRoute}`,
        type: 'api',
        value: apiRoute,
        method: apiRoute.includes('auth') || apiRoute.includes('login') ? 'POST' : 'GET',
        authentication: apiRoute.includes('admin') ? 'Admin' : apiRoute.includes('auth') ? 'Public' : 'Required',
      });
    });
  }

  // 3. Active access-control & injection screens.
  // Doctrine: read-only GET probes only, same-origin, tightly capped.
  // A flag here is a SCREENING SIGNAL (status Under Review) — the analyst
  // confirms exploitability in the /api-tester RBAC sandbox, never the scanner.
  const baseOrigin = (() => { try { return new URL(normalizedUrl).origin; } catch (e) { return null; } })();

  async function probeGet(url, useAuth) {
    const headers = { ...reqHeaders };
    if (!useAuth) {
      Object.keys(headers).forEach((k) => {
        if (/^(authorization|cookie|x-api-key)$/i.test(k)) delete headers[k];
      });
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const r = await safeFetch(url, { signal: controller.signal, redirect: 'follow', headers });
      clearTimeout(timeoutId);
      let text = '';
      try { text = (await r.text()).slice(0, 8000); } catch (e) { /* ignore */ }
      return { status: r.status, text };
    } catch (e) {
      return { status: null, text: '', error: e.message };
    }
  }

  function toAbsolute(p) {
    if (!p || !baseOrigin) return null;
    try {
      const u = new URL(p, baseOrigin);
      return u.origin === baseOrigin ? u.toString() : null;
    } catch (e) {
      return null;
    }
  }

  // Collect discovered endpoint paths from assets (api + route types)
  const discoveredPaths = [];
  for (const a of assets) {
    const v = a.value || a.url || '';
    if ((a.type === 'api' || a.type === 'route') && typeof v === 'string' && v.startsWith('/')) {
      if (!discoveredPaths.includes(v)) discoveredPaths.push(v);
    }
  }

  // 3A. IDOR / BOLA screen (skipped on Quick + Infrastructure profiles)
  const idorCandidates = SCREENS_ON ? discoveredPaths
    .filter((p) => /\/\d+(\/|$|\?)|\bids?=\d+/i.test(p))
    .slice(0, 3) : [];
  for (const p of idorCandidates) {
    const abs = toAbsolute(p);
    if (!abs) continue;
    const probe = await probeGet(abs, false);
    if (probe.status === 200 && probe.text) {
      const looksJson = /^\s*[\[{]/.test(probe.text);
      const hasIdKeys = /"(id|userId|user_id|accountId|owner|email|role)"\s*:/i.test(probe.text);
      const looksLogin = /login|sign in|unauthorized|access denied/i.test(probe.text.slice(0, 500));
      if ((looksJson || hasIdKeys) && !looksLogin) {
        findings.push({
          title: 'Direct Object Reference Reachable Without Authentication (IDOR Screen)',
          category: 'Broken Access Control',
          severity: 'High',
          cvssScore: 7.5,
          cwe: 'CWE-639',
          owasp: 'A01:2021',
          affectedAssets: [p],
          evidence: `Unauthenticated GET ${p} returned HTTP 200 with object-like data: ${probe.text.slice(0, 300)}`,
          impact: 'Object-level data may be readable without authentication; confirm cross-account access in the API Tester sandbox.',
          status: 'Under Review',
          remediation: ['Enforce ownership checks on every object ID parameter.', 'Use unpredictable identifiers (UUIDs) for sensitive objects.', 'Re-test with low-privilege vs admin tokens in /api-tester.'],
          httpTrace: { method: 'GET', url: p, statusCode: 200 },
        });
      }
    }
  }

  // 3B. SQL injection screen: single-quote probe, DB error-message signal only.
  // No UNION dumping, no stacked queries, no destructive payloads — one quote character.
  const SQL_ERROR_RE = /SQL syntax|mysql_|mysqli_|ORA-\d+|SQLite|sqlite3|psycopg2|pg_query|ODBC|JDBC|Unclosed quotation|quoted string not properly terminated|SQLSTATE/i;
  const sqliCandidates = SCREENS_ON ? discoveredPaths.filter((p) => p.includes('?')).slice(0, 3) : [];
  for (const p of sqliCandidates) {
    const abs = toAbsolute(p);
    if (!abs) continue;
    // Note: quote sent URL-encoded (%27) — Node fetch rejects raw quotes.
    const probe = await probeGet(`${abs}%27`, true);
    if (probe.status && SQL_ERROR_RE.test(probe.text)) {
      const snippet = (probe.text.match(/.{0,60}SQL.{0,160}/i) || [probe.text.slice(0, 220)])[0];
      findings.push({
        title: 'Possible SQL Injection (Database Error Disclosure)',
        category: 'Injection',
        severity: 'High',
        cvssScore: 8.0,
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        affectedAssets: [p],
        evidence: `Appending a single quote to ${p} triggered a database error signature (HTTP ${probe.status}): ${snippet.slice(0, 300)}`,
        impact: 'Error-message disclosure suggests unsanitized input reaching SQL; confirm exploitability manually in a controlled test.',
        status: 'Under Review',
        remediation: ['Use parameterized queries / ORM bindings everywhere.', 'Suppress verbose database errors in responses.', 'Apply least-privilege DB credentials.'],
        httpTrace: { method: 'GET', url: `${p}'`, statusCode: probe.status },
      });
    }
  }

  // 3C. Unauthenticated API Probe (Bypassing Auth on Protected Route)
  if (reqHeaders.Authorization || reqHeaders.authorization || reqHeaders['X-API-Key'] || reqHeaders['x-api-key']) {
    const unauthProbe = await probeGet(normalizedUrl, false);
    if (unauthProbe.status === 200) {
      findings.push({
        title: 'Broken Authentication: API Endpoint Accessible Without Credentials',
        category: 'Broken Authentication',
        severity: 'Critical',
        cvssScore: 9.1,
        cwe: 'CWE-306',
        owasp: 'A07:2021',
        affectedAssets: [normalizedUrl],
        evidence: `Unauthenticated request to ${normalizedUrl} returned HTTP 200 OK without valid Authorization header or API Key.`,
        impact: 'Attacking users can access internal system resources or data payloads without authenticating.',
        status: 'Verified',
        remediation: [
          'Enforce authentication middleware on all API routes.',
          'Reject requests missing valid Authorization Bearer tokens or X-API-Key headers with HTTP 401 Unauthorized.',
        ],
        httpTrace: { method: effectiveMethod, url: normalizedUrl, statusCode: 200 },
      });
    }
  }

  // 3D. Sensitive Server Header Information Disclosure
  const sensitiveHeaders = ['server', 'x-powered-by', 'x-aspnet-version', 'via'];
  const leakedHeaders = sensitiveHeaders.filter((h) => headers[h]);
  if (leakedHeaders.length > 0) {
    findings.push({
      title: 'Information Disclosure via Server & Framework Headers',
      category: 'Information Disclosure',
      severity: 'Low',
      cvssScore: 3.3,
      cwe: 'CWE-200',
      owasp: 'A05:2021',
      affectedAssets: [normalizedUrl],
      evidence: `Server emitted identifying banner headers: ${leakedHeaders.map((h) => `${h}: ${headers[h]}`).join(', ')}`,
      impact: 'Exposing backend framework versions simplifies target reconnaissance and automated vulnerability scanning by adversaries.',
      status: 'Verified',
      remediation: [
        'Strip Server and X-Powered-By response headers in web server configuration (e.g. app.disable("x-powered-by")).',
      ],
      httpTrace: { method: effectiveMethod, url: normalizedUrl, statusCode: status },
    });
  }

  // 3E. Permissive CORS with Credentials Allowed
  const acac = headers['access-control-allow-credentials'];
  if (acao && acac && (acao === '*' || acac === 'true')) {
    findings.push({
      title: 'Insecure CORS Configuration (Credentials Allowed with Wildcard Origin)',
      category: 'Security Misconfiguration',
      severity: 'High',
      cvssScore: 7.5,
      cwe: 'CWE-942',
      owasp: 'A01:2021',
      affectedAssets: [normalizedUrl],
      evidence: `Access-Control-Allow-Origin: ${acao} combined with Access-Control-Allow-Credentials: ${acac}`,
      impact: 'Browsers may permit cross-origin sites to execute authenticated requests and harvest sensitive user data.',
      status: 'Verified',
      remediation: [
        'Do not combine Access-Control-Allow-Credentials: true with wildcard origins.',
        'Use explicit, trusted origin whitelists for CORS configuration.',
      ],
      httpTrace: { method: effectiveMethod, url: normalizedUrl, statusCode: status },
    });
  }

  return { assets, findings };
}

module.exports = { scanTarget };
