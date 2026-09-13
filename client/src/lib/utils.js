export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function errMsg(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback;
}

// Post-login landing page: only same-app paths, never external URLs.
export function safeNext(raw) {
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}

// Build a reproducible PoC cURL command from a finding's HTTP trace.
// Safe-by-design: GET/HEAD only snapshots; analyst edits before running.
export function buildCurl(finding = {}) {
  const trace = finding.httpTrace || {};
  const method = (trace.method || finding.httpMethod || 'GET').toUpperCase();
  const rawUrl = trace.url || (finding.affectedAssets || [])[0] || '';
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://authorized-target.example${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  const parts = [`curl -X ${method} '${url}'`];
  parts.push(`-H 'User-Agent: SakshamAI-PoC/1.0 (Authorized Assessment)'`);
  if (finding.evidence && /bearer/i.test(finding.evidence)) {
    parts.push(`-H 'Authorization: Bearer <paste-analyst-token>'`);
  }
  return parts.join(' \\\n  ');
}

// Human countdown to an SLA deadline: "22h left" / "OVERDUE by 3d".
export function slaCountdown(iso) {
  if (!iso) return { text: 'No SLA', overdue: false };
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const formatted = d > 0 ? `${d}d ${h}h` : `${h}h`;
  return diff < 0
    ? { text: `OVERDUE by ${formatted}`, overdue: true }
    : { text: `${formatted} left`, overdue: false };
}

// Parse raw cURL command strings into structured method, url, headers, and body
export function parseCurlCommand(curlStr) {
  if (!curlStr || typeof curlStr !== 'string') return null;
  const result = {
    method: 'GET',
    url: '',
    headers: '',
    body: '',
  };

  const cleaned = curlStr.replace(/[\`\\\r\n]+/g, ' ').trim();

  // Extract URL
  const urlMatch = cleaned.match(/https?:\/\/[^\s"']+/i);
  if (urlMatch) {
    result.url = urlMatch[0];
  }

  // Extract Method
  const methodMatch = cleaned.match(/-X\s+([A-Z]+)/i) || cleaned.match(/--request\s+([A-Z]+)/i);
  if (methodMatch) {
    result.method = methodMatch[1].toUpperCase();
  } else if (cleaned.includes('-d ') || cleaned.includes('--data')) {
    result.method = 'POST';
  }

  // Extract Headers
  const headerRegex = /(?:-H|--header)\s+["']?([^"'\n]+)["']?/gi;
  let hMatch;
  const headerList = [];
  while ((hMatch = headerRegex.exec(cleaned)) !== null) {
    if (hMatch[1]) {
      headerList.push(hMatch[1].trim());
    }
  }
  result.headers = headerList.join('\n');

  // Extract Body Data
  const dataMatch = cleaned.match(/(?:-d|--data|--data-raw)\s+['"]?(\{[\s\S]*\}|[^"'\n]+)['"]?/i);
  if (dataMatch) {
    result.body = dataMatch[1].trim();
  }

  return result;
}
