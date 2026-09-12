import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { errMsg } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge } from '../../components/shared/shared';
import { Button, Card, Input, Select } from '../../components/ui/primitives';

const STAGES = ['reconnaissance', 'endpointDiscovery', 'technologyAnalysis', 'securityChecks', 'verification', 'aiAnalysis', 'riskScoring', 'reportGeneration'];

export function Assessments() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ projectId: '', targetId: '', type: 'Standard', authorizationConfirmed: false });
  const projects = useQuery({ queryKey: ['projects-mini'], queryFn: async () => (await api.get('/projects')).data });
  const targets = useQuery({
    queryKey: ['targets-mini', form.projectId],
    queryFn: async () => (await api.get(`/projects/${form.projectId}/targets`)).data,
    enabled: !!form.projectId,
  });
  const list = useQuery({ queryKey: ['assessments'], queryFn: async () => (await api.get('/assessments')).data });

  const start = useMutation({
    mutationFn: async () => (await api.post('/assessments', form)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assessments'] }),
  });

  return (
    <div>
      <PageHeader title="Assessments" subtitle="Quick / Standard / Comprehensive jobs with live progress" />
      <Card className="mb-4">
        <h2 className="mb-2 font-medium">Start assessment</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, targetId: '' })}>
            <option value="">Select project</option>
            {(projects.data?.projects || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
          <Select value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} disabled={!form.projectId}>
            <option value="">Select target</option>
            {(targets.data?.targets || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Quick</option><option>Standard</option><option>Comprehensive</option>
          </Select>
          <Button disabled={!form.projectId || !form.targetId || !form.authorizationConfirmed || start.isPending} onClick={() => start.mutate()}>
            {start.isPending ? 'Queueing…' : 'Start'}
          </Button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.authorizationConfirmed} onChange={(e) => setForm({ ...form, authorizationConfirmed: e.target.checked })} />
          I confirm that I am authorized to assess this target.
        </label>
        {start.isError && <p className="mt-2 text-sm text-red-600">{errMsg(start.error)}</p>}
      </Card>

      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState message="Could not load assessments." onRetry={() => list.refetch()} />}
      <div className="flex flex-col gap-2">
        {(list.data?.assessments || []).map((a) => (
          <Link key={a._id} to={`/assessments/${a._id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400/30 dark:hover:shadow-[0_0_28px_-10px_rgba(34,211,238,0.5)]">
            <span className="font-medium">{a.type} assessment</span>
            <StatusBadge status={a.status} />
          </Link>
        ))}
        {list.data && list.data.assessments.length === 0 && <EmptyState title="No assessments" hint="Queue your first assessment above." />}
      </div>
    </div>
  );
}

export function AssessmentDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [live, setLive] = useState(null); // socket progress payload
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => (await api.get(`/assessments/${id}`)).data,
    // Socket is primary real-time channel; polling is fallback while job is active.
    refetchInterval: (q) => (['RUNNING', 'QUEUED'].includes(q.state.data?.assessment?.status) ? 3000 : false),
  });

  useEffect(() => {
    const s = getSocket();
    s.emit('assessment:subscribe', id);
    const onProgress = (payload) => {
      if (payload?.assessmentId !== id) return;
      setLive(payload);
      // Re-fetch full assessment (assets, summary) from DB-backed API.
      qc.invalidateQueries({ queryKey: ['assessment', id] });
      if (payload.status === 'COMPLETED') {
        qc.invalidateQueries({ queryKey: ['assessments'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      }
    };
    s.on('assessment:progress', onProgress);
    return () => { s.off('assessment:progress', onProgress); };
  }, [id, qc]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Assessment not found." onRetry={() => refetch()} />;
  const { assessment, assets } = data;
  // Prefer socket live state, fall back to DB-backed API data.
  const status = live?.status || assessment.status;
  const progress = live?.progress || assessment.progress || {};

  return (
    <div>
      <PageHeader title={`${assessment.type} Assessment`} subtitle={`Status: ${status} · Score: ${assessment.summary?.securityScore ?? '—'}/100 · live via socket + API`} />
      <Card className="mb-4">
        <h2 className="mb-2 font-medium">Progress</h2>
        <ul className="grid gap-1 text-sm md:grid-cols-2">
          {STAGES.map((s) => (
            <li key={s} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <span>{s}</span><span>{progress?.[s] === 'done' ? '✓' : progress?.[s] === 'running' ? '●' : '○'}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-2 font-medium">Attack Surface ({assets?.length ?? 0} assets)</h2>
        {(assets || []).length === 0 && <EmptyState title="No assets yet" hint="Assets appear while the job runs." />}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-2">Endpoint</th><th>Method</th><th>Auth</th><th>Type</th></tr></thead>
            <tbody>
              {(assets || []).map((a) => (
                <tr key={a._id} className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="py-2 font-mono text-xs">{a.url || a.name}</td>
                  <td>{a.method}</td><td>{a.authentication}</td><td>{a.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <Input placeholder="Filter handled server-side on Findings page" disabled />
          <Link to="/findings" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Open findings</Link>
        </div>
      </Card>
    </div>
  );
}
