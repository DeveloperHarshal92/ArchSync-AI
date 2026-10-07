import { CollaboratorPresence } from '@archsync/shared';

// In-memory presence tracking: projectId -> (socketId -> CollaboratorPresence)
const roomPresences = new Map<string, Map<string, CollaboratorPresence>>();

// In-memory project version tracking: projectId -> latestKnownVersion
const projectVersions = new Map<string, number>();

/**
 * Generates the standardized room name for an architecture project
 */
export function getProjectRoom(projectId: string): string {
  return `project:${projectId}`;
}

/**
 * Registers a collaborator's active presence in a project room
 */
export function addCollaborator(
  projectId: string,
  socketId: string,
  presence: CollaboratorPresence
): void {
  let projectMap = roomPresences.get(projectId);
  if (!projectMap) {
    projectMap = new Map<string, CollaboratorPresence>();
    roomPresences.set(projectId, projectMap);
  }
  projectMap.set(socketId, presence);
}

/**
 * Removes a collaborator from a project room by socket ID
 */
export function removeCollaborator(
  projectId: string,
  socketId: string
): CollaboratorPresence | undefined {
  const projectMap = roomPresences.get(projectId);
  if (!projectMap) return undefined;

  const removed = projectMap.get(socketId);
  projectMap.delete(socketId);

  if (projectMap.size === 0) {
    roomPresences.delete(projectId);
  }

  return removed;
}

/**
 * Updates cursor position for an active collaborator
 */
export function updateCollaboratorCursor(
  projectId: string,
  socketId: string,
  x: number,
  y: number
): CollaboratorPresence | undefined {
  const projectMap = roomPresences.get(projectId);
  if (!projectMap) return undefined;

  const presence = projectMap.get(socketId);
  if (!presence) return undefined;

  presence.cursor = { x, y };
  return presence;
}

/**
 * Updates node selection for an active collaborator
 */
export function updateCollaboratorSelection(
  projectId: string,
  socketId: string,
  selectedNodeId?: string | null
): CollaboratorPresence | undefined {
  const projectMap = roomPresences.get(projectId);
  if (!projectMap) return undefined;

  const presence = projectMap.get(socketId);
  if (!presence) return undefined;

  presence.selectedNodeId = selectedNodeId;
  return presence;
}

/**
 * Retrieves all active collaborator presences in a project room
 */
export function getProjectCollaborators(projectId: string): CollaboratorPresence[] {
  const projectMap = roomPresences.get(projectId);
  if (!projectMap) return [];
  return Array.from(projectMap.values());
}

/**
 * Cleans up a disconnecting socket from all project rooms
 */
export function removeSocketFromAllRooms(
  socketId: string
): { projectId: string; presence: CollaboratorPresence }[] {
  const removals: { projectId: string; presence: CollaboratorPresence }[] = [];

  for (const [projectId, projectMap] of roomPresences.entries()) {
    if (projectMap.has(socketId)) {
      const presence = projectMap.get(socketId)!;
      projectMap.delete(socketId);
      removals.push({ projectId, presence });

      if (projectMap.size === 0) {
        roomPresences.delete(projectId);
      }
    }
  }

  return removals;
}

/**
 * Gets the latest known architecture version for a project
 */
export function getProjectVersion(projectId: string): number {
  return projectVersions.get(projectId) || 1;
}

/**
 * Updates the latest known architecture version for a project
 */
export function setProjectVersion(projectId: string, version: number): void {
  const current = projectVersions.get(projectId) || 1;
  if (version > current) {
    projectVersions.set(projectId, version);
  }
}

/**
 * Clears all room state (useful for test resets)
 */
export function resetRoomsState(): void {
  roomPresences.clear();
  projectVersions.clear();
}
