import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, Radar, FlaskConical, BadgeCheck, SearchCheck } from 'lucide-react';
import api from '../../lib/api';
import { PageHeader, StatCard, LoadingState, ErrorState, EmptyState, StatusBadge, SeverityBadge, MicroLabel } from '../../components/shared/shared';
import { Card } from '../../components/ui/primitives';

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#94a3b8'];

const SOURCE_DEFS = [
  { key: 'api', label: 'API Endpoints' },
  { key: 'route', label: 'Routes' },
  { key: 'technology', label: 'Technologies' },
  { key: 'header', label: 'Security Headers' },
  { key: 'js', label: 'JS Assets' },
  { key: 'dependency', label: 'Dependencies' },
];

function CommandOrb({ value, label, score }) {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center md:h-64 md:w-64">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="orbArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#orbGlow)" className="animate-orb-breathe" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" strokeDasharray="2 7" opacity="0.6" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="100" cy="100" r="64" fill="none" stroke="url(#orbRing)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <circle cx="100" cy="100" r="64" fill="none" stroke="url(#orbArc)" strokeWidth="3" strokeLinecap="round" strokeDasharray="70 332" className="animate-spin-slower" style={{ transformOrigin: '100px 100px' }} />
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
      </svg>
      <div className="relative mx-auto flex max-w-[148px] flex-col items-center text-center">
        <p className="text-5xl font-semibold leading-none tracking-tight text-glow-cyan md:text-5xl">{value}</p>
        <p className="mt-1.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 inline-block whitespace-nowrap rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
          SCORE {score ?? '—'}/100
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard/overview')).data,
  });

  const latestId = data?.recentAssessments?.[0]?._id;
  const assetsQuery = useQuery({
    queryKey: ['dashboard-assets', latestId],
    queryFn: async () => (await api.get(`/assessments/${latestId}`)).data,
    enabled: !!latestId,
  });

  if (isLoading) return <LoadingState label="Establishing command link…" />;
  if (isError) return <ErrorState message="Could not load dashboard. Is the API running?" onRetry={() => refetch()} />;

  const counts = {};
  (assetsQuery.data?.assets || []).forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });
  const pie = Object.entries(data.severity || {}).map(([name, value]) => ({ name, value }));
  const sev = data.severity || {};
  const activeTotal = (sev.Critical || 0) + (sev.High || 0) + (sev.Medium || 0) + (sev.Low || 0);

  const activeRows = [
    { label: 'Critical', value: sev.Critical || 0, hover: 'hover:border-red-400/50 dark:hover:border-red-400/50 dark:hover:shadow-[0_0_26px_-8px_rgba(248,113,113,0.7)]' },
    { label: 'High', value: sev.High || 0, hover: 'hover:border-orange-400/50 dark:hover:border-orange-400/50 dark:hover:shadow-[0_0_26px_-8px_rgba(251,146,60,0.6)]' },
    { label: 'Medium', value: sev.Medium || 0, hover: 'hover:border-amber-400/50 dark:hover:border-amber-400/50 dark:hover:shadow-[0_0_26px_-8px_rgba(251,191,36,0.55)]' },
    { label: 'Low', value: sev.Low || 0, hover: 'hover:border-emerald-400/50 dark:hover:border-emerald-400/50 dark:hover:shadow-[0_0_26px_-8px_rgba(52,211,153,0.55)]' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader live title="Security Command Center" subtitle="Live posture across your authorized projects" />

      {/* ——— Premium Command Panel ——— */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl dark:shadow-[0_0_100px_-20px_rgba(34,211,238,0.3)]"
      >
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        
        {/* Animated accent lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/[0.03] to-cyan-500/0 animate-pulse" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr_1.2fr] lg:items-center">
          {/* Sources */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="min-w-0">
            <MicroLabel className="mb-4 text-slate-400 uppercase tracking-wider">SOURCES · ATTACK SURFACE</MicroLabel>
            <ul className="flex flex-col gap-2.5">
              {SOURCE_DEFS.map((s, idx) => (
                <motion.li 
                  key={s.key} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  className="flex cursor-default items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm backdrop-blur transition duration-150"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-cyan-500/60" />
                    <span className="truncate text-slate-300 font-medium">{s.label}</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {assetsQuery.isLoading ? '…' : (counts[s.key] || 0)}
                  </span>
                </motion.li>
              ))}
            </ul>
            {!latestId && <p className="mt-4 text-xs text-slate-500">Run an assessment to map sources.</p>}
          </motion.div>

          {/* Orb */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }} 
            className="min-w-0 text-center"
          >
            <CommandOrb value={data.totalFindings} label="Tracked Findings" score={data.securityScore} />
          </motion.div>

          {/* Active cases */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="min-w-0">
            <MicroLabel className="mb-4 flex items-center gap-2 text-slate-400 uppercase tracking-wider">
              <span className="live-dot relative inline-block h-2 w-2 rounded-full bg-red-500 text-red-500" />
              ACTIVE CASES ({activeTotal})
            </MicroLabel>
            <div className="flex flex-col gap-2.5">
              {activeRows.map((r, i) => (
                <motion.div 
                  key={r.label} 
                  initial={{ opacity: 0, x: 18 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: 'easeOut' }}
                  className="group"
                >
                  <Link to="/findings" className={`flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 backdrop-blur transition duration-150 ${r.hover}`}>
                    <span className="text-sm text-slate-400 font-medium">{r.label}</span>
                    <span className="text-lg font-bold tracking-tight text-white">{r.value}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <MicroLabel className="mb-3 mt-5 text-slate-400 uppercase tracking-wider">RESOLVED SIGNAL</MicroLabel>
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 backdrop-blur transition duration-150">
              <span className="text-sm text-slate-400 font-medium">Verified Findings</span>
              <span className="text-lg font-bold tracking-tight text-white">{data.verifiedFindings}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ——— Premium Stat Cards Strip ——— */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
      >
        <StatCard label="Security Score" value={data.securityScore ?? '—'} hint="/ 100" accent="cyan" icon={ShieldCheck} />
        <StatCard label="Total Findings" value={data.totalFindings} accent="cyan" icon={Radar} />
        <StatCard label="Assessments" value={data.recentAssessments?.length ?? 0} hint="recent" accent="cyan" icon={FlaskConical} />
        <StatCard label="Under Review" value={(data.recentFindings || []).filter((f) => f.status === 'Under Review').length} accent="amber" icon={SearchCheck} />
        <StatCard label="Verified" value={data.verifiedFindings} accent="emerald" icon={BadgeCheck} />
      </motion.div>

      {/* ——— Premium Content Grid ——— */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <PremiumCard>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Severity Distribution
            </h2>
          </div>
          {pie.every((p) => p.value === 0) ? (
            <EmptyState title="No findings yet" hint="Start an assessment to populate this chart." />
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" outerRadius={80} label strokeWidth={0}>
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, background: '#0a0f1e', border: '1px solid rgba(34,211,238,0.2)', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </PremiumCard>

        <PremiumCard>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Assessment Activity
            </h2>
          </div>
          {(data.activity || []).length === 0 && <EmptyState title="No activity" hint="Project events will appear here." />}
          <ul className="flex flex-col gap-2 text-sm">
            {(data.activity || []).map((a) => (
              <motion.li 
                key={a._id} 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between gap-2 rounded-lg border border-white/[0.05] px-3 py-2.5 transition duration-200 hover:border-cyan-400/20 hover:bg-white/[0.03]"
              >
                <span className="min-w-0 truncate text-slate-300">{a.action} <span className="text-slate-500">{a.detail}</span></span>
                <span className="shrink-0 text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        </PremiumCard>
      </motion.div>

      {/* ——— Recent Findings ——— */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <PremiumCard>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Recent Findings
            </h2>
            <Link to="/findings" className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider transition hover:text-cyan-300">View all →</Link>
          </div>
          {(data.recentFindings || []).length === 0 && <EmptyState title="No findings" hint="Run an assessment on an authorized target." />}
          <ul className="flex flex-col gap-2.5">
            {(data.recentFindings || []).map((f, idx) => (
              <motion.li 
                key={f._id} 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                className="rounded-lg border border-white/[0.08] transition duration-200 hover:border-cyan-400/30 hover:bg-white/[0.04] hover:shadow-[0_0_28px_-10px_rgba(34,211,238,0.3)]"
              >
                <Link to={`/findings/${f._id}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <span className="min-w-0 font-medium text-slate-300"><span className="mr-2 font-mono text-xs text-slate-500">{f.findingId}</span>{f.title}</span>
                  <span className="flex shrink-0 gap-2"><SeverityBadge severity={f.severity} /><StatusBadge status={f.status} /></span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </PremiumCard>
      </motion.div>
    </div>
  );
}

// Premium Card Component
function PremiumCard({ children, className }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl shadow-xl dark:shadow-[0_0_60px_-20px_rgba(34,211,238,0.25)] transition duration-300 hover:border-white/[0.15] hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
