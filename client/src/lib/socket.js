import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const base = apiBase.replace(/\/api\/v1\/?$/, '');
  socket = io(base, { autoConnect: true, transports: ['websocket', 'polling'] });
  return socket;
}
