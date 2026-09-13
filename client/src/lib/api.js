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
      // Only redirect if we're not on a public page (landing, auth pages, etc)
      const currentPath = window.location.pathname;
      const isPublicPage = currentPath === '/' || currentPath.startsWith('/auth');
      if (!isPublicPage && !currentPath.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
