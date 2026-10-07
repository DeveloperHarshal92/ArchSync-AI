import { Project } from './project';

/**
 * Project membership & invitation contracts matching RULES.md & Epic F05
 */

export type ProjectMemberRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
}

export interface ProjectMemberUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface ProjectMemberWithUser {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user: ProjectMemberUserSummary;
}

export interface UpdateMemberRoleRequest {
  role: 'EDITOR' | 'VIEWER';
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface ProjectInvitation {
  id: string;
  projectId: string;
  invitedBy: string;
  invitedUserId?: string;
  invitedEmail: string;
  role: 'EDITOR' | 'VIEWER';
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvitationWithDetails extends ProjectInvitation {
  projectName?: string;
  inviterName?: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: 'EDITOR' | 'VIEWER';
}

export interface ProjectMemberListResponseData {
  members: ProjectMemberWithUser[];
}

export interface ProjectInvitationResponseData {
  invitation: ProjectInvitation;
}

export interface UserInvitationsResponseData {
  invitations: ProjectInvitationWithDetails[];
}

export interface AcceptInvitationResponseData {
  member: ProjectMember;
  project: Project;
}
