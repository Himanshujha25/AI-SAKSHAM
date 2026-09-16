import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { playCyberSound } from '../../lib/playCyberSound';

export function CustomSelect({
  value,
  onChange,
  options: optionsProp,
  children,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  name,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options from options prop or React children <option>
  let normalizedOptions = [];
  if (optionsProp && Array.isArray(optionsProp)) {
    normalizedOptions = optionsProp.map((opt) =>
      typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
    );
  } else if (children) {
    React.Children.forEach(children, (child) => {
      if (child && child.props) {
        normalizedOptions.push({
          value: child.props.value !== undefined ? child.props.value : child.props.children,
          label: child.props.children || child.props.value,
          disabled: child.props.disabled,
        });
      }
    });
  }

  // Click outside dismissal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  const handleSelect = (val, isDisabled) => {
    if (isDisabled || disabled) return;
    playCyberSound('click');
    if (onChange) {
      // Synthesize event object for 100% compatibility with e.target.value
      onChange({
        target: { value: val, name, id },
        preventDefault: () => {},
        stopPropagation: () => {},
      });
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', isOpen ? 'z-[100]' : 'z-10', className.includes('w-') ? '' : 'w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            playCyberSound('click');
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition duration-150',
          'hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40',
          isOpen && 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 ring-1 ring-cyan-500/30',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-blue-600 dark:text-cyan-400')}
        />
      </button>

      {/* Options Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-[9999] mt-1.5 max-h-60 w-full min-w-[140px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-1 shadow-sm dark:shadow-2xl backdrop-blur-lg"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-500">No options</div>
            ) : (
              normalizedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition duration-150 text-left',
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#0f1f3d] dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white',
                      opt.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={13} className="shrink-0 text-blue-600 dark:text-cyan-400 ml-1.5" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomSelect;
