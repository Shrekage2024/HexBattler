import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
    socket = io(url, { autoConnect: false });
  }
  return socket;
};
