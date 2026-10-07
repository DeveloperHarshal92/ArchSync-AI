import { Types } from 'mongoose';
import {
  ProjectWithAccess,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@archsync/shared';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/projectMember.model';
import { ProjectInvitationModel } from '../models/projectInvitation.model';
import { ArchitectureModel } from '../models/architecture.model';
import { permissionService } from './permission.service';
import { NotFoundError } from '../utils/errors';

/**
 * Service orchestrating Project lifecycle and access control
 * Enforces server-side authorization boundaries matching RULES.md Section 11 & F05
 */
export class ProjectService {
  /**
   * Creates a new project owned by the authenticated user and establishes OWNER membership
   */
  public async createProject(
    userId: string,
    data: CreateProjectRequest
  ): Promise<ProjectWithAccess> {
    const ownerObjectId = new Types.ObjectId(userId);

    // Create the Project document
    const project = await ProjectModel.create({
      name: data.name.trim(),
      description: data.description ? data.description.trim() : undefined,
      ownerId: ownerObjectId,
    });

    try {
      // Ensure the OWNER membership is established for the project creator
      await ProjectMemberModel.create({
        projectId: project._id,
        userId: ownerObjectId,
        role: 'OWNER',
        joinedAt: new Date(),
      });
    } catch (err) {
      // Cleanup orphan project if member creation failed
      await ProjectModel.findByIdAndDelete(project._id);
      throw err;
    }

    const safeProject = project.toSafeObject();
    return {
      ...safeProject,
      access: { role: 'OWNER' },
    };
  }

  /**
   * Retrieves all projects where the user is an active member (OWNER, EDITOR, or VIEWER)
   */
  public async getProjectsByUser(userId: string): Promise<ProjectWithAccess[]> {
    const userObjectId = new Types.ObjectId(userId);

    // Find all project memberships for this user
    const memberships = await ProjectMemberModel.find({
      userId: userObjectId,
    });

    if (memberships.length === 0) {
      return [];
    }

    const membershipMap = new Map<string, (typeof memberships)[0]['role']>();
    const projectIds: Types.ObjectId[] = [];

    for (const m of memberships) {
      const pidStr = m.projectId.toString();
      membershipMap.set(pidStr, m.role);
      projectIds.push(m.projectId);
    }

    // Retrieve active projects sorted by creation date descending
    const projects = await ProjectModel.find({
      _id: { $in: projectIds },
    }).sort({ createdAt: -1 });

    return projects.map((p) => {
      const safeProject = p.toSafeObject();
      const role = membershipMap.get(safeProject.id) ?? 'VIEWER';
      return {
        ...safeProject,
        access: { role },
      };
    });
  }

  /**
   * Retrieves a single project, enforcing membership access (OWNER, EDITOR, or VIEWER)
   */
  public async getProjectById(
    userId: string,
    projectId: string
  ): Promise<ProjectWithAccess> {
    const member = await permissionService.requireProjectAccess(userId, projectId);

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    return {
      ...project.toSafeObject(),
      access: { role: member.role },
    };
  }

  /**
   * Updates an existing project, enforcing OWNER or EDITOR permissions
   */
  public async updateProject(
    userId: string,
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<ProjectWithAccess> {
    const member = await permissionService.requireProjectRole(userId, projectId, [
      'OWNER',
      'EDITOR',
    ]);

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found', 'PROJECT_NOT_FOUND');
    }

    if (data.name !== undefined) {
      project.name = data.name.trim();
    }

    if (data.description !== undefined) {
      project.description = data.description.trim();
    }

    await project.save();

    return {
      ...project.toSafeObject(),
      access: { role: member.role },
    };
  }

  /**
   * Deletes a project, enforcing OWNER permissions and cleaning up memberships/invitations
   */
  public async deleteProject(userId: string, projectId: string): Promise<void> {
    await permissionService.requireProjectRole(userId, projectId, ['OWNER']);

    await ProjectModel.findByIdAndDelete(projectId);
    await ProjectMemberModel.deleteMany({ projectId: new Types.ObjectId(projectId) });
    await ProjectInvitationModel.deleteMany({ projectId: new Types.ObjectId(projectId) });
    await ArchitectureModel.deleteMany({ projectId: new Types.ObjectId(projectId) });
  }
}

export const projectService = new ProjectService();
