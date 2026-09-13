import { cn } from '../../lib/utils';
import { CustomSelect } from './CustomSelect';

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
      ? 'bg-white/[0.08] backdrop-blur-xl border border-white/[0.14] text-white font-mono text-[11px] font-bold uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.12] hover:border-white/20'
      : variant === 'outline'
        ? 'border border-white/10 bg-white/[0.04] backdrop-blur-xl text-slate-200 font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-white/[0.08] hover:text-white hover:border-white/15'
        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 hover:backdrop-blur-xl font-mono text-[11px] font-bold uppercase tracking-wider';
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed', styles, className)} {...props} />;
}

export function Input({ className, ...props }) {
  return <input className={cn('w-full rounded-lg border border-slate-800 bg-[#0a0f1e] px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 placeholder-slate-500', className)} {...props} />;
}

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
