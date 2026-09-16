import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { playCyberSound } from '../../lib/playCyberSound';
import api from '../../lib/api';

function timeAgo(iso) {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return 'recently';
  const m = Math.floor((Date.now() - d) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationCenter() {
  // Real alerts derived from live findings: newest critical/high first.
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/findings')).data,
    refetchInterval: 30000,
  });
  const live = (data?.findings || []).slice(0, 8).map((f) => ({
    id: f._id,
    severity: f.status === 'Verified' ? 'Verified' : f.severity,
    title: f.title,
    desc: (f.impact || f.description || '').slice(0, 90),
    time: timeAgo(f.updatedAt || f.createdAt),
    findingId: f.findingId,
    _realId: f._id,
  }));
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saksham_read_notifs') || '[]');
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saksham_dismissed_notifs') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saksham_read_notifs', JSON.stringify(readIds));
    } catch { /* ignore */ }
  }, [readIds]);

  useEffect(() => {
    try {
      localStorage.setItem('saksham_dismissed_notifs', JSON.stringify(dismissedIds));
    } catch { /* ignore */ }
  }, [dismissedIds]);

  const notifications = live
    .filter((n) => !dismissedIds.includes(n.id))
    .map((n) => ({ ...n, read: readIds.includes(n.id) }));
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const toggleOpen = () => {
    playCyberSound('click');
    setIsOpen((prev) => {
      const next = !prev;
      if (next && live.length > 0) {
        // Automatically mark all as read when opening notification tray
        setReadIds((old) => [...new Set([...old, ...live.map((n) => n.id)])]);
      }
      return next;
    });
  };

  const markAsRead = (id) => {
    playCyberSound('click');
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAsRead = () => {
    playCyberSound('click');
    setReadIds((prev) => [...new Set([...prev, ...live.map((n) => n.id)])]);
  };

  const clearAll = () => {
    playCyberSound('click');
    setDismissedIds((prev) => [...new Set([...prev, ...live.map((n) => n.id)])]);
  };

  const handleAlertClick = (n) => {
    markAsRead(n.id);
    setIsOpen(false);
    navigate(n._realId ? `/findings/${n._realId}` : '/findings');
  };

  const getSeverityStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return { dot: 'bg-red-500', badge: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400', label: 'CRITICAL' };
      case 'high':
        return { dot: 'bg-orange-500', badge: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400', label: 'HIGH' };
      case 'medium':
        return { dot: 'bg-amber-500', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400', label: 'MEDIUM' };
      case 'verified':
        return { dot: 'bg-cyan-500', badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-400', label: 'VERIFIED' };
      default:
        return { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400', label: 'LOW' };
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        title="Security Alerts"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Alert Center Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[999] mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1f] p-4 shadow-sm dark:shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-600 dark:text-cyan-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0f1f3d] dark:text-white">
                  Security Alerts
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded bg-red-500/10 border border-red-500/30 px-1.5 py-0.2 font-mono text-[10px] font-bold text-red-700 dark:text-red-400">
                    {unreadCount} UNREAD
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition"
                    title="Mark all as read"
                  >
                    <CheckCheck size={13} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    title="Clear notifications"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Alert List */}
            <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-0.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No active security alerts
                </div>
              ) : (
                notifications.map((n) => {
                  const style = getSeverityStyle(n.severity);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleAlertClick(n)}
                      className={`group relative flex flex-col gap-1.5 rounded-lg border p-3 transition duration-150 cursor-pointer ${
                        !n.read
                          ? 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/90 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#060a14] opacity-75 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.2 font-mono text-[9px] font-bold ${style.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{n.time}</span>
                      </div>

                      <h4 className="font-semibold text-xs text-[#0f1f3d] dark:text-white truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.desc}</p>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-medium">
                          {n.findingId}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition">
                          View Finding <ArrowRight size={10} />
                        </span>
                      </div>

                      {!n.read && (
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 border-t border-slate-200 dark:border-slate-800/80 pt-2 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/findings');
                }}
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition"
              >
                View Security Findings Center →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

