import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Severity colors — neon glow in dark command mode, soft pastel in light.
const SEVERITY_STYLES = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300 dark:shadow-[0_0_18px_-4px_rgba(248,113,113,0.7)] dark:ring-1 dark:ring-red-400/30',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300 dark:shadow-[0_0_18px_-4px_rgba(251,146,60,0.6)] dark:ring-1 dark:ring-orange-400/30',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-1 dark:ring-amber-400/30',
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/30',
  Informational: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 dark:ring-1 dark:ring-white/15',
};

const STATUS_STYLES = {
  Verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/30',
  'Under Review': 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-1 dark:ring-amber-400/30',
  Potential: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-1 dark:ring-sky-400/30',
  Detected: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-1 dark:ring-sky-400/30',
  'False Positive': 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400 dark:ring-1 dark:ring-white/15',
  Resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/30',
  'Accepted Risk': 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-1 dark:ring-purple-400/30',
  RUNNING: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-1 dark:ring-sky-400/40',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/30',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300 dark:ring-1 dark:ring-red-400/30',
  QUEUED: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-1 dark:ring-amber-400/30',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400 dark:ring-1 dark:ring-white/15',
};

export function SeverityBadge({ severity }) {
  return <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:scale-105', SEVERITY_STYLES[severity] || SEVERITY_STYLES.Informational)}>{severity}</span>;
}

export function StatusBadge({ status }) {
  return <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:scale-105', STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300')}>{status}</span>;
}

export function MicroLabel({ children, className }) {
  return <p className={cn('text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400', className)}>{children}</p>;
}

export function PageHeader({ title, subtitle, actions, live = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-wrap items-start justify-between gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
          {live && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
              <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-current" /> LIVE
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({ label, value, hint, accent = 'cyan', icon: Icon }) {
  const accents = {
    cyan: 'dark:hover:shadow-[0_0_32px_-6px_rgba(34,211,238,0.6)]',
    red: 'dark:hover:shadow-[0_0_32px_-6px_rgba(248,113,113,0.6)]',
    amber: 'dark:hover:shadow-[0_0_32px_-6px_rgba(251,191,36,0.6)]',
    emerald: 'dark:hover:shadow-[0_0_32px_-6px_rgba(52,211,153,0.6)]',
  };
  const accentBorders = {
    cyan: 'dark:group-hover:border-cyan-400/40',
    red: 'dark:group-hover:border-red-400/40',
    amber: 'dark:group-hover:border-amber-400/40',
    emerald: 'dark:group-hover:border-emerald-400/40',
  };
  const accentGlows = {
    cyan: 'group-hover:text-cyan-300 group-hover:text-glow-cyan',
    red: 'group-hover:text-red-300 group-hover:text-glow-red',
    amber: 'group-hover:text-amber-300',
    emerald: 'group-hover:text-emerald-300',
  };

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 backdrop-blur transition duration-300',
      'hover:-translate-y-1 hover:border-white/[0.15]',
      accentBorders[accent],
      accents[accent]
    )}>
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/5 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {Icon && <Icon size={16} className={cn('text-slate-500 transition group-hover:scale-125', accentGlows[accent])} />}
      </div>
      <p className="mt-2.5 text-3xl font-bold leading-none tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-slate-500 group-hover:text-slate-400">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Scanning…' }) {
  return (
    <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-white/[0.02] dark:text-slate-400">
      <span className="live-dot relative mx-auto mb-3 block h-2 w-2 rounded-full bg-cyan-500 text-cyan-500" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center transition hover:border-slate-400 hover:shadow-sm dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-cyan-400/30">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-2 font-medium underline underline-offset-4 transition hover:opacity-80">Retry</button>}
    </div>
  );
}
