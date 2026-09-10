import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../lib/api';
import { PageHeader, StatCard, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge } from '../../components/shared/shared';
import { Card } from '../../components/ui/primitives';

const COLORS = ['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#64748b'];

export function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard/overview')).data,
  });

  if (isLoading) return <LoadingState label="Loading security overview…" />;
  if (isError) return <ErrorState message="Could not load dashboard. Is the API running?" onRetry={() => refetch()} />;

  const pie = Object.entries(data.severity || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Security Overview" subtitle="Live posture across your authorized projects" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Security Score" value={data.securityScore ?? '—'} hint="/ 100" />
        <StatCard label="Total Findings" value={data.totalFindings} />
        <StatCard label="Critical" value={data.severity?.Critical ?? 0} />
        <StatCard label="High" value={data.severity?.High ?? 0} />
        <StatCard label="Verified" value={data.verifiedFindings} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-medium">Severity Distribution</h2>
          {pie.every((p) => p.value === 0) ? (
            <EmptyState title="No findings yet" hint="Start an assessment to populate this chart." />
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="mb-2 font-medium">Assessment Activity</h2>
          {(data.activity || []).length === 0 && <EmptyState title="No activity" hint="Project events will appear here." />}
          <ul className="flex flex-col gap-2 text-sm">
            {(data.activity || []).map((a) => (
              <li key={a._id} className="flex justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>{a.action} <span className="text-slate-500">{a.detail}</span></span>
                <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Recent Findings</h2>
          <Link to="/findings" className="text-sm underline">View all</Link>
        </div>
        {(data.recentFindings || []).length === 0 && <EmptyState title="No findings" hint="Run an assessment on an authorized target." />}
        <ul className="flex flex-col gap-2">
          {(data.recentFindings || []).map((f) => (
            <li key={f._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <Link to={`/findings/${f._id}`} className="font-medium hover:underline">{f.findingId} · {f.title}</Link>
              <span className="flex gap-2"><SeverityBadge severity={f.severity} /><StatusBadge status={f.status} /></span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
