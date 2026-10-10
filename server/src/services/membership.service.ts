import { Types } from 'mongoose';
import { ProjectMemberWithUser, ProjectMember } from '@archsync/shared';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { User } from '../models/user.model';
import { permissionService } from './permission.service';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { syncSocketMembership } from '../sockets/socketServer';

export class MembershipService {
  /**
   * Retrieves all members of a project with safe user profile information
   */
  public async getProjectMembers(
    userId: string,
    projectId: string
  ): Promise<ProjectMemberWithUser[]> {
    // Requires that requester has project access (OWNER, EDITOR, or VIEWER)
    await permissionService.requireProjectAccess(userId, projectId);

    const projectObjectId = new Types.ObjectId(projectId);
    const members = await ProjectMemberModel.find({
      projectId: projectObjectId,
    }).sort({ joinedAt: 1 });

    const userIds = members.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = new Map<string, (typeof users)[0]>();
    for (const u of users) {
      userMap.set(u._id.toString(), u);
    }

    return members.map((m) => {
      const u = userMap.get(m.userId.toString());
      return {
        id: String(m._id),
        projectId: String(m.projectId),
        userId: String(m.userId),
        role: m.role,
        joinedAt: m.joinedAt ? m.joinedAt.toISOString() : new Date().toISOString(),
        user: {
          id: String(m.userId),
          name: u?.name || 'Unknown User',
          email: u?.email || '',
        },
      };
    });
  }

  /**
   * Changes a member's role (only OWNER can change roles to EDITOR or VIEWER)
   */
  public async updateMemberRole(
    requesterId: string,
    projectId: string,
    targetUserId: string,
    newRole: 'EDITOR' | 'VIEWER'
  ): Promise<ProjectMember> {
    // 1. Require OWNER role for requester
    await permissionService.requireProjectRole(requesterId, projectId, ['OWNER']);

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // 2. Prevent modifying the project owner's role
    if (project.ownerId.toString() === targetUserId) {
      throw new BadRequestError(
        'Cannot modify the project owner role',
        'CANNOT_MODIFY_OWNER_ROLE'
      );
    }

    // 3. Find target member
    const member = await ProjectMemberModel.findOne({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(targetUserId),
    });

    if (!member) {
      throw new NotFoundError('Member not found', 'MEMBER_NOT_FOUND');
    }

    member.role = newRole;
    await member.save();

    // Dynamically notify connected sockets of the role change
    syncSocketMembership(projectId, targetUserId, newRole);

    return member.toSafeObject();
  }

  /**
   * Removes a member from the project (only OWNER can remove; cannot remove owner)
   */
  public async removeMember(
    requesterId: string,
    projectId: string,
    targetUserId: string
  ): Promise<void> {
    // 1. Require OWNER role for requester
    await permissionService.requireProjectRole(requesterId, projectId, ['OWNER']);

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // 2. Prevent removing the project owner
    if (project.ownerId.toString() === targetUserId) {
      throw new BadRequestError(
        'Cannot remove the project owner',
        'CANNOT_REMOVE_OWNER'
      );
    }

    // 3. Delete target membership
    const deleted = await ProjectMemberModel.findOneAndDelete({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(targetUserId),
    });

    if (!deleted) {
      throw new NotFoundError('Member not found', 'MEMBER_NOT_FOUND');
    }

    // Dynamically evict connected sockets from the project room
    syncSocketMembership(projectId, targetUserId, null);
  }
}

export const membershipService = new MembershipService();
