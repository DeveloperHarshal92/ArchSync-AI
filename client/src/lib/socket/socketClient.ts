import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@archsync/shared';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

/**
 * Returns or initializes the shared Socket.IO client instance
 * Enforces withCredentials: true to send HTTP-only authentication cookies
 */
export function getSocket(customUrl?: string): TypedSocket {
  if (!socketInstance) {
    const url = customUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    socketInstance = io(url, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
  }
  return socketInstance;
}

/**
 * Cleanly disconnects and tears down the socket connection
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
