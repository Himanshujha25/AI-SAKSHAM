import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/shared/shared';
import { Card, Select, Label } from '../../components/ui/primitives';

export function Activity() {
  const [projectId, setProjectId] = useState('');
  const projects = useQuery({ queryKey: ['projects-mini'], queryFn: async () => (await api.get('/projects')).data });
  const qs = projectId ? `?projectId=${projectId}&limit=100` : '?limit=100';
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => (await api.get(`/activity${qs}`)).data,
  });

  return (
    <div>
      <PageHeader title="Activity Audit Trail" subtitle="Logins, scans, verifications, retests, AI runs and report exports" />
      <Card className="mb-4">
        <div className="max-w-xs">
          <Label>Filter by project</Label>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">All my projects</option>
            {(projects.data?.projects || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
        </div>
      </Card>

      {isLoading && <LoadingState label="Loading audit trail…" />}
      {isError && <ErrorState message="Could not load activity." onRetry={() => refetch()} />}
      {!isLoading && !isError && (data?.events || []).length === 0 && (
        <EmptyState title="No events yet" hint="Assessment activity will appear here." />
      )}

      <div className="relative space-y-0 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
        {(data?.events || []).map((e) => (
          <div key={e._id} className="relative pb-5">
            <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 shadow-[0_0_10px_1px_rgba(34,211,238,0.6)]">
              <ScrollText size={9} className="text-slate-950" />
            </span>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:-translate-y-px hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-medium">{e.action} <span className="font-normal text-slate-500 dark:text-slate-400">{e.detail}</span></p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                {new Date(e.createdAt).toLocaleString()} {e.actor ? `· ${e.actor.name} (${e.actor.role})` : '· system'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
