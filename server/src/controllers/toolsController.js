const axios = require('axios');
const Activity = require('../models/Activity');
const { asyncHandler } = require('../middleware/errors');
const { logActivity } = require('../utils/security');

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
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ message: 'Invalid URL' });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ message: 'Only http(s) URLs are allowed' });
  }

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
        'User-Agent': 'SentinelAI-Probe/1.0 (Authorized Security Assessment)',
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

module.exports = { probe };
