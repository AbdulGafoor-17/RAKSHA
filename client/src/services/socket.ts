import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io((import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ [RAKSHA Socket] Connected to real-time coordination server with ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ [RAKSHA Socket] Disconnected from server');
    });
  }

  return socket;
}
