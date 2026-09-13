import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('saksham_ai_token');
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    // Rehydrate the session without ever killing a good token on a mere
    // network hiccup: only a 401 (invalid/expired token) wipes storage.
    // Anything else (server booting, flaky net) keeps the token — one retry,
    // then the UI just waits for the backend instead of logging out.
    const restore = async (retried = false) => {
      try {
        const res = await api.get('/auth/me');
        if (!cancelled) setUser(res.data.user);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          localStorage.removeItem('saksham_ai_token');
          qc.clear();
        } else if (!retried) {
          await new Promise((r) => setTimeout(r, 1200));
          if (!cancelled) await restore(true);
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, [qc]);

  const login = async (email, password) => {
    qc.clear();
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('saksham_ai_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    qc.clear();
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('saksham_ai_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // One-tap Google login: sends the Google credential (ID token from One Tap
  // or one-time code from the popup) to the server, which verifies it and
  // creates/links the Gmail account, then returns our own JWT.
  const googleLogin = async (credential) => {
    qc.clear();
    const res = await api.post('/auth/google', credential);
    localStorage.setItem('saksham_ai_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // Rename only (email/role stay locked). Server returns the fresh user,
  // so every screen (navbar, bot, settings) updates instantly.
  const updateProfile = async (name) => {
    const res = await api.patch('/auth/me', { name });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('saksham_ai_token');
    qc.clear();
    setUser(null);
    // Tell Google not to silently re-select this browser's account (One Tap
    // stays off until the user explicitly clicks Sign in with Google again).
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
