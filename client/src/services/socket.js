import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to real-time server:', socket.id);
      const userStr = localStorage.getItem('agentflow_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) {
            socket.emit('join:user', user.id);
          }
        } catch {
          // Ignore
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ [Socket.IO] Disconnected:', reason);
    });
  }

  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave:execution', executionId);
  }
};
