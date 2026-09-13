import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 60000, // 60s timeout for live LLM providers & scans
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('saksham_ai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('saksham_ai_token');
      // Only redirect if we're not on a public page (landing, auth pages, etc).
      // Preserve the current page so re-login lands straight back here.
      const currentPath = window.location.pathname + window.location.search;
      const isPublicPage = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');
      if (!isPublicPage) {
        window.location.href = '/auth/login?next=' + encodeURIComponent(currentPath);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
