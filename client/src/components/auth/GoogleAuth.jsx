import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { errMsg, safeNext } from '../../lib/utils';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisPromise = null;

function loadGis() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Google script failed to load'));
      document.head.appendChild(s);
    });
  }
  return gisPromise;
}

// Official multi-color "G" mark (inline SVG, no extra dependency).
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8-.1.1C3.5 21.3 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.6 0 10.2 0 12s.5 3.4 1.4 4.9l3.8-2.5z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.5 2.7 1.4 6.8l3.8 2.9c1-2.9 3.7-5 6.8-5z" />
    </svg>
  );
}

// Premium frosted "Sign in with Google" button.
//
// How it logs in (two independent paths, same backend verification):
//  1. Silent One Tap on page load (logged-out visitors only) — zero clicks.
//  2. Button click → Google's account popup (OAuth code flow). The one-time
//     code is exchanged server-side with the client secret, so login works
//     even when the browser blocks FedCM/One Tap.
//
// NOTE: Google's own iframe button is intentionally NOT used so the button
// matches the app's frosted-glass design system.
export function GoogleAuth({ text = 'continue_with' }) {
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // After Google login, return to the page the user was on (?next= / state).
  const target = safeNext(new URLSearchParams(location.search).get('next') || location.state?.from);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const initRef = useRef(false);
  const codeClientRef = useRef(null);
  const mountedRef = useRef(true);

  const ensureInit = async () => {
    await loadGis();
    if (initRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      // One Tap credential path (silent auto prompt only).
      callback: async (resp) => {
        if (!resp?.credential) return;
        try { window.google.accounts.id.cancel(); } catch { /* ignore */ }
        if (mountedRef.current) { setError(''); setBusy(true); }
        try {
          await googleLogin({ idToken: resp.credential });
          try { window.google.accounts.id.cancel(); } catch { /* ignore */ }
          navigate(target, { replace: true });
        } catch (e) {
          if (mountedRef.current) {
            setError(errMsg(e, 'Google login failed'));
            setBusy(false);
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    initRef.current = true;
  };

  // Silent auto One Tap — only for logged-out visitors on auth pages.
  // Logged-in users never reach here (route guard), so no post-login popup.
  useEffect(() => {
    if (!clientId || user) return;
    let cancelled = false;
    ensureInit()
      .then(() => {
        if (cancelled) return;
        try { window.google.accounts.id.prompt(); } catch { /* ignore */ }
      })
      .catch(() => { /* silent — the button remains as fallback */ });
    return () => {
      cancelled = true;
      try { window.google?.accounts?.id?.cancel(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, user]);

  useEffect(() => () => {
    mountedRef.current = false;
    try { window.google?.accounts?.id?.cancel(); } catch { /* ignore */ }
  }, []);

  // Button click → Google popup (works even when FedCM/One Tap is blocked).
  // Runs directly in the click gesture, so no popup-blocker issues.
  const handleClick = async () => {
    setError('');
    if (!clientId) {
      setError('Google Client ID missing — client/.env me VITE_GOOGLE_CLIENT_ID dalke dev server restart karo.');
      return;
    }
    setBusy(true);
    try {
      await ensureInit();
      if (!codeClientRef.current) {
        codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (resp) => {
            if (resp?.error || !resp?.code) {
              if (mountedRef.current) {
                setBusy(false);
                if (resp?.error && resp.error !== 'popup_closed_by_user') {
                  setError('Google popup failed — dobara try karo.');
                }
              }
              return;
            }
            if (mountedRef.current) setError('');
            try {
              await googleLogin({ code: resp.code });
              navigate(target, { replace: true });
            } catch (e) {
              if (mountedRef.current) {
                setError(errMsg(e, 'Google login failed'));
                setBusy(false);
              }
            }
          },
        });
      }
      codeClientRef.current.requestCode();
    } catch {
      if (mountedRef.current) {
        setBusy(false);
        setError('Could not load Google Sign-In. Check your connection and retry.');
      }
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-[0_8px_24px_rgba(15,31,61,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:bg-white/90 hover:border-slate-300 disabled:opacity-70 disabled:cursor-wait dark:bg-white/[0.08] dark:border-white/[0.14] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.12]"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <GoogleMark />}
        {busy ? 'Connecting to Google…' : text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google'}
      </button>
      {error && <p className="mt-2 text-center text-xs font-medium text-red-600 dark:text-amber-400">{error}</p>}
    </div>
  );
}
