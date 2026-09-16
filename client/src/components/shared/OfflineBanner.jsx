import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      // Ping check
      await fetch('/favicon.svg', { cache: 'no-store' });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="sticky top-0 z-50 overflow-hidden border-b border-amber-500/30 bg-amber-50 text-amber-800 backdrop-blur-md px-4 py-2 text-xs font-mono shadow-lg dark:bg-amber-950/90 dark:text-amber-200"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong>Offline Mode</strong> — Live assessments and database sync paused until connection restores.
              </span>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-500/40 hover:bg-amber-500/25 transition disabled:opacity-50 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30"
            >
              <RefreshCw className={`h-3 w-3 ${retrying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
