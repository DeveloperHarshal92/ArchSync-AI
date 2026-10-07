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
import { getProjectRoom, getProjectVersion, setProjectVersion } from '../rooms';

/**
 * Checks authorization and room membership before processing architecture mutations
 */
function verifyMutationAccess(
  socket: AppSocket,
  projectId: string
): boolean {
  if (socket.data.currentProjectId !== projectId) {
    socket.emit('error', {
      code: 'NOT_IN_PROJECT',
      message: 'You must join the project room before submitting architecture updates',
    });
    return false;
  }

  const role = socket.data.projectRole;
  if (role !== 'OWNER' && role !== 'EDITOR') {
    socket.emit('error', {
      code: 'FORBIDDEN',
      message: 'Viewers cannot modify architecture',
    });
    return false;
  }

  return true;
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

export function handleNodeCreate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeCreateEvent
): void {
  const result = nodeCreateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node create payload',
    });
    return;
  }

  const payload = result.data as NodeCreateEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:create', payload);
}

export function handleNodeUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeUpdateEvent
): void {
  const result = nodeUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node update payload',
    });
    return;
  }

  const payload = result.data as NodeUpdateEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:update', payload);
}

export function handleNodeDelete(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: NodeDeleteEvent
): void {
  const result = nodeDeleteSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid node delete payload',
    });
    return;
  }

  const payload = result.data as NodeDeleteEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('node:delete', payload);
}

export function handleEdgeCreate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeCreateEvent
): void {
  const result = edgeCreateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge create payload',
    });
    return;
  }

  const payload = result.data as EdgeCreateEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:create', payload);
}

export function handleEdgeUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeUpdateEvent
): void {
  const result = edgeUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge update payload',
    });
    return;
  }

  const payload = result.data as EdgeUpdateEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:update', payload);
}

export function handleEdgeDelete(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: EdgeDeleteEvent
): void {
  const result = edgeDeleteSchema.safeParse(rawPayload);
  if (!result.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: result.error.issues[0]?.message || 'Invalid edge delete payload',
    });
    return;
  }

  const payload = result.data as EdgeDeleteEvent;
  if (!verifyMutationAccess(socket, payload.projectId)) return;
  if (!checkAndAdvanceVersion(payload.projectId, payload.version)) return;

  const room = getProjectRoom(payload.projectId);
  socket.to(room).emit('edge:delete', payload);
}
