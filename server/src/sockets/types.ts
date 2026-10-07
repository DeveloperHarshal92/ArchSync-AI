import { Socket, Server } from 'socket.io';
import {
  UserSafe,
  ProjectMemberRole,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@archsync/shared';

export interface SocketData {
  user: UserSafe;
  currentProjectId?: string;
  projectRole?: ProjectMemberRole;
}

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
