import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Severity colors & status configurations — professional enterprise dark mode badges.
const SEVERITY_CONFIG = {
  Critical: { style: 'bg-red-500/10 text-red-300 border-red-500/30', dot: 'bg-red-500' },
  High: { style: 'bg-orange-500/10 text-orange-300 border-orange-500/30', dot: 'bg-orange-500' },
  Medium: { style: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  Low: { style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
  Informational: { style: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400' },
};

const STATUS_CONFIG = {
  Verified: { style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
  'Under Review': { style: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  Potential: { style: 'bg-sky-500/10 text-sky-300 border-sky-500/30', dot: 'bg-sky-500' },
  Detected: { style: 'bg-sky-500/10 text-sky-300 border-sky-500/30', dot: 'bg-sky-500' },
  'False Positive': { style: 'bg-slate-800 text-slate-400 border-slate-700', dot: 'bg-slate-500' },
  Resolved: { style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
  'Accepted Risk': { style: 'bg-purple-500/10 text-purple-300 border-purple-500/30', dot: 'bg-purple-500' },
  RUNNING: { style: 'bg-sky-500/10 text-sky-300 border-sky-500/40', dot: 'bg-sky-400 animate-pulse' },
  COMPLETED: { style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500' },
  FAILED: { style: 'bg-red-500/10 text-red-300 border-red-500/30', dot: 'bg-red-500' },
  QUEUED: { style: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-500' },
  CANCELLED: { style: 'bg-slate-800 text-slate-400 border-slate-700', dot: 'bg-slate-500' },
};

export function SeverityBadge({ severity, className }) {
  const conf = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Informational;
  return (
    <span
      className={cn(
        'inline-flex items-center shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        conf.style,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5 shrink-0', conf.dot)} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const conf = STATUS_CONFIG[status] || { style: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400' };
  return (
    <span
      className={cn(
        'inline-flex items-center shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        conf.style,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5 shrink-0', conf.dot)} />
      {status}
    </span>
  );
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
