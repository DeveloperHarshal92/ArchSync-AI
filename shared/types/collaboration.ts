/**
 * Collaboration and Socket.IO domain types contract matching RULES.md Section 4 & Epic F10
 */

import { ArchitectureNode, ArchitectureEdge, ArchitectureViewport } from './architecture';
import { ProjectMemberRole } from './membership';

export type SocketConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface CollaboratorCursor {
  x: number;
  y: number;
}

export interface CollaboratorPresence {
  userId: string;
  name: string;
  avatarUrl?: string;
  cursor?: CollaboratorCursor;
  selectedNodeId?: string | null;
  connectedAt: string;
}

export interface CollaborationEventMeta {
  projectId: string;
  version: number;
  actorId: string;
  timestamp: string;
}

// 1. Project Room Events
export interface ProjectJoinPayload {
  projectId: string;
}

export interface ProjectLeavePayload {
  projectId: string;
}

export interface ProjectStateEvent {
  projectId: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  viewport: ArchitectureViewport;
  version: number;
}

// 2. Node Collaboration Events
export interface NodeCreateEvent {
  projectId: string;
  node: ArchitectureNode;
  version?: number;
}

export interface NodeUpdateEvent {
  projectId: string;
  node: ArchitectureNode;
  version?: number;
}

export interface NodeDeleteEvent {
  projectId: string;
  nodeId: string;
  version?: number;
}

// 3. Edge Collaboration Events
export interface EdgeCreateEvent {
  projectId: string;
  edge: ArchitectureEdge;
  version?: number;
}

export interface EdgeUpdateEvent {
  projectId: string;
  edge: ArchitectureEdge;
  version?: number;
}

export interface EdgeDeleteEvent {
  projectId: string;
  edgeId: string;
  version?: number;
}

// 4. Presence & Cursor Events
export interface CursorUpdateEvent {
  projectId: string;
  userId: string;
  x: number;
  y: number;
}

export interface CursorUpdateInput {
  projectId: string;
  x: number;
  y: number;
}

export interface PresenceUpdateEvent {
  projectId: string;
  userId: string;
  selectedNodeId?: string | null;
}

export interface PresenceUpdateInput {
  projectId: string;
  selectedNodeId?: string | null;
}

export interface PresenceLeaveEvent {
  projectId: string;
  userId: string;
}

// 5. Error Contract
export interface SocketErrorPayload {
  code: string;
  message: string;
}

export interface PresenceStateEvent {
  projectId: string;
  presences: CollaboratorPresence[];
}

export interface ClientToServerEvents {
  'project:join': (payload: ProjectJoinPayload) => void;
  'project:leave': (payload: ProjectLeavePayload) => void;
  'node:create': (payload: NodeCreateEvent) => void;
  'node:update': (payload: NodeUpdateEvent) => void;
  'node:delete': (payload: NodeDeleteEvent) => void;
  'edge:create': (payload: EdgeCreateEvent) => void;
  'edge:update': (payload: EdgeUpdateEvent) => void;
  'edge:delete': (payload: EdgeDeleteEvent) => void;
  'cursor:update': (payload: CursorUpdateInput) => void;
  'presence:update': (payload: PresenceUpdateInput) => void;
}

export interface ServerToClientEvents {
  'project:state': (payload: ProjectStateEvent) => void;
  'node:create': (payload: NodeCreateEvent) => void;
  'node:update': (payload: NodeUpdateEvent) => void;
  'node:delete': (payload: NodeDeleteEvent) => void;
  'edge:create': (payload: EdgeCreateEvent) => void;
  'edge:update': (payload: EdgeUpdateEvent) => void;
  'edge:delete': (payload: EdgeDeleteEvent) => void;
  'presence:join': (payload: CollaboratorPresence) => void;
  'presence:leave': (payload: PresenceLeaveEvent) => void;
  'presence:update': (payload: PresenceUpdateEvent) => void;
  'presence:state': (payload: PresenceStateEvent) => void;
  'cursor:update': (payload: CursorUpdateEvent) => void;
  'error': (payload: SocketErrorPayload) => void;
  'role:update'?: (payload: { projectId: string; role: ProjectMemberRole }) => void;
  'membership:revoked'?: (payload: { projectId: string; message: string }) => void;
}
