import { AppServer, AppSocket } from '../types';
import { ProjectJoinPayload, ProjectLeavePayload, CollaboratorPresence } from '@archsync/shared';
import { projectJoinSchema, projectLeaveSchema } from '../../validators/collaboration.validator';
import { permissionService } from '../../services/permission.service';
import { architectureService } from '../../services/architecture.service';
import {
  getProjectRoom,
  addCollaborator,
  removeCollaborator,
  getProjectCollaborators,
  setProjectVersion,
} from '../rooms';

/**
 * Handles client request to join an architecture project collaboration room
 */
export async function handleProjectJoin(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: ProjectJoinPayload
): Promise<void> {
  const parseResult = projectJoinSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: parseResult.error.issues[0]?.message || 'Invalid join payload',
    });
    return;
  }

  const { projectId } = parseResult.data;
  const user = socket.data.user;

  try {
    // 1. Authorize project membership (OWNER, EDITOR, VIEWER)
    const membership = await permissionService.requireProjectAccess(user.id, projectId);

    // 2. Clean up previous room if switching projects
    if (socket.data.currentProjectId && socket.data.currentProjectId !== projectId) {
      const prevProjectId = socket.data.currentProjectId;
      removeCollaborator(prevProjectId, socket.id);
      socket.leave(getProjectRoom(prevProjectId));
      socket.to(getProjectRoom(prevProjectId)).emit('presence:leave', {
        projectId: prevProjectId,
        userId: user.id,
      });
    }

    // 3. Join the target project room
    const room = getProjectRoom(projectId);
    socket.join(room);
    socket.data.currentProjectId = projectId;
    socket.data.projectRole = membership.role;

    // 4. Retrieve authoritative current architecture state
    const { architecture } = await architectureService.getArchitecture(user.id, projectId);
    setProjectVersion(projectId, architecture.version);

    // 5. Send initial architecture state to joining client
    socket.emit('project:state', {
      projectId,
      nodes: architecture.nodes,
      edges: architecture.edges,
      viewport: architecture.viewport,
      version: architecture.version,
    });

    // 6. Record and broadcast presence
    const presence: CollaboratorPresence = {
      userId: user.id,
      name: user.name,
      connectedAt: new Date().toISOString(),
    };

    addCollaborator(projectId, socket.id, presence);

    // Broadcast join to other clients in room (Sender Echo Prevention)
    socket.to(room).emit('presence:join', presence);

    // Send current list of active collaborators to the joining client
    socket.emit('presence:state', {
      projectId,
      presences: getProjectCollaborators(projectId),
    });
  } catch (err: any) {
    const code = err.code === 'PROJECT_NOT_FOUND' ? 'INVALID_PROJECT' : 'FORBIDDEN';
    socket.emit('error', {
      code,
      message: err.message || 'You do not have permission to join this project',
    });
  }
}

/**
 * Handles client request to leave an architecture project collaboration room
 */
export async function handleProjectLeave(
  _io: AppServer,
  socket: AppSocket,
  rawPayload: ProjectLeavePayload
): Promise<void> {
  const parseResult = projectLeaveSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    socket.emit('error', {
      code: 'INVALID_PAYLOAD',
      message: parseResult.error.issues[0]?.message || 'Invalid leave payload',
    });
    return;
  }

  const { projectId } = parseResult.data;
  const user = socket.data.user;
  const room = getProjectRoom(projectId);

  removeCollaborator(projectId, socket.id);
  socket.leave(room);

  if (socket.data.currentProjectId === projectId) {
    socket.data.currentProjectId = undefined;
    socket.data.projectRole = undefined;
  }

  socket.to(room).emit('presence:leave', {
    projectId,
    userId: user.id,
  });
}
