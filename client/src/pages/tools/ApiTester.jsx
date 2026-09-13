import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FlaskConical, Play, Scale } from 'lucide-react';
import api from '../../lib/api';
import { errMsg, cn } from '../../lib/utils';
import { PageHeader, LoadingState, EmptyState } from '../../components/shared/shared';
import { Button, Card, Input, Select, Label } from '../../components/ui/primitives';

function ResultPane({ title, tokenLabel, result, busy }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="mb-2 truncate text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title} · <span className="text-cyan-600 dark:text-cyan-300">{tokenLabel}</span>
      </p>
      {busy && <LoadingState label="Probing…" />}
      {!busy && !result && <EmptyState title="No result yet" hint="Run the probe to compare." />}
      {!busy && result && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={cn(
              'rounded-md px-2 py-0.5 font-mono text-xs font-bold',
              result.status >= 200 && result.status < 300 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
              : result.status >= 400 ? 'bg-red-500/15 text-red-600 dark:text-red-300'
              : 'bg-slate-500/15 text-slate-500 dark:text-slate-300'
            )}>
              {result.status ?? 'ERR'}
            </span>
            <span className="font-mono text-xs text-slate-500">{result.ms}ms</span>
            {result.error && <span className="truncate text-xs text-red-500">{result.error}</span>}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-slate-500">Headers ({Object.keys(result.headers || {}).length})</summary>
            <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-slate-300">
              {JSON.stringify(result.headers || {}, null, 1)}
            </pre>
          </details>
          <details className="text-xs" open>
            <summary className="cursor-pointer text-slate-500">Body snippet</summary>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-emerald-400">
              {result.bodySnippet || '(empty)'}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export function ApiTester() {
  const [form, setForm] = useState({ url: '', method: 'GET', tokenA: '', tokenB: '' });
  const [resA, setResA] = useState(null);
  const [resB, setResB] = useState(null);

  const run = useMutation({
    mutationFn: async ({ token }) => {
      const cleanToken = (token || '').trim().replace(/^Bearer\s+/i, '');
      return (await api.post('/tools/probe', {
        url: form.url,
        method: form.method,
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
    <div>
      <PageHeader
        title="RBAC / IDOR API Tester"
        subtitle="Probe an authorized endpoint as two roles side-by-side — server executes, browser never touches the target"
      />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_140px]">
          <div>
            <Label>Target endpoint URL (authorized only)</Label>
            <Input placeholder="https://target.example/api/users/123" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <div>
            <Label>Method</Label>
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => <option key={m}>{m}</option>)}
            </Select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Role A token (e.g. low-priv user JWT)</Label>
            <Input type="password" placeholder="Bearer token A" value={form.tokenA} onChange={(e) => setForm({ ...form, tokenA: e.target.value })} />
          </div>
          <div>
            <Label>Role B token (e.g. admin JWT)</Label>
            <Input type="password" placeholder="Bearer token B" value={form.tokenB} onChange={(e) => setForm({ ...form, tokenB: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button disabled={!form.url || run.isPending} onClick={compare}>
            <Play size={14} /> {run.isPending ? 'Probing…' : 'Run role comparison'}
          </Button>
          <FlaskConical size={15} className="text-slate-400" />
          <span className="text-xs text-slate-500">Read-only style probe · 10s timeout · 50KB cap · logged to audit trail</span>
        </div>
        {run.isError && <p className="mt-2 text-sm text-red-500">{errMsg(run.error)}</p>}
      </Card>

      {verdict && (
        <div className={cn(
          'mb-4 flex items-start gap-2 rounded-xl border p-4 text-sm',
          verdict.bad ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
        )}>
          <Scale size={16} className="mt-0.5 shrink-0" /> {verdict.text}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultPane title="Role A" tokenLabel="token A" result={resA} busy={run.isPending && !resA} />
        <ResultPane title="Role B" tokenLabel="token B" result={resB} busy={run.isPending && !resB} />
      </div>
    </div>
  );
}
