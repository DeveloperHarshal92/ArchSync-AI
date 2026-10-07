import { AppServer, AppSocket } from '../types';
import { CursorUpdateInput, PresenceUpdateInput } from '@archsync/shared';
import { cursorUpdateSchema, presenceUpdateSchema } from '../../validators/collaboration.validator';
import { getProjectRoom, updateCollaboratorCursor, updateCollaboratorSelection } from '../rooms';

/**
 * Handles ephemeral mouse cursor updates with broadcasting
 */
export function handleCursorUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: CursorUpdateInput
): void {
  const result = cursorUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    return; // Dropped silently for high-frequency cursor updates
  }

  const { projectId, x, y } = result.data;
  if (socket.data.currentProjectId !== projectId) {
    return;
  }

  updateCollaboratorCursor(projectId, socket.id, x, y);

  const room = getProjectRoom(projectId);
  socket.to(room).emit('cursor:update', {
    projectId,
    userId: socket.data.user.id,
    x,
    y,
  });
}

/**
 * Handles ephemeral canvas node selection updates with broadcasting
 */
export function handlePresenceUpdate(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: PresenceUpdateInput
): void {
  const result = presenceUpdateSchema.safeParse(rawPayload);
  if (!result.success) {
    return;
  }

  const { projectId, selectedNodeId } = result.data;
  if (socket.data.currentProjectId !== projectId) {
    return;
  }

  updateCollaboratorSelection(projectId, socket.id, selectedNodeId);

  const room = getProjectRoom(projectId);
  socket.to(room).emit('presence:update', {
    projectId,
    userId: socket.data.user.id,
    selectedNodeId,
  });
}
