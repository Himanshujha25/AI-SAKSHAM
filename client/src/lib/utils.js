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
  const text = d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((abs % 3600000) / 60000)}m`;
  return diff < 0
    ? { text: `OVERDUE by ${text}`, overdue: true }
    : { text: `${text} left`, overdue: false };
}
