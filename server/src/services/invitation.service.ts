import { Types } from 'mongoose';
import {
  ProjectInvitation,
  ProjectInvitationWithDetails,
  CreateInvitationRequest,
  AcceptInvitationResponseData,
} from '@archsync/shared';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ProjectInvitationModel } from '../models/projectInvitation.model';
import { User } from '../models/user.model';
import { permissionService } from './permission.service';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';

export class InvitationService {
  /**
   * Creates an invitation for a project (only OWNER may invite users)
   */
  public async createInvitation(
    requesterId: string,
    projectId: string,
    data: CreateInvitationRequest
  ): Promise<ProjectInvitation> {
    // 1. Require OWNER role for requester
    await permissionService.requireProjectRole(requesterId, projectId, ['OWNER']);

    const normalizedEmail = data.email.trim().toLowerCase();

    // 2. Validate role is not OWNER
    if (data.role !== 'EDITOR' && data.role !== 'VIEWER') {
      throw new BadRequestError('Role must be EDITOR or VIEWER', 'INVALID_INVITATION_ROLE');
    }

    // 3. Check if recipient is already a project member
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const existingMembership = await ProjectMemberModel.findOne({
        projectId: new Types.ObjectId(projectId),
        userId: existingUser._id,
      });

      if (existingMembership) {
        throw new ConflictError(
          'User is already a member of this project',
          'ALREADY_MEMBER'
        );
      }
    }

    // 4. Check for active pending invitation for this email
    const now = new Date();
    const activeInvitation = await ProjectInvitationModel.findOne({
      projectId: new Types.ObjectId(projectId),
      invitedEmail: normalizedEmail,
      status: 'PENDING',
      expiresAt: { $gt: now },
    });

    if (activeInvitation) {
      throw new ConflictError(
        'An active invitation for this email already exists',
        'INVITATION_ALREADY_EXISTS'
      );
    }

    // 5. Expiration time: 7 days default
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 6. Create the invitation document
    const invitation = await ProjectInvitationModel.create({
      projectId: new Types.ObjectId(projectId),
      invitedBy: new Types.ObjectId(requesterId),
      invitedUserId: existingUser ? existingUser._id : undefined,
      invitedEmail: normalizedEmail,
      role: data.role,
      status: 'PENDING',
      expiresAt,
    });

    return invitation.toSafeObject();
  }

  /**
   * Retrieves all invitations addressed to the authenticated user's email
   */
  public async getUserInvitations(
    userId: string,
    userEmail: string
  ): Promise<ProjectInvitationWithDetails[]> {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const now = new Date();

    const invitations = await ProjectInvitationModel.find({
      $or: [
        { invitedEmail: normalizedEmail },
        { invitedUserId: new Types.ObjectId(userId) },
      ],
    }).sort({ createdAt: -1 });

    // Collect project and inviter IDs for name enrichment
    const projectIds = invitations.map((inv) => inv.projectId);
    const inviterIds = invitations.map((inv) => inv.invitedBy);

    const [projects, inviters] = await Promise.all([
      ProjectModel.find({ _id: { $in: projectIds } }),
      User.find({ _id: { $in: inviterIds } }),
    ]);

    const projectMap = new Map<string, string>();
    for (const p of projects) {
      projectMap.set(p._id.toString(), p.name);
    }

    const inviterMap = new Map<string, string>();
    for (const u of inviters) {
      inviterMap.set(u._id.toString(), u.name);
    }

    const results: ProjectInvitationWithDetails[] = [];

    for (const inv of invitations) {
      // Check for automatic expiration transition
      if (inv.status === 'PENDING' && inv.expiresAt < now) {
        inv.status = 'EXPIRED';
        await inv.save();
      }

      results.push({
        ...inv.toSafeObject(),
        projectName: projectMap.get(inv.projectId.toString()) || 'Unknown Project',
        inviterName: inviterMap.get(inv.invitedBy.toString()) || 'Architect',
      });
    }

    return results;
  }

  /**
   * Accepts a pending project invitation and creates membership
   */
  public async acceptInvitation(
    userId: string,
    userEmail: string,
    invitationId: string
  ): Promise<AcceptInvitationResponseData> {
    const invitation = await ProjectInvitationModel.findById(invitationId);
    if (!invitation) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    // 1. Enforce that authenticated email matches invitation email
    if (invitation.invitedEmail.toLowerCase() !== normalizedEmail) {
      throw new ForbiddenError(
        'This invitation was sent to a different email address',
        'FORBIDDEN'
      );
    }

    // 2. Check expiration
    const now = new Date();
    if (invitation.expiresAt < now || invitation.status === 'EXPIRED') {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new BadRequestError('Invitation has expired', 'INVITATION_EXPIRED');
    }

    // 3. Enforce valid PENDING state
    if (invitation.status !== 'PENDING') {
      throw new BadRequestError(
        `Invitation is no longer pending (${invitation.status})`,
        'INVITATION_NOT_PENDING'
      );
    }

    const userObjectId = new Types.ObjectId(userId);

    // 4. Verify user is not already a member
    const existingMembership = await ProjectMemberModel.findOne({
      projectId: invitation.projectId,
      userId: userObjectId,
    });

    if (existingMembership) {
      invitation.status = 'ACCEPTED';
      await invitation.save();
      throw new ConflictError(
        'You are already a member of this project',
        'ALREADY_MEMBER'
      );
    }

    // 5. Create membership
    const member = await ProjectMemberModel.create({
      projectId: invitation.projectId,
      userId: userObjectId,
      role: invitation.role,
      joinedAt: new Date(),
    });

    // 6. Transition invitation state to ACCEPTED
    invitation.status = 'ACCEPTED';
    invitation.invitedUserId = userObjectId;
    await invitation.save();

    const project = await ProjectModel.findById(invitation.projectId);
    if (!project) {
      throw new NotFoundError('Project no longer exists', 'PROJECT_NOT_FOUND');
    }

    return {
      member: member.toSafeObject(),
      project: project.toSafeObject(),
    };
  }

  /**
   * Rejects a pending project invitation
   */
  public async rejectInvitation(
    _userId: string,
    userEmail: string,
    invitationId: string
  ): Promise<ProjectInvitation> {
    const invitation = await ProjectInvitationModel.findById(invitationId);
    if (!invitation) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    const normalizedEmail = userEmail.trim().toLowerCase();

    // 1. Enforce recipient email match
    if (invitation.invitedEmail.toLowerCase() !== normalizedEmail) {
      throw new ForbiddenError(
        'This invitation was sent to a different email address',
        'FORBIDDEN'
      );
    }

    // 2. Check expiration
    const now = new Date();
    if (invitation.expiresAt < now || invitation.status === 'EXPIRED') {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new BadRequestError('Invitation has expired', 'INVITATION_EXPIRED');
    }

    // 3. Enforce valid PENDING state
    if (invitation.status !== 'PENDING') {
      throw new BadRequestError(
        `Invitation is no longer pending (${invitation.status})`,
        'INVITATION_NOT_PENDING'
      );
    }

    // 4. Transition to REJECTED
    invitation.status = 'REJECTED';
    await invitation.save();

    return invitation.toSafeObject();
  }
}

export const invitationService = new InvitationService();
