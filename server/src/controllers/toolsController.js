const axios = require('axios');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');

const { validateSafeUrl } = require('../utils/ssrfGuard');

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const TIMEOUT_MS = 10000;
const MAX_BODY = 50 * 1024; // 50KB cap

// POST /api/v1/tools/probe { url, method, headers, projectId? }
// Server-side RBAC/IDOR probe helper: runs an authorized read-only style
// request from the backend (avoids browser CORS) and returns a safe,
// truncated trace for evidence. Destructive testing stays out of scope.
const probe = asyncHandler(async (req, res) => {
  const { url, method = 'GET', headers = {}, projectId, data: requestData } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'url is required' });
  }
  const verb = String(method).toUpperCase();
  if (!ALLOWED_METHODS.includes(verb)) {
    return res.status(400).json({ message: `method must be one of ${ALLOWED_METHODS.join(', ')}` });
  }

  // Enforce SSRF validation
  try {
    await validateSafeUrl(url, { allowLocalhost: process.env.NODE_ENV !== 'production' });
  } catch (err) {
    return res.status(400).json({ message: `Security violation: ${err.message}` });
  }

  let parsed = new URL(url);

  const safeHeaders = {};
  if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers).slice(0, 20)) {
      if (/^[\w-]+$/.test(k) && typeof v === 'string' && v.length < 4096) {
        safeHeaders[k] = v;
      }
    }
  }

  if (['POST', 'PUT', 'PATCH'].includes(verb) && requestData && !safeHeaders['Content-Type'] && !safeHeaders['content-type']) {
    safeHeaders['Content-Type'] = 'application/json';
  }

  const started = Date.now();
  try {
    const resp = await axios.request({
      url: parsed.toString(),
      method: verb,
      data: requestData || undefined,
      headers: {
        'User-Agent': 'SakshamAI-Probe/1.0 (Authorized Security Assessment)',
        ...safeHeaders,
      },
      timeout: TIMEOUT_MS,
      maxBodyLength: MAX_BODY,
      maxContentLength: MAX_BODY,
      validateStatus: () => true,
      maxRedirects: 3,
    });
    const ms = Date.now() - started;
    let bodySnippet = '';
    try {
      const raw = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      bodySnippet = String(raw).slice(0, 2000);
    } catch (e) {
      bodySnippet = '[unprintable body]';
    }
    const outHeaders = {};
    for (const [k, v] of Object.entries(resp.headers || {})) outHeaders[k] = String(v).slice(0, 500);

    await logActivity(Activity, {
      projectId: projectId || null,
      actor: req.user._id,
      action: 'API Probe',
      detail: `${verb} ${parsed.hostname} → ${resp.status} in ${ms}ms`,
    });

    res.json({
      url: parsed.toString(),
      method: verb,
      status: resp.status,
      ms,
      headers: outHeaders,
      bodySnippet,
      truncated: (resp.headers?.['content-length'] || 0) > MAX_BODY,
    });
  } catch (err) {
    const ms = Date.now() - started;
    res.json({ url: parsed.toString(), method: verb, status: null, ms, error: err.message, headers: {}, bodySnippet: '' });
  }
});

// POST /api/v1/tools/probe-bulk
// Runs 1-click batch security test across multiple API endpoints concurrently
const probeBulk = asyncHandler(async (req, res) => {
  const { targets = [], globalHeaders = {}, bearerToken = '', apiKey = '', projectId } = req.body || {};

  if (!Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ message: 'targets array is required and must not be empty' });
  }

  // Cap at 50 targets per single run for non-destructive concurrency
  const batch = targets.slice(0, 50);

  const cleanBearer = String(bearerToken || '').trim().replace(/^Bearer\s+/i, '');
  const cleanApiKey = String(apiKey || '').trim().replace(/^X-API-Key:\s*/i, '');

  const defaultHeaders = { ...globalHeaders };
  if (cleanBearer) {
    defaultHeaders['Authorization'] = `Bearer ${cleanBearer}`;
  }
  if (cleanApiKey) {
    defaultHeaders['X-API-Key'] = cleanApiKey;
    defaultHeaders['X-WorldMonitor-Key'] = cleanApiKey;
  }

  const startedAll = Date.now();

  const executeItem = async (t) => {
    let url = typeof t === 'string' ? t.trim() : (t.url || '').trim();
    let method = typeof t === 'string' ? 'GET' : (t.method || 'GET');
    const itemHeaders = typeof t === 'object' && t.headers ? t.headers : {};
    const requestData = typeof t === 'object' ? t.data : undefined;

    // Detect method prefix if line is formatted like "POST https://..."
    const methodMatch = url.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(https?:\/\/.+)$/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
      url = methodMatch[2].trim();
    }

    const verb = String(method).toUpperCase();

    if (!url) {
      return { url: '(empty)', method: verb, status: null, ms: 0, error: 'Empty URL', security: {} };
    }

    // SSRF validation
    try {
      await validateSafeUrl(url, { allowLocalhost: process.env.NODE_ENV !== 'production' });
    } catch (err) {
      return { url, method: verb, status: null, ms: 0, error: `Blocked: ${err.message}`, security: {} };
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return { url, method: verb, status: null, ms: 0, error: 'Invalid URL format', security: {} };
    }

    const combinedHeaders = {
      'User-Agent': 'SakshamAI-BulkProbe/1.0 (Authorized Security Assessment)',
      ...defaultHeaders,
      ...itemHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(verb) && requestData && !combinedHeaders['Content-Type']) {
      combinedHeaders['Content-Type'] = 'application/json';
    }

    const startOne = Date.now();
    try {
      const resp = await axios.request({
        url: parsed.toString(),
        method: verb,
        data: requestData || undefined,
        headers: combinedHeaders,
        timeout: TIMEOUT_MS,
        maxBodyLength: MAX_BODY,
        maxContentLength: MAX_BODY,
        validateStatus: () => true,
        maxRedirects: 3,
      });
      const ms = Date.now() - startOne;

      let bodySnippet = '';
      try {
        const raw = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
        bodySnippet = String(raw).slice(0, 2000);
      } catch (e) {
        bodySnippet = '';
      }

      const h = resp.headers || {};
      const security = {
        hasHsts: Boolean(h['strict-transport-security']),
        hasCsp: Boolean(h['content-security-policy']),
        hasCors: Boolean(h['access-control-allow-origin']),
        corsValue: h['access-control-allow-origin'] || 'None',
        hasXContentType: Boolean(h['x-content-type-options']),
        hasXFrame: Boolean(h['x-frame-options']),
        server: h['server'] || 'Hidden',
      };

      return {
        url: parsed.toString(),
        method: verb,
        status: resp.status,
        statusText: resp.statusText || String(resp.status),
        ms,
        security,
        bodySnippet,
        error: null,
      };
    } catch (err) {
      const ms = Date.now() - startOne;
      return {
        url: parsed.toString(),
        method: verb,
        status: null,
        statusText: 'Connection Refused / Network Error',
        ms,
        security: {},
        bodySnippet: '',
        error: err.message,
      };
    }
  };

  // Safe concurrency pool: execute in chunks of 5 to prevent file descriptor and socket exhaustion
  const CONCURRENCY = 5;
  const results = [];
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(executeItem));
    results.push(...chunkResults);
  }

  const totalMs = Date.now() - startedAll;
  const successful = results.filter((r) => r.status && r.status < 400).length;
  const clientErrors = results.filter((r) => r.status && r.status >= 400 && r.status < 500).length;
  const serverErrors = results.filter((r) => (r.status && r.status >= 500) || r.error).length;
  const avgMs = Math.round(results.reduce((acc, r) => acc + (r.ms || 0), 0) / Math.max(1, results.length));

  await logActivity(Activity, {
    projectId: projectId || null,
    actor: req.user._id,
    action: 'Bulk API Assessment',
    detail: `Tested ${results.length} endpoints in 1 run (${successful} OK, ${clientErrors} 4xx, ${serverErrors} failed) in ${totalMs}ms`,
  });

  res.json({
    total: results.length,
    successful,
    clientErrors,
    serverErrors,
    avgMs,
    totalMs,
    results,
  });
});

module.exports = { probe, probeBulk };
