import { cn } from '../../lib/utils';

// Glass command-panel card — single source of truth for every page.
export function Card({ className, children }) {
  return (
    <div className={cn(
      'rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition duration-200',
      'hover:border-slate-700/80 hover:bg-slate-900 hover:shadow-md',
      className
    )}> 
      {children}
    </div>
  );
}

export function Button({ className, variant = 'primary', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-cyan-600 text-white font-semibold shadow-sm hover:bg-cyan-500 hover:border-cyan-400/40 border border-cyan-500/30'
      : variant === 'outline'
        ? 'border border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200';
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition duration-150 disabled:opacity-50', styles, className)} {...props} />;
}

export function Input({ className, ...props }) {
  return <input className={cn('w-full rounded-lg border border-slate-800 bg-[#0a0f1e] px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-slate-500', className)} {...props} />;
}

import { CustomSelect } from './CustomSelect';

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

export function Label({ children }) {
  return <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{children}</label>;
}
