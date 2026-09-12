import { cn } from '../../lib/utils';

// Glass command-panel card — single source of truth for every page.
export function Card({ className, children }) {
  return (
    <div className={cn(
      'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md',
      'dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:hover:border-cyan-400/30 dark:hover:shadow-[0_0_50px_-12px_rgba(34,211,238,0.35)]',
      className
    )}>
      {children}
    </div>
  );
}

export function Button({ className, variant = 'primary', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-slate-900 text-white shadow-sm hover:-translate-y-px hover:bg-slate-700 hover:shadow-md dark:bg-cyan-400 dark:text-slate-950 dark:shadow-[0_0_24px_-6px_rgba(34,211,238,0.7)] dark:hover:-translate-y-px dark:hover:bg-cyan-300 dark:hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.8)]'
      : variant === 'outline'
        ? 'border border-slate-300 hover:-translate-y-px hover:bg-slate-100 hover:shadow-md dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10';
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition duration-200 disabled:opacity-50', styles, className)} {...props} />;
}

export function Input({ className, ...props }) {
  return <input className={cn('w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:shadow-sm dark:border-white/15 dark:bg-[#0a0f1e] dark:focus:border-cyan-400/60 dark:focus:shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)]', className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return <select className={cn('rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:border-slate-400 dark:border-white/15 dark:bg-[#0a0f1e] dark:hover:border-cyan-400/40', className)} {...props}>{children}</select>;
}

export function Label({ children }) {
  return <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{children}</label>;
}
