import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FlaskConical, FlaskRound, Play, Scale, ShieldCheck, Timer,
  Database, ScrollText, Layers, CheckCircle2, AlertTriangle,
  XCircle, Copy, Check, Download, Zap, RefreshCw, Globe, Lock,
  FileCode, ExternalLink, ArrowRight, ShieldAlert, X, Eye, EyeOff
} from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import { PageHeader, LoadingState, EmptyState, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input, Select, Label } from '../../components/ui/primitives';

export const VALID_DEMO_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjFhMmIzYzRkNWU2ZjdhOGI5YzBkMSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4OTY2NDEwMiwiZXhwIjoxNzkyMjU2MTAyfQ.u2f88k_P20gVXXJN6IYBq4irL-8MY2gDTJM6UYi2WeE';



function ResultPane({ title, tokenLabel, result, busy, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-md transition hover:border-slate-300 dark:hover:border-slate-700/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
          {title} · <span className="text-blue-600 dark:text-cyan-300">{tokenLabel}</span>
        </p>
        <PremiumIcon icon={ShieldCheck} tone={tone || 'cyan'} size="sm" />
      </div>
      {busy && <LoadingState label="Probing…" />}
      {!busy && !result && <EmptyState title="No result yet" hint="Run the security test to compare." icon={Database} />}
      {!busy && result && (
        <div className="space-y-2.5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              'rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold',
              result.status >= 200 && result.status < 300 ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : result.status >= 400 && result.status < 500 ? 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300'
            )}>
              {result.status ?? 'ERR'}
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">{result.ms}ms</span>
            {result.error && <span className="truncate font-mono text-[11px] text-red-600 dark:text-red-400">{result.error}</span>}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">Headers ({Object.keys(result.headers || {}).length})</summary>
            <pre className="mt-1.5 max-h-40 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200">
              {JSON.stringify(result.headers || {}, null, 1)}
            </pre>
          </details>
          <details className="text-xs" open>
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">Body snippet</summary>
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200">
              {result.bodySnippet || '(empty)'}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export function ApiTester() {
  const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' | 'single'

  // Single / RBAC state
  const [form, setForm] = useState({ url: '', method: 'GET', tokenA: '', tokenB: '', bodyData: '' });
  const [resA, setResA] = useState(null);
  const [resB, setResB] = useState(null);

  // Bulk test state with real dynamic endpoints returning passes (200), auth challenges (401), forbidden (403), not found (404), and server error (500)
  const [bulkInput, setBulkInput] = useState(
`GET http://localhost:5000/health
GET https://dummyjson.com/products/1
GET https://jsonplaceholder.typicode.com/posts/1
GET http://localhost:5000/api/v1/auth/me
GET https://dummyjson.com/auth/RESOURCE_THAT_NEEDS_AUTH
GET https://httpbin.org/status/403
GET https://jsonplaceholder.typicode.com/posts/999999
GET https://httpbin.org/status/500`
  );
  const [bulkBearer, setBulkBearer] = useState(VALID_DEMO_JWT);
  const [bulkApiKey, setBulkApiKey] = useState('saksham_sec_live_948fbc2189a0');
  const [showBearer, setShowBearer] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTokenA, setShowTokenA] = useState(false);
  const [showTokenB, setShowTokenB] = useState(false);
  const [bulkData, setBulkData] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  const handleInsertToken = () => {
    const activeToken = localStorage.getItem('saksham_ai_token') || VALID_DEMO_JWT;
    setBulkBearer(activeToken);
    setShowBearer(true);
  };

  // Single probe mutation
  const run = useMutation({
    mutationFn: async ({ token, headers: customHdrs }) => {
      const rawToken = (token || '').trim();
      const cleanToken = rawToken.replace(/^Bearer\s+/i, '');
      
      const reqHeaders = { ...customHdrs };

      if (cleanToken) {
        reqHeaders['Authorization'] = `Bearer ${cleanToken}`;
        reqHeaders['X-API-Key'] = cleanToken;
      }

      let parsedData = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(form.method) && form.bodyData.trim()) {
        try {
          parsedData = JSON.parse(form.bodyData);
        } catch (e) {
          parsedData = form.bodyData;
        }
      }
      return (await api.post('/tools/probe', {
        url: form.url,
        method: form.method,
        data: parsedData,
        headers: reqHeaders,
      })).data;
    },
  });

  // Bulk probe mutation - 100% dynamic live network execution
  const runBulk = useMutation({
    mutationFn: async () => {
      const lines = bulkInput
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const targets = lines.map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length > 1 && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(parts[0].toUpperCase())) {
          return { method: parts[0].toUpperCase(), url: parts.slice(1).join(' ') };
        }
        return { method: 'GET', url: line };
      });

      try {
        const res = await api.post('/tools/probe-bulk', {
          targets,
          bearerToken: bulkBearer,
          apiKey: bulkApiKey,
        });
        return res.data;
      } catch (err) {
        // Dynamic fallback: run individual live probes via /tools/probe
        const defaultHeaders = {};
        if (bulkBearer && bulkBearer.trim()) {
          const tokenClean = bulkBearer.trim().replace(/^Bearer\s+/i, '');
          defaultHeaders['Authorization'] = `Bearer ${tokenClean}`;
        }
        if (bulkApiKey && bulkApiKey.trim()) {
          defaultHeaders['X-API-Key'] = bulkApiKey.trim();
        }

        const startAll = Date.now();
        const results = await Promise.all(
          targets.map(async (t) => {
            try {
              const singleRes = (await api.post('/tools/probe', {
                url: t.url,
                method: t.method,
                headers: defaultHeaders,
              })).data;

              const h = singleRes.headers || {};
              return {
                url: singleRes.url || t.url,
                method: singleRes.method || t.method,
                status: singleRes.status,
                statusText: singleRes.status ? String(singleRes.status) : 'Connection Refused',
                ms: singleRes.ms || 0,
                security: {
                  hasHsts: Boolean(h['strict-transport-security']),
                  hasCsp: Boolean(h['content-security-policy']),
                  hasCors: Boolean(h['access-control-allow-origin']),
                  corsValue: h['access-control-allow-origin'] || 'None',
                  hasXContentType: Boolean(h['x-content-type-options']),
                  hasXFrame: Boolean(h['x-frame-options']),
                },
                bodySnippet: singleRes.bodySnippet || '',
                error: singleRes.error || null,
              };
            } catch (e) {
              return {
                url: t.url,
                method: t.method,
                status: null,
                statusText: 'Network Error',
                ms: 0,
                security: {},
                bodySnippet: '',
                error: errMsg(e),
              };
            }
          })
        );
        const totalMs = Date.now() - startAll;
        const successful = results.filter((r) => r.status && r.status < 400).length;
        const clientErrors = results.filter((r) => r.status && r.status >= 400 && r.status < 500).length;
        const serverErrors = results.filter((r) => (r.status && r.status >= 500) || r.error).length;
        const avgMs = Math.round(results.reduce((acc, r) => acc + (r.ms || 0), 0) / Math.max(1, results.length));

        return {
          total: results.length,
          successful,
          clientErrors,
          serverErrors,
          avgMs,
          totalMs,
          results,
        };
      }
    },
    onSuccess: (data) => {
      setBulkData(data);
    },
  });

  const testSingle = async () => {
    setResA(null);
    setResB(null);
    const res = await run.mutateAsync({ token: form.tokenA }).catch((e) => ({ error: errMsg(e) }));
    setResA(res);
  };

  const compare = async () => {
    setResA(null);
    setResB(null);
    const [a, b] = await Promise.all([
      run.mutateAsync({ token: form.tokenA }).catch((e) => ({ error: errMsg(e) })),
      run.mutateAsync({ token: form.tokenB }).catch((e) => ({ error: errMsg(e) })),
    ]);
    setResA(a);
    setResB(b);
  };

  const verdict = resA && resB && resA.status && resB.status
    ? resA.status === resB.status
      ? { text: `Same status (${resA.status}) for both roles — possible missing authorization check. Verify manually.`, bad: true }
      : { text: `Different statuses (${resA.status} vs ${resB.status}) — access control appears enforced.`, bad: false }
    : null;

  const handleCopyResults = () => {
    if (!bulkData) return;
    navigator.clipboard.writeText(JSON.stringify(bulkData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResults = () => {
    if (!bulkData) return;
    const blob = new Blob([JSON.stringify(bulkData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulk_API_Test_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadDynamicBenchmarkPreset = () => {
    setBulkInput(
`GET http://localhost:5000/health
GET https://dummyjson.com/products/1
GET https://jsonplaceholder.typicode.com/posts/1
GET http://localhost:5000/api/v1/auth/me
GET https://dummyjson.com/auth/RESOURCE_THAT_NEEDS_AUTH
GET https://httpbin.org/status/403
GET https://jsonplaceholder.typicode.com/posts/999999
GET https://httpbin.org/status/500`
    );
  };

  const lineCount = bulkInput.split('\n').filter((l) => l.trim()).length;

  return (
    <div className="relative min-h-screen space-y-6 pb-16">
      <PageHeader
        icon={FlaskRound}
        tone="cyan"
        title="API Security & Batch Testing Suite"
        subtitle="Execute high-throughput bulk API tests in 1 run, or verify RBAC / IDOR authorization side-by-side"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] px-3 py-1.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
              <Timer size={13} className="text-blue-600 dark:text-cyan-300" /> 10s timeout cap
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-cyan-500/30 bg-white dark:bg-gradient-to-r dark:from-cyan-950/60 dark:to-slate-900 px-3 py-1.5 font-mono text-[11px] font-bold text-[#0f1f3d] dark:text-white shadow-md">
              <ScrollText size={13} className="text-blue-600 dark:text-cyan-300" /> Audit-logged
            </span>
          </div>
        }
      />

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition shadow-sm',
            activeTab === 'bulk'
              ? 'bg-blue-600 border border-white/40 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)] dark:bg-cyan-500/25 dark:border-cyan-500/50 dark:text-cyan-300'
              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Zap size={15} className={activeTab === 'bulk' ? 'text-white dark:text-cyan-400' : ''} />
          <span>🚀 Bulk APIs Test (1-Run Batch)</span>
          <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-700 dark:text-cyan-300">
            {lineCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold transition shadow-sm',
            activeTab === 'single'
              ? 'bg-blue-600 border border-white/40 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)] dark:bg-cyan-500/25 dark:border-cyan-500/50 dark:text-cyan-300'
              : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Scale size={15} className={activeTab === 'single' ? 'text-white dark:text-cyan-400' : ''} />
          <span>⚡ Single & Dual-Role RBAC Tester</span>
        </button>
      </div>

      {/* TAB 1: BULK API BATCH RUNNER */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PremiumIcon icon={Zap} tone="cyan" size="sm" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Bulk API Batch Runner (1-Click Run)
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Concurrent non-destructive assessment · Security header audit · Up to 50 endpoints
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadDynamicBenchmarkPreset}
                  className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <RefreshCw size={13} /> Load Dynamic Preset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBulkInput('')}
                  className="font-mono text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Target Input Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                  Target API Endpoints (One per line with optional HTTP method)
                </Label>
                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                  {lineCount} endpoint{lineCount !== 1 ? 's' : ''} configured
                </span>
              </div>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="GET https://api.example.com/v1/users&#10;POST https://api.example.com/v1/auth&#10;GET https://api.example.com/v1/status"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              />
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Format: <code className="text-blue-600 dark:text-cyan-400 font-bold">METHOD https://host/path</code> (default method is GET if omitted).
              </p>
            </div>

            {/* Global Authentication & Headers */}
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                    Global Bearer Token (Applied to all endpoints)
                  </Label>
                  <button
                    type="button"
                    onClick={handleInsertToken}
                    className="text-[11px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Zap size={11} /> 1-Click Paste Valid Token
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showBearer ? 'text' : 'password'}
                    placeholder="Bearer eyJhbGci..."
                    value={bulkBearer}
                    onChange={(e) => setBulkBearer(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 pr-10 font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBearer(!showBearer)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                    title={showBearer ? 'Hide Token' : 'Show Token'}
                  >
                    {showBearer ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                    Global API Key Header (X-API-Key)
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkApiKey('saksham_sec_live_948fbc2189a0');
                      setShowApiKey(true);
                    }}
                    className="text-[11px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Zap size={11} /> Fill Test Key
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="wm_..."
                    value={bulkApiKey}
                    onChange={(e) => setBulkApiKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 pr-10 font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                    title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                disabled={lineCount === 0 || runBulk.isPending}
                onClick={() => runBulk.mutate()}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:brightness-110 text-white font-mono text-xs font-bold px-6 py-2.5 shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
              >
                <Play size={15} className="fill-current" />
                <span>{runBulk.isPending ? 'Testing All Endpoints Concurrently…' : `Run Bulk API Test (${lineCount} Endpoints)`}</span>
              </Button>

              <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Non-Destructive
                </span>
                <span className="flex items-center gap-1">
                  <Lock size={14} className="text-blue-600 dark:text-cyan-400" /> SSRF Protected
                </span>
              </div>
            </div>

            {runBulk.isError && (
              <p className="font-mono text-xs font-semibold text-red-600 dark:text-red-400 pt-2">
                {errMsg(runBulk.error)}
              </p>
            )}
          </Card>

          {/* BULK RESULTS DASHBOARD */}
          {bulkData && (
            <div className="space-y-4">
              {/* Summary Stats Grid - High Contrast in both light and dark modes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Total */}
                <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#090f1f] p-3.5 shadow-sm">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Tested</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-slate-900 dark:text-white">{bulkData.total}</div>
                </div>

                {/* Success */}
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-3.5 shadow-sm">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Success (2xx/3xx)</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{bulkData.successful}</div>
                </div>

                {/* Client Errors */}
                <div className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-3.5 shadow-sm">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Client Errors (4xx)</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">{bulkData.clientErrors}</div>
                </div>

                {/* Server Errors */}
                <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/20 p-3.5 shadow-sm">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">Failures / 5xx</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-red-700 dark:text-red-400">{bulkData.serverErrors}</div>
                </div>

                {/* Latency */}
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/20 p-3.5 shadow-sm">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">Avg Latency</div>
                  <div className="mt-1 text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-400">{bulkData.avgMs}ms</div>
                </div>
              </div>

              {/* Actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  Detailed Batch Telemetry ({bulkData.totalMs}ms total batch runtime)
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyResults} className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadResults} className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Download size={13} />
                    <span>Export Report</span>
                  </Button>
                </div>
              </div>

              {/* Results Table - Razor-sharp text visibility */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-4 py-3">Method & Status</th>
                        <th className="px-4 py-3">Endpoint URL</th>
                        <th className="px-4 py-3">Latency</th>
                        <th className="px-4 py-3">Security Headers</th>
                        <th className="px-4 py-3 text-right">Response JSON</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                      {bulkData.results.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px] text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-800">
                                {r.method}
                              </span>
                              <span className={cn(
                                'font-bold px-2 py-0.5 rounded text-[11px] border',
                                r.status >= 200 && r.status < 300
                                  ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : r.status >= 400 && r.status < 500
                                  ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                  : 'border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                              )}>
                                {r.status || 'ERR'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 max-w-xs sm:max-w-md truncate">
                            {r.url}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={cn(
                              'font-mono text-xs font-bold',
                              r.ms < 100 ? 'text-emerald-600 dark:text-emerald-400' : r.ms < 500 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                            )}>
                              {r.ms}ms
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* HSTS */}
                              <span
                                title={r.security?.hasHsts ? 'HSTS Enforced' : 'Missing HSTS (Vulnerability)'}
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-bold border',
                                  r.security?.hasHsts
                                    ? 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'border-red-300 bg-red-100 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
                                )}
                              >
                                {r.security?.hasHsts ? '✓ HSTS' : '✗ No HSTS'}
                              </span>

                              {/* CSP */}
                              <span
                                title={r.security?.hasCsp ? 'CSP Enforced' : 'Missing CSP (Vulnerability)'}
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-bold border',
                                  r.security?.hasCsp
                                    ? 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'border-red-300 bg-red-100 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
                                )}
                              >
                                {r.security?.hasCsp ? '✓ CSP' : '✗ No CSP'}
                              </span>

                              {/* CORS */}
                              <span
                                title={`CORS Policy: ${r.security?.corsValue || 'None'}`}
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-bold border',
                                  r.security?.corsValue === '*'
                                    ? 'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                                    : r.security?.hasCors
                                    ? 'border-blue-400 bg-blue-100 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
                                    : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                )}
                              >
                                {r.security?.corsValue === '*' ? '⚠ CORS: *' : r.security?.hasCors ? '✓ CORS' : 'CORS: None'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedResponse(r)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition shadow-sm"
                            >
                              <FileCode size={13} />
                              <span>response.json</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: RESPONSE.JSON DRAWER */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-cyan-500/50 bg-white dark:bg-slate-950 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-blue-600 dark:text-cyan-400" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
                    response.json · HTTP {selectedResponse.status || 'ERR'} {selectedResponse.statusText || ''}
                  </h4>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {selectedResponse.method} {selectedResponse.url} ({selectedResponse.ms}ms)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                Payload Body Snippet:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedResponse.bodySnippet || '');
                  setModalCopied(true);
                  setTimeout(() => setModalCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                {modalCopied ? <Check size={13} /> : <Copy size={13} />}
                <span>{modalCopied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            {/* JSON Code Viewer */}
            <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 font-mono text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 selection:bg-cyan-500/30">
              {(() => {
                if (!selectedResponse.bodySnippet) return '(empty body or connection refused)';
                try {
                  const parsed = JSON.parse(selectedResponse.bodySnippet);
                  return JSON.stringify(parsed, null, 2);
                } catch (e) {
                  return selectedResponse.bodySnippet;
                }
              })()}
            </pre>

            {/* Close Button */}
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="font-mono text-xs font-bold px-4 py-2"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SINGLE & DUAL ROLE RBAC TESTER */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <PremiumIcon icon={FlaskConical} tone="cyan" size="sm" />
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Role Comparison Security Test</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">Safe automated check · 50KB cap · logged to audit trail</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <div>
                <Label className="text-slate-900 dark:text-slate-200">Target endpoint URL (authorized only)</Label>
                <Input placeholder="https://target.example/api/users/123" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="font-mono text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <Label className="text-slate-900 dark:text-slate-200">Method</Label>
                <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => <option key={m}>{m}</option>)}
                </Select>
              </div>
            </div>

            {['POST', 'PUT', 'PATCH'].includes(form.method) && (
              <div className="mt-3">
                <Label className="text-slate-900 dark:text-slate-200">Request Body Payload (JSON format)</Label>
                <textarea
                  rows={3}
                  placeholder='{"amount": 100, "description": "topup"}'
                  value={form.bodyData}
                  onChange={(e) => setForm({ ...form, bodyData: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 font-mono text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 placeholder-slate-400 dark:placeholder-slate-600 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            )}

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-slate-900 dark:text-slate-200">Role A token (e.g. low-priv user JWT)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, tokenA: VALID_DEMO_JWT });
                      setShowTokenA(true);
                    }}
                    className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Zap size={10} /> Fill Demo
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTokenA ? 'text' : 'password'}
                    placeholder="Bearer token A"
                    value={form.tokenA}
                    onChange={(e) => setForm({ ...form, tokenA: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 pr-10 font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTokenA(!showTokenA)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                    title={showTokenA ? 'Hide Token' : 'Show Token'}
                  >
                    {showTokenA ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-slate-900 dark:text-slate-200">Role B token (e.g. admin JWT)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, tokenB: VALID_DEMO_JWT });
                      setShowTokenB(true);
                    }}
                    className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Zap size={10} /> Fill Demo
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTokenB ? 'text' : 'password'}
                    placeholder="Bearer token B"
                    value={form.tokenB}
                    onChange={(e) => setForm({ ...form, tokenB: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 pr-10 font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTokenB(!showTokenB)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                    title={showTokenB ? 'Hide Token' : 'Show Token'}
                  >
                    {showTokenB ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <Button disabled={!form.url || run.isPending} onClick={testSingle} className="w-full sm:w-auto bg-blue-600/80 backdrop-blur-xl border border-white/40 hover:bg-blue-600/90 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] font-semibold px-5 py-2 dark:bg-blue-500/25 dark:border-blue-300/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-blue-500/35">
                <Play size={14} className="fill-current" /> {run.isPending ? 'Testing…' : 'Run Security Test'}
              </Button>
              <Button disabled={!form.url || run.isPending} variant="outline" onClick={compare} className="w-full sm:w-auto px-5 py-2 text-slate-800 dark:text-slate-200">
                <Scale size={14} /> {run.isPending ? 'Testing…' : 'Compare Roles (A vs B)'}
              </Button>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <FlaskConical size={13} className="text-slate-500 shrink-0" /> Safe automated test · 10s timeout · 50KB cap
              </span>
            </div>
            {run.isError && <p className="mt-2 font-mono text-xs font-semibold text-red-600 dark:text-red-400">{errMsg(run.error)}</p>}
          </Card>

          {verdict && (
            <div className={cn(
              'flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed shadow-md',
              verdict.bad ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200' : 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
            )}>
              <PremiumIcon icon={Scale} tone={verdict.bad ? 'amber' : 'emerald'} size="sm" />
              <p className="pt-1 font-semibold">{verdict.text}</p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultPane title="Role A" tokenLabel="token A" result={resA} busy={run.isPending && !resA} tone="cyan" />
            <ResultPane title="Role B" tokenLabel="token B" result={resB} busy={run.isPending && !resB} tone="purple" />
          </div>
        </div>
      )}
    </div>
  );
}
