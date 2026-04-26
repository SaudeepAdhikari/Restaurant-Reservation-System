import { io } from 'socket.io-client';

const SOCKET_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

let socket;

export function connectOwnerSocket(ownerId) {
  if (!socket) {
    socket = io(SOCKET_BASE, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  }

  if (ownerId) {
    socket.emit('join:owner', ownerId);
  }

  return socket;
}

export function disconnectOwnerSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
