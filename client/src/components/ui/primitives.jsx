import { cn } from '../../lib/utils';

export function Card({ className, children }) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>{children}</div>;
}

export function Button({ className, variant = 'primary', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
      : variant === 'outline'
        ? 'border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50', styles, className)} {...props} />;
}

export function Input({ className, ...props }) {
  return <input className={cn('w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return <select className={cn('rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900', className)} {...props}>{children}</select>;
}

export function Label({ children }) {
  return <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{children}</label>;
}
