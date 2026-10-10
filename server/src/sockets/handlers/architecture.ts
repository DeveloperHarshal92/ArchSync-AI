import { AppServer, AppSocket } from '../types';
import {
  NodeCreateEvent,
  NodeUpdateEvent,
  NodeDeleteEvent,
  EdgeCreateEvent,
  EdgeUpdateEvent,
  EdgeDeleteEvent,
} from '@archsync/shared';
import {
  nodeCreateSchema,
  nodeUpdateSchema,
  nodeDeleteSchema,
  edgeCreateSchema,
  edgeUpdateSchema,
  edgeDeleteSchema,
} from '../../validators/collaboration.validator';
import {
  getProjectRoom,
  getProjectVersion,
  setProjectVersion,
  removeCollaborator,
} from '../rooms';
import { permissionService } from '../../services/permission.service';

/**
 * Checks authorization and room membership before processing architecture mutations.
 * Enforces dynamic membership checks against permissionService to ensure that
 * downgraded or removed members cannot mutate architecture, and handles database errors safely.
 */
async function verifyMutationAccess(
  socket: AppSocket,
  projectId: string
): Promise<boolean> {
  if (socket.data.currentProjectId !== projectId) {
    socket.emit('error', {
      code: 'NOT_IN_PROJECT',
      message: 'You must join the project room before submitting architecture updates',
    });
    return false;
  }

  try {
    const member = await permissionService.getProjectMembership(socket.data.user.id, projectId);
    if (!member) {
      // Member was removed while connected: revoke socket room access immediately
      socket.data.projectRole = undefined;
      socket.data.currentProjectId = undefined;
      socket.leave(getProjectRoom(projectId));
      removeCollaborator(projectId, socket.id);

      socket.to(getProjectRoom(projectId)).emit('presence:leave', {
        projectId,
        userId: socket.data.user.id,
      });

      socket.emit('error', {
        code: 'FORBIDDEN',
        message: 'You are no longer a member of this project',
      });
      return false;
    }

    // Refresh in-memory socket role from authoritative database record
    socket.data.projectRole = member.role;

    if (member.role !== 'OWNER' && member.role !== 'EDITOR') {
      socket.emit('error', {
        code: 'FORBIDDEN',
        message: 'Viewers cannot modify architecture',
      });
      return false;
    }

    return true;
  } catch (_err) {
    // Fail closed: reject mutation rather than granting access based on stale privileges
    socket.emit('error', {
      code: 'AUTHORIZATION_ERROR',
      message: 'Unable to verify project permissions. Architecture mutation rejected.',
    });
    return false;
  }
}

/**
 * Validates version ordering. Ignores stale events.
 */
function checkAndAdvanceVersion(projectId: string, incomingVersion?: number): boolean {
  if (incomingVersion === undefined) return true;

  const currentVersion = getProjectVersion(projectId);
  if (incomingVersion < currentVersion) {
    // Stale mutation event - safely ignored to maintain chronological ordering
    return false;
  }

  setProjectVersion(projectId, incomingVersion);
  return true;
}

export async function handleNodeCreate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeCreateEvent
): Promise<void> {
  const result = nodeCreateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node create payload',
    });
    return;
  }

  const payload = result.data as NodeCreateEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:create', payload);
}

export async function handleNodeUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeUpdateEvent
): Promise<void> {
  const result = nodeUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node update payload',
    });
    return;
  }

  const payload = result.data as NodeUpdateEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:update', payload);
}

export async function handleNodeDelete(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeDeleteEvent
): Promise<void> {
  const result = nodeDeleteSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node delete payload',
    });
    return;
  }

  const payload = result.data as NodeDeleteEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:delete', payload);
}

export async function handleEdgeCreate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeCreateEvent
): Promise<void> {
  const result = edgeCreateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge create payload',
    });
    return;
  }

  const payload = result.data as EdgeCreateEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:create', payload);
}

export async function handleEdgeUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeUpdateEvent
): Promise<void> {
  const result = edgeUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge update payload',
    });
    return;
  }

  const payload = result.data as EdgeUpdateEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:update', payload);
}

export async function handleEdgeDelete(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeDeleteEvent
): Promise<void> {
  const result = edgeDeleteSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge delete payload',
    });
    return;
  }

  const payload = result.data as EdgeDeleteEvent;
  const authorized = await verifyMutationAccess(socket, payload.projectId);
  if (!authorized) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:delete', payload);
}
