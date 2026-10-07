import { Types } from 'mongoose';
import { ProjectMemberRole, ProjectMember } from '@archsync/shared';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { NotFoundError, ForbiddenError } from '../utils/errors';

/**
 * Reusable authorization service matching RULES.md Section 11 & F05 Section 15
 * Authoritative source for project permissions
 */
export class PermissionService {
  /**
   * Retrieves membership if it exists, without throwing
   */
  public async getProjectMembership(
    userId: string,
    projectId: string
  ): Promise<ProjectMember | null> {
    const member = await ProjectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });

    return member ? member.toSafeObject() : null;
  }

  /**
   * Requires that the user is a member of the project (OWNER, EDITOR, or VIEWER)
   */
  public async requireProjectAccess(
    userId: string,
    projectId: string
  ): Promise<ProjectMember> {
    // 1. Verify project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // 2. Verify membership
    const member = await this.getProjectMembership(userId, projectId);
    if (!member) {
      throw new ForbiddenError(
        'You do not have permission to access this project',
        'FORBIDDEN'
      );
    }

    return member;
  }

  /**
   * Requires that the user is a member with one of the allowed roles
   */
  public async requireProjectRole(
    userId: string,
    projectId: string,
    allowedRoles: ProjectMemberRole[]
  ): Promise<ProjectMember> {
    const member = await this.requireProjectAccess(userId, projectId);

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
        'FORBIDDEN'
      );
    }

    return member;
  }
}

export const permissionService = new PermissionService();
