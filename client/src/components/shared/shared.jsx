import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Severity colors — clean, minimal enterprise dark mode badges.
const SEVERITY_STYLES = {
  Critical: 'bg-red-500/15 text-red-400 border border-red-500/30 font-medium',
  High: 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-medium',
  Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium',
  Low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
  Informational: 'bg-slate-800 text-slate-300 border border-slate-700 font-medium',
};

const STATUS_STYLES = {
  Verified: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
  'Under Review': 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium',
  Potential: 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-medium',
  Detected: 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-medium',
  'False Positive': 'bg-slate-800 text-slate-400 border border-slate-700/60 font-medium',
  Resolved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
  'Accepted Risk': 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-medium',
  RUNNING: 'bg-sky-500/15 text-sky-400 border border-sky-500/40 font-medium',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium',
  FAILED: 'bg-red-500/15 text-red-400 border border-red-500/30 font-medium',
  QUEUED: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium',
  CANCELLED: 'bg-slate-800 text-slate-400 border border-slate-700/60 font-medium',
};

export function SeverityBadge({ severity }) {
  return <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs transition duration-150', SEVERITY_STYLES[severity] || SEVERITY_STYLES.Informational)}>{severity}</span>;
}

export function StatusBadge({ status }) {
  return <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs transition duration-150', STATUS_STYLES[status] || 'bg-slate-800 text-slate-300 border border-slate-700')}>{status}</span>;
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

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition duration-200 hover:border-slate-700 hover:bg-slate-900">
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {Icon && <Icon size={16} className="text-slate-500 transition duration-150 group-hover:text-slate-300" />}
      </div>
      <p className="mt-2.5 text-3xl font-bold leading-none tracking-tight text-white font-mono">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-slate-500 group-hover:text-slate-400">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Scanning…' }) {
  return (
    <div className="animate-pulse rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
      <span className="live-dot relative mx-auto mb-3 block h-2 w-2 rounded-full bg-cyan-500 text-cyan-500" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center transition hover:border-slate-700 hover:bg-slate-900/70">
      <p className="font-medium text-slate-200">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
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
