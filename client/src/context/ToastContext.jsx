import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { playCyberSound } from '../lib/playCyberSound';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = 'info',
      title,
      message,
      actionLabel,
      onAction,
      duration = 5000,
    }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newToast = {
        id,
        type,
        title: title || getDefaultTitle(type),
        message,
        actionLabel,
        onAction,
        timestamp,
      };

      // Play synthesized cyber audio feedback
      playCyberSound(type);

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toastHelpers = {
    addToast,
    removeToast,
    success: (title, message, options = {}) =>
      addToast({ type: 'success', title, message, ...options }),
    info: (title, message, options = {}) =>
      addToast({ type: 'info', title, message, ...options }),
    warning: (title, message, options = {}) =>
      addToast({ type: 'warning', title, message, ...options }),
    error: (title, message, options = {}) =>
      addToast({ type: 'error', title, message, ...options }),
    critical: (title, message, options = {}) =>
      addToast({ type: 'critical', title, message, ...options }),
  };

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      {/* Cybersecurity Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

function getDefaultTitle(type) {
  switch (type) {
    case 'critical':
      return 'Critical Security Alert';
    case 'warning':
      return 'Security Warning';
    case 'success':
      return 'Security Operation Complete';
    case 'error':
      return 'Operation Error';
    default:
      return 'Security Notification';
  }
}

function ToastItem({ toast, onClose }) {
  const { type, title, message, actionLabel, onAction, timestamp } = toast;

  const typeStyles = {
    critical: {
      border: 'border-red-500/60 bg-[#120709]',
      badge: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      badgeText: 'CRITICAL ALERT',
    },
    warning: {
      border: 'border-amber-500/50 bg-[#140f07]',
      badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      badgeText: 'WARNING',
    },
    success: {
      border: 'border-emerald-500/50 bg-[#07130c]',
      badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      badgeText: 'SUCCESS',
    },
    error: {
      border: 'border-rose-500/50 bg-[#14070a]',
      badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      icon: XCircle,
      iconColor: 'text-rose-400',
      badgeText: 'ERROR',
    },
    info: {
      border: 'border-cyan-500/50 bg-[#071018]',
      badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      icon: Info,
      iconColor: 'text-cyan-400',
      badgeText: 'INFO',
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto rounded-xl border ${style.border} p-3.5 shadow-2xl backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${style.badge}`}>
          <Icon size={15} className={style.iconColor} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase ${style.badge}`}>
              {style.badgeText}
            </span>
            <span className="font-mono text-[10px] text-slate-500">{timestamp}</span>
          </div>

          <h4 className="font-bold text-xs text-white truncate mt-1">{title}</h4>
          {message && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{message}</p>}

          {actionLabel && (
            <button
              onClick={() => {
                if (onAction) onAction();
                onClose();
              }}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              {actionLabel} <ArrowRight size={12} />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-1 text-slate-500 hover:text-slate-200 transition"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
