import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FlaskConical, FlaskRound, Play, Scale, ShieldCheck, Timer, Database, ScrollText } from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import { PageHeader, LoadingState, EmptyState, PremiumIcon } from '../../components/shared/shared';
import { Button, Card, Input, Select, Label } from '../../components/ui/primitives';

function ResultPane({ title, tokenLabel, result, busy, tone }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#090f1f] p-5 shadow-md transition hover:border-slate-700/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {title} · <span className="text-cyan-300">{tokenLabel}</span>
        </p>
        <PremiumIcon icon={ShieldCheck} tone={tone || 'cyan'} size="sm" />
      </div>
      {busy && <LoadingState label="Probing…" />}
      {!busy && !result && <EmptyState title="No result yet" hint="Run the probe to compare." icon={Database} />}
      {!busy && result && (
        <div className="space-y-2.5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              'rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold',
              result.status >= 200 && result.status < 300 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : result.status >= 400 ? 'border-red-500/30 bg-red-500/10 text-red-300'
              : 'border-slate-700 bg-slate-800 text-slate-300'
            )}>
              {result.status ?? 'ERR'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">{result.ms}ms</span>
            {result.error && <span className="truncate font-mono text-[11px] text-red-400">{result.error}</span>}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300">Headers ({Object.keys(result.headers || {}).length})</summary>
            <pre className="mt-1.5 max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-slate-300">
              {JSON.stringify(result.headers || {}, null, 1)}
            </pre>
          </details>
          <details className="text-xs" open>
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300">Body snippet</summary>
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-emerald-300">
              {result.bodySnippet || '(empty)'}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export function ApiTester() {
  const [form, setForm] = useState({ url: '', method: 'GET', tokenA: '', tokenB: '', bodyData: '' });
  const [resA, setResA] = useState(null);
  const [resB, setResB] = useState(null);

  const run = useMutation({
    mutationFn: async ({ token }) => {
      const cleanToken = (token || '').trim().replace(/^Bearer\s+/i, '');
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
        headers: cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {},
      })).data;
    },
  });

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

  return (
    <div className="relative min-h-screen space-y-6 pb-16">
      <PageHeader
        icon={FlaskRound}
        tone="cyan"
        title="RBAC / IDOR API Tester"
        subtitle="Probe an authorized endpoint as two roles side-by-side — server executes, browser never touches the target"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#090f1f] px-3 py-1.5 font-mono text-[11px] font-bold text-slate-300 shadow-sm">
              <Timer size={13} className="text-cyan-300" /> 10s timeout
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 to-slate-900 px-3 py-1.5 font-mono text-[11px] font-bold text-white shadow-md">
              <ScrollText size={13} className="text-cyan-300" /> Audit-logged
            </span>
          </div>
        }
      />

      <Card className="border-slate-800 bg-[#090f1f] p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <PremiumIcon icon={FlaskConical} tone="cyan" size="sm" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">Role Comparison Probe</h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Read-only style probe · 50KB cap · logged to audit trail</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_160px]">
          <div>
            <Label>Target endpoint URL (authorized only)</Label>
            <Input placeholder="https://target.example/api/users/123" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="font-mono" />
          </div>
          <div>
            <Label>Method</Label>
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => <option key={m}>{m}</option>)}
            </Select>
          </div>
        </div>

        {['POST', 'PUT', 'PATCH'].includes(form.method) && (
          <div className="mt-3">
            <Label>Request Body Payload (JSON format)</Label>
            <textarea
              rows={3}
              placeholder='{"amount": 100, "description": "topup"}'
              value={form.bodyData}
              onChange={(e) => setForm({ ...form, bodyData: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs leading-relaxed text-emerald-300 placeholder-slate-600 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        )}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Role A token (e.g. low-priv user JWT)</Label>
            <Input type="password" placeholder="Bearer token A" value={form.tokenA} onChange={(e) => setForm({ ...form, tokenA: e.target.value })} className="font-mono" />
          </div>
          <div>
            <Label>Role B token (e.g. admin JWT)</Label>
            <Input type="password" placeholder="Bearer token B" value={form.tokenB} onChange={(e) => setForm({ ...form, tokenB: e.target.value })} className="font-mono" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button disabled={!form.url || run.isPending} onClick={compare} className="px-5 py-2">
            <Play size={14} className="fill-current" /> {run.isPending ? 'Probing…' : 'Run role comparison'}
          </Button>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            <FlaskConical size={13} className="text-slate-500" /> Read-only style probe · 10s timeout · 50KB cap
          </span>
        </div>
        {run.isError && <p className="mt-2 font-mono text-xs font-semibold text-red-400">{errMsg(run.error)}</p>}
      </Card>

      {verdict && (
        <div className={cn(
          'flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed shadow-md',
          verdict.bad ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
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
  );
}
