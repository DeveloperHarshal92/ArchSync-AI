import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
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
import { ProjectMemberRole } from '@archsync/shared';
import { removeSocketFromAllRooms, getProjectRoom, removeCollaborator } from './rooms';

let ioInstance: AppServer | null = null;

import { getAllowedOrigins } from '../app';

/**
 * Initializes and mounts the Socket.IO server on top of HTTP server
 */
export function initSocketServer(httpServer: HttpServer): AppServer {
  const allowedOrigins = getAllowedOrigins();

  const io: AppServer = new Server(httpServer, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        const normalized = requestOrigin.trim().replace(/\/+$/, '');
        if (allowedOrigins.includes(normalized)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
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

/**
 * Dynamically synchronizes or revokes project membership access for all connected sockets
 * of a target user.
 * - If newRole is null, the user was removed: socket leaves the room, presence is cleaned up,
 *   presence:leave is broadcast to remaining collaborators, and MEMBERSHIP_REVOKED is emitted to the target socket.
 * - If newRole is updated (e.g. downgraded to VIEWER), socket.data.projectRole is immediately updated,
 *   blocking subsequent architecture mutations.
 */
export function syncSocketMembership(
  projectId: string,
  userId: string,
  newRole: ProjectMemberRole | null
): void {
  if (!ioInstance) return;

  const room = getProjectRoom(projectId);
  for (const [, socket] of ioInstance.sockets.sockets) {
    if (socket.data.user?.id === userId && socket.data.currentProjectId === projectId) {
      if (newRole === null) {
        // Membership revoked: evict socket immediately from room
        socket.data.projectRole = undefined;
        socket.data.currentProjectId = undefined;
        socket.leave(room);
        removeCollaborator(projectId, socket.id);

        socket.to(room).emit('presence:leave', {
          projectId,
          userId,
        });

        socket.emit('error', {
          code: 'MEMBERSHIP_REVOKED',
          message: 'Your membership in this project has been revoked',
        });
      } else {
        // Role updated: update in-memory role immediately
        socket.data.projectRole = newRole;

        socket.emit('error', {
          code: 'ROLE_UPDATED',
          message: `Your project role has been changed to ${newRole}`,
        });
      }
    }
  }
}

