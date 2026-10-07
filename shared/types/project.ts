/**
 * Project domain types contract matching RULES.md Section 4 & Epics F04 & F05
 */

import { ProjectMemberRole } from './membership';

export type ProjectRole = ProjectMemberRole;

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAccess {
  role: ProjectMemberRole;
}

export interface ProjectWithAccess extends Project {
  access: ProjectAccess;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface ProjectResponseData {
  project: ProjectWithAccess;
}

export interface ProjectListResponseData {
  projects: ProjectWithAccess[];
}
