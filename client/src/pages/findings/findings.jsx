import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { errMsg } from '../../lib/utils';
import { PageHeader, LoadingState, ErrorState, EmptyState, SeverityBadge, StatusBadge } from '../../components/shared/shared';
import { Button, Card, Select, Input } from '../../components/ui/primitives';

export function Findings() {
  const [f, setF] = useState({ severity: '', status: '', search: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).toString();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['findings', qs],
    queryFn: async () => (await api.get(`/findings?${qs}`)).data,
  });

  return (
    <div>
      <PageHeader title="Findings" subtitle="VUL-001… with evidence, verification, CVSS and AI analysis" />
      <Card className="mb-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>
            <option value="">All severities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option><option>Informational</option>
          </Select>
          <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">All statuses</option><option>Potential</option><option>Under Review</option><option>Verified</option><option>False Positive</option><option>Resolved</option><option>Accepted Risk</option>
          </Select>
          <Input placeholder="Search title…" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
          <Button variant="outline" onClick={() => setF({ severity: '', status: '', search: '' })}>Clear</Button>
        </div>
      </Card>
      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Could not load findings." onRetry={() => refetch()} />}
      {(data?.findings || []).length === 0 && !isLoading && <EmptyState title="No findings" hint="Adjust filters or run an assessment." />}
      <div className="flex flex-col gap-2">
        {(data?.findings || []).map((v) => (
          <Link key={v._id} to={`/findings/${v._id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600">
            <span><span className="font-mono text-xs text-slate-500">{v.findingId}</span> <span className="font-medium">{v.title}</span> <span className="text-sm text-slate-500">CVSS {v.cvssScore}</span></span>
            <span className="flex gap-2"><SeverityBadge severity={v.severity} /><StatusBadge status={v.status} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FindingDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['finding', id],
    queryFn: async () => (await api.get(`/findings/${id}`)).data,
  });
  const verify = useMutation({
    mutationFn: async (status) => (await api.post(`/findings/${id}/verify`, { status, confidence: 90 })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
  const ai = useMutation({
    mutationFn: async () => (await api.post(`/findings/${id}/ai-analysis`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finding', id] });
      qc.invalidateQueries({ queryKey: ['findings'] });
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message="Finding not found." onRetry={() => refetch()} />;
  const v = data.finding;

  return (
    <div>
      <PageHeader title={`${v.findingId} · ${v.title}`} subtitle={`${v.category} · CVSS ${v.cvssScore}`} actions={<><SeverityBadge severity={v.severity} /><StatusBadge status={v.status} /></>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Section title="Overview"><p className="text-sm">{v.description || '—'}</p></Section>
          <Section title="Affected Assets"><p className="font-mono text-xs">{(v.affectedAssets || []).join(', ') || '—'}</p></Section>
          <Section title="Evidence"><p className="text-sm">{v.evidence || '—'}</p></Section>
          <Section title="Verification">
            <p className="text-sm">Status: {v.status} · Confidence: {v.confidence}% {v.verifiedBy ? `· Verified ${v.verificationDate ? new Date(v.verificationDate).toLocaleString() : ''}` : ''}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Under Review', 'Verified', 'False Positive', 'Resolved'].map((s) => (
                <Button key={s} variant="outline" disabled={verify.isPending} onClick={() => verify.mutate(s)}>Mark {s}</Button>
              ))}
            </div>
            {verify.isError && <p className="mt-2 text-sm text-red-600">{errMsg(verify.error)}</p>}
          </Section>
          <Section title="Remediation">
            <ul className="list-disc pl-5 text-sm">{(v.remediation || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
          </Section>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="mb-1 font-medium">CVSS</h3>
            <p className="text-3xl font-semibold">{v.cvssScore}</p>
            <div className="mt-2"><SeverityBadge severity={v.severity} /></div>
          </Card>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">AI Security Analysis</h3>
              <Button variant="outline" disabled={ai.isPending} onClick={() => ai.mutate()}>{ai.isPending ? 'Analyzing…' : 'Refresh'}</Button>
            </div>
            {v.aiAnalysis?.classification
              ? (<div className="text-sm"><p><b>Classification:</b> {v.aiAnalysis.classification} ({v.aiAnalysis.confidence}%)</p>
                <p className="mt-1"><b>Impact:</b> {v.aiAnalysis.impact}</p>
                <p className="mt-1"><b>Fix:</b> {(v.aiAnalysis.remediation || []).join(' | ')}</p>
                <p className="mt-1 text-xs text-slate-500">{v.aiAnalysis.priorityReason} · Presented as assistance, not truth.</p></div>)
              : <p className="text-sm text-slate-500">No AI analysis yet — click Refresh.</p>}
            {ai.isError && <p className="mt-2 text-sm text-red-600">{errMsg(ai.error)}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return <div className="border-t border-slate-100 py-3 first:border-0 first:pt-0 dark:border-slate-800"><h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>{children}</div>;
}
