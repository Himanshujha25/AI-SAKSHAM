import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { errMsg } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/shared/shared';
import { Button, Card, Input } from '../../components/ui/primitives';

export function Projects() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '' });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });
  const create = useMutation({
    mutationFn: async () => (await api.post('/projects', form)).data,
    onSuccess: () => { setForm({ name: '', description: '' }); qc.invalidateQueries({ queryKey: ['projects'] }); },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Could not load projects." onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title="Projects" subtitle="One workspace per security assessment" />
      <Card className="mb-4">
        <h2 className="mb-2 font-medium">New project</h2>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="World Monitor Security Assessment" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={() => create.mutate()} disabled={!form.name || create.isPending}>Create</Button>
        </div>
        {create.isError && <p className="mt-2 text-sm text-red-600">{errMsg(create.error)}</p>}
      </Card>
      {(data.projects || []).length === 0 && <EmptyState title="No projects" hint="Create your first assessment workspace above." />}
      <div className="grid gap-3 md:grid-cols-2">
        {(data.projects || []).map((p) => (
          <Link key={p._id} to={`/projects/${p._id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium">{p.name}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description || 'No description'}</p>
            <p className="mt-2 text-xs text-slate-400">{p.status} · {new Date(p.updatedAt).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [target, setTarget] = useState({ name: '', url: '', environment: 'Testing', authorizationConfirmed: false });
  const resolvedId = id;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', resolvedId],
    queryFn: async () => (await api.get(`/projects/${resolvedId}`)).data,
  });
  const addTarget = useMutation({
    mutationFn: async () => (await api.post(`/projects/${resolvedId}/targets`, target)).data,
    onSuccess: () => { setTarget({ name: '', url: '', environment: 'Testing', authorizationConfirmed: false }); qc.invalidateQueries({ queryKey: ['project', resolvedId] }); },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Project not found." onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title={data.project.name} subtitle={data.project.description} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {['totalAssessments', 'critical', 'high', 'verified'].map((k) => (
          <div key={k} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase text-slate-500">{k}</p>
            <p className="text-2xl font-semibold">{data.overview?.[k] ?? 0}</p>
          </div>
        ))}
      </div>

      <Card className="mt-4">
        <h2 className="mb-2 font-medium">Authorized target</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Target name" value={target.name} onChange={(e) => setTarget({ ...target, name: e.target.value })} />
          <Input placeholder="https://target.example" value={target.url} onChange={(e) => setTarget({ ...target, url: e.target.value })} />
          <select value={target.environment} onChange={(e) => setTarget({ ...target, environment: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option>Testing</option><option>Staging</option><option>Demo</option><option>Production-authorized</option>
          </select>
          <Button onClick={() => addTarget.mutate()} disabled={!target.name || !target.url}>Add target</Button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={target.authorizationConfirmed} onChange={(e) => setTarget({ ...target, authorizationConfirmed: e.target.checked })} />
          I confirm that I am authorized to assess this target.
        </label>
        {addTarget.isError && <p className="mt-2 text-sm text-red-600">{errMsg(addTarget.error)}</p>}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-2 font-medium">Recent assessments</h2>
        {(data.assessments || []).length === 0 && <EmptyState title="No assessments yet" hint="Start one from the Assessments page." />}
        <ul className="flex flex-col gap-2 text-sm">
          {(data.assessments || []).map((a) => (
            <li key={a._id}><Link className="underline" to={`/assessments/${a._id}`}>{a.type} · {a.status} · Score {a.summary?.securityScore ?? '—'}</Link></li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
