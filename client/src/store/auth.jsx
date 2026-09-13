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
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('saksham_ai_token');
        qc.clear();
      })
      .finally(() => setLoading(false));
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
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
