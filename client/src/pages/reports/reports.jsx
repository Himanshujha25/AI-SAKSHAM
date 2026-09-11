import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { errMsg } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/shared/shared';
import { Button, Card, Select } from '../../components/ui/primitives';

export function Reports() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ assessmentId: '', type: 'Technical' });
  const assessments = useQuery({ queryKey: ['assessments-mini'], queryFn: async () => (await api.get('/assessments')).data });
  const list = useQuery({ queryKey: ['reports'], queryFn: async () => (await api.get('/reports')).data });
  const generate = useMutation({
    mutationFn: async () => (await api.post('/reports/generate', form)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1$/, '');

  return (
    <div>
      <PageHeader title="Reports" subtitle="Executive / Technical / Summary PDFs with evidence and remediation" />
      <Card className="mb-4">
        <h2 className="mb-2 font-medium">Generate report</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <Select value={form.assessmentId} onChange={(e) => setForm({ ...form, assessmentId: e.target.value })}>
            <option value="">Select assessment</option>
            {(assessments.data?.assessments || []).map((a) => <option key={a._id} value={a._id}>{a.type} · {a.status} · {a._id.slice(-6)}</option>)}
          </Select>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Technical</option><option>Executive</option><option>Summary</option>
          </Select>
          <Button disabled={!form.assessmentId || generate.isPending} onClick={() => generate.mutate()}>{generate.isPending ? 'Generating…' : 'Generate PDF'}</Button>
        </div>
        {generate.isError && <p className="mt-2 text-sm text-red-600">{errMsg(generate.error)}</p>}
      </Card>

      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState message="Could not load reports." onRetry={() => list.refetch()} />}
      {(list.data?.reports || []).length === 0 && !list.isLoading && <EmptyState title="No reports" hint="Generate your first PDF above." />}
      <div className="flex flex-col gap-2">
        {(list.data?.reports || []).map((r) => (
          <div key={r._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600">
            <span className="text-sm">{r.type} · {new Date(r.createdAt).toLocaleString()} · {r.status}</span>
            {r.fileUrl && <a className="text-sm underline" href={`${apiBase}${r.fileUrl}`} target="_blank" rel="noreferrer">Download PDF</a>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Environment and API configuration" />
      <Card>
        <p className="text-sm">API base: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}</code></p>
        <p className="mt-2 text-sm text-slate-500">Set <code>VITE_API_URL</code> in <code>client/.env</code> to point at your server. Theme toggle lives in the top navbar.</p>
      </Card>
    </div>
  );
}
