import { cn } from '../../lib/utils';

const SEVERITY_STYLES = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Informational: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_STYLES = {
  Verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'Under Review': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Potential: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  Detected: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'False Positive': 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'Accepted Risk': 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  RUNNING: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  QUEUED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function SeverityBadge({ severity }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', SEVERITY_STYLES[severity] || SEVERITY_STYLES.Informational)}>{severity}</span>;
}

export function StatusBadge({ status }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300')}>{status}</span>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">{label}</div>;
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-2 underline">Retry</button>}
    </div>
  );
}
