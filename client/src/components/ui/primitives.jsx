import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from './CustomSelect';

// Glass command-panel card — single source of truth for every page.
export function Card({ className, children, selected = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4 sm:p-5 shadow-sm transition duration-200',
        'hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-white dark:hover:bg-slate-900',
        selected && 'border-cyan-500/50 bg-blue-50 dark:bg-cyan-950/20 shadow-cyan-950/40 ring-1 ring-cyan-500/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    loading = false,
    loadingText,
    selected = false,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  const styles =
    variant === 'primary'
      ? 'bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_24px_rgba(15,31,61,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] text-slate-700 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-white/85 dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.98]'
      : variant === 'outline'
        ? 'border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl text-slate-700 dark:text-slate-200 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-white/85 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/15 active:scale-[0.98]'
        : variant === 'danger'
          ? 'border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/20 active:scale-[0.98]'
          : variant === 'success'
            ? 'border border-emerald-600 bg-emerald-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600 shadow-md shadow-emerald-500/25 active:scale-[0.98]'
            : variant === 'ghost'
              ? 'text-slate-500 dark:text-slate-400 hover:bg-white/85 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-100 font-mono text-[11px] font-bold uppercase tracking-wider active:scale-[0.98]'
              : '';

  const selectedStyles = selected
    ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
    : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] select-none items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#04060d]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        styles,
        selectedStyles,
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-current" aria-hidden="true" />}
      <span>{loading ? loadingText || children : children}</span>
    </button>
  );
});

export const Input = forwardRef(function Input({ className, id, ...props }, ref) {
  return (
    <input
      ref={ref}
      id={id}
      className={cn(
        'w-full min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1e] px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none transition',
        'focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 placeholder-slate-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
});

export function Select({ className, children, value, onChange, placeholder, disabled, name, id, ...props }) {
  return (
    <CustomSelect
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      id={id}
      {...props}
    >
      {children}
    </CustomSelect>
  );
}

export function Label({ children, htmlFor, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400', className)}
    >
      {children}
    </label>
  );
}

