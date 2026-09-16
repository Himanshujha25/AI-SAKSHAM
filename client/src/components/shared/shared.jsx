import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Info,
  Clock,
  Activity,
  XCircle,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Severity colors, icons & status configurations — professional enterprise dark mode badges.
const SEVERITY_CONFIG = {
  Critical: { style: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30', dot: 'bg-red-500', icon: AlertOctagon },
  High: { style: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30', dot: 'bg-orange-500', icon: AlertTriangle },
  Medium: { style: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500', icon: BarChart2 },
  Low: { style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  Informational: { style: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400', icon: Info },
};

const STATUS_CONFIG = {
  Verified: { style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  'Under Review': { style: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500', icon: Clock },
  Potential: { style: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30', dot: 'bg-sky-500', icon: Activity },
  Detected: { style: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30', dot: 'bg-sky-500', icon: Activity },
  'False Positive': { style: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500', icon: Shield },
  Resolved: { style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  'Accepted Risk': { style: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30', dot: 'bg-purple-500', icon: Shield },
  RUNNING: { style: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/40', dot: 'bg-sky-400 animate-pulse', icon: Activity },
  COMPLETED: { style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  FAILED: { style: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30', dot: 'bg-red-500', icon: XCircle },
  QUEUED: { style: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500', icon: Clock },
  CANCELLED: { style: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500', icon: Shield },
};

export function SeverityBadge({ severity, className }) {
  const conf = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Informational;
  const SevIcon = conf.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        conf.style,
        className
      )}
      role="status"
      aria-label={`Severity: ${severity}`}
    >
      <SevIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{severity}</span>
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const conf = STATUS_CONFIG[status] || { style: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400', icon: Info };
  const StatIcon = conf.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        conf.style,
        className
      )}
      role="status"
      aria-label={`Status: ${status}`}
    >
      <StatIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function MicroLabel({ children, className }) {
  return <p className={cn('font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400', className)}>{children}</p>;
}

// Flat matte icon — no glow, single source of truth for every icon in the app.
const TONE_STYLES = {
  cyan: 'border-cyan-500/25 bg-cyan-500/[0.08] text-cyan-700 dark:text-cyan-300',
  emerald: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300',
  purple: 'border-purple-500/25 bg-purple-500/[0.08] text-purple-700 dark:text-purple-300',
  amber: 'border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300',
  blue: 'border-blue-500/25 bg-blue-500/[0.08] text-blue-700 dark:text-blue-300',
  red: 'border-red-500/25 bg-red-500/[0.08] text-red-700 dark:text-red-300',
  slate: 'border-slate-200 dark:border-slate-700/70 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300',
};

export function PremiumIcon({ icon: Icon, tone = 'cyan', size = 'md', className, iconSize }) {
  const box =
    size === 'lg'
      ? 'h-11 w-11 rounded-xl'
      : size === 'sm'
        ? 'h-7 w-7 rounded-lg'
        : 'h-8 w-8 rounded-lg';
  return (
    <div className={cn('flex shrink-0 items-center justify-center border', box, TONE_STYLES[tone] || TONE_STYLES.cyan, className)}>
      {Icon && <Icon size={iconSize || (size === 'lg' ? 22 : size === 'sm' ? 14 : 16)} strokeWidth={2.1} />}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, live = false, icon: Icon, tone = 'cyan' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && <PremiumIcon icon={Icon} tone={tone} size="lg" />}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-2xl font-bold tracking-tight text-[#0f1f3d] dark:text-white">{title}</h1>
            {live && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-current" /> LIVE
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'cyan' }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-5 shadow-sm dark:shadow-md transition duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-lg">
      <div className="relative flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && <PremiumIcon icon={Icon} tone={tone} size="sm" />}
      </div>
      <p className="mt-2.5 font-mono text-3xl font-extrabold leading-none tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-slate-500 transition group-hover:text-slate-400">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Scanning…' }) {
  return (
    <div className="animate-pulse rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-[#090f1f]/80 p-8 text-center font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <span className="live-dot relative mx-auto mb-3 block h-2 w-2 rounded-full bg-cyan-500 text-cyan-500" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-[#090f1f]/60 p-8 text-center transition hover:border-slate-400 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/60">
      {Icon && (
        <div className="mx-auto mb-3 w-fit">
          <PremiumIcon icon={Icon} tone="slate" size="md" />
        </div>
      )}
      <p className="text-sm font-bold tracking-tight text-[#0f1f3d] dark:text-slate-100">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300" role="alert">
      <div className="flex items-center gap-2 font-bold mb-1">
        <XCircle className="h-4 w-4 text-red-400" />
        <span>Operation Error</span>
      </div>
      <p className="text-xs text-red-200/90">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1.5 font-mono text-xs font-bold text-red-200 hover:bg-red-500/30 transition min-h-[44px]"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}

// —— Skeletons for Cumulative Layout Shift (CLS) Prevention ——
export function SkeletonBlock({ className = '' }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/60', className)} aria-hidden="true" />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-5 rounded-md" />
      </div>
      <SkeletonBlock className="h-8 w-16" />
      <SkeletonBlock className="h-2.5 w-24" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonBlock key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ title = 'Loading Workspace...' }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Loading content">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}

export function AuthSkeleton({ mode = 'register' }) {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#04060d] dark:text-slate-100" aria-busy="true" aria-label="Loading security authentication...">
      {/* Header Skeleton */}
      <header className="shrink-0 h-16 w-full border-b border-slate-200/60 dark:border-white/10 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-8 rounded-lg" />
          <SkeletonBlock className="h-5 w-28" />
        </div>
        <SkeletonBlock className="h-9 w-24 rounded-xl" />
      </header>

      {/* Centered Auth Card Skeleton */}
      <div className="relative flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f]/90 p-5 sm:p-6 shadow-xl dark:shadow-2xl space-y-4">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="h-3.5 w-60" />
          </div>

          <div className="space-y-2.5">
            {mode === 'register' && (
              <div className="space-y-1">
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonBlock className="h-10 w-full rounded-lg" />
              </div>
            )}
            <div className="space-y-1">
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-1">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>

            {mode === 'register' ? (
              <div className="space-y-1 pt-1">
                <SkeletonBlock className="h-3 w-28" />
                <div className="grid grid-cols-3 gap-2">
                  <SkeletonBlock className="h-14 rounded-xl" />
                  <SkeletonBlock className="h-14 rounded-xl" />
                  <SkeletonBlock className="h-14 rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 py-1">
                <SkeletonBlock className="h-14 rounded-xl" />
                <SkeletonBlock className="h-14 rounded-xl" />
                <SkeletonBlock className="h-14 rounded-xl" />
              </div>
            )}

            <SkeletonBlock className="h-10 w-full rounded-xl mt-3" />
            <SkeletonBlock className="h-9 w-full rounded-xl" />
          </div>

          <div className="flex justify-center pt-1">
            <SkeletonBlock className="h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { SakshamLogo, SakshamIcon } from './SakshamLogo';


