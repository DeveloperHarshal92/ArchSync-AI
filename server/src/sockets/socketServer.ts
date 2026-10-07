import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { AppServer, AppSocket } from './types';
import { socketAuthMiddleware } from './auth';
import { handleProjectJoin, handleProjectLeave } from './handlers/projectRoom';
import {
  handleNodeCreate,
  handleNodeUpdate,
  handleNodeDelete,
  handleEdgeCreate,
  handleEdgeUpdate,
  handleEdgeDelete,
} from './handlers/architecture';
import { handleCursorUpdate, handlePresenceUpdate } from './handlers/presence';
import { removeSocketFromAllRooms, getProjectRoom } from './rooms';

let ioInstance: AppServer | null = null;

/**
 * Initializes and mounts the Socket.IO server on top of HTTP server
 */
export function initSocketServer(httpServer: HttpServer): AppServer {
  const io: AppServer = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Enforce authentication on all incoming socket connections
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: AppSocket) => {
    // 1. Room lifecycle
    socket.on('project:join', (payload) => handleProjectJoin(io, socket, payload));
    socket.on('project:leave', (payload) => handleProjectLeave(io, socket, payload));

    // 2. Architecture mutations
    socket.on('node:create', (payload) => handleNodeCreate(io, socket, payload));
    socket.on('node:update', (payload) => handleNodeUpdate(io, socket, payload));
    socket.on('node:delete', (payload) => handleNodeDelete(io, socket, payload));
    socket.on('edge:create', (payload) => handleEdgeCreate(io, socket, payload));
    socket.on('edge:update', (payload) => handleEdgeUpdate(io, socket, payload));
    socket.on('edge:delete', (payload) => handleEdgeDelete(io, socket, payload));

    // 3. Presence & cursor
    socket.on('cursor:update', (payload) => handleCursorUpdate(io, socket, payload));
    socket.on('presence:update', (payload) => handlePresenceUpdate(io, socket, payload));

    // 4. Automatic disconnection cleanup
    socket.on('disconnect', () => {
      const removals = removeSocketFromAllRooms(socket.id);
      for (const { projectId } of removals) {
        socket.to(getProjectRoom(projectId)).emit('presence:leave', {
          projectId,
          userId: socket.data.user.id,
        });
      }
    });
  });

  ioInstance = io;
  return io;
}

/**
 * Returns current Socket.IO server instance if initialized
 */
export function getSocketServer(): AppServer | null {
  return ioInstance;
}

/**
 * Closes Socket.IO server gracefully during shutdown
 */
export async function closeSocketServer(): Promise<void> {
  if (ioInstance) {
    await new Promise<void>((resolve) => {
      ioInstance!.close(() => {
        resolve();
      });
    });
    ioInstance = null;
  }
}
