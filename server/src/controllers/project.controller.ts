import { Request, Response } from 'express';
import { CreateProjectRequest, UpdateProjectRequest } from '@archsync/shared';
import { projectService } from '../services/project.service';
import { sendSuccess } from '../utils/apiResponse';

export class ProjectController {
  /**
   * POST /api/v1/projects
   */
  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const body: CreateProjectRequest = req.body;

    const project = await projectService.createProject(userId, body);
    sendSuccess(res, { project }, 201);
  }

  /**
   * GET /api/v1/projects
   */
  public async list(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const projects = await projectService.getProjectsByUser(userId);
    sendSuccess(res, { projects }, 200);
  }

  /**
   * GET /api/v1/projects/:projectId
   */
  public async getById(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId);

    const project = await projectService.getProjectById(userId, projectId);
    sendSuccess(res, { project }, 200);
  }

  /**
   * PATCH /api/v1/projects/:projectId
   */
  public async update(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId);
    const body: UpdateProjectRequest = req.body;

    const project = await projectService.updateProject(userId, projectId, body);
    sendSuccess(res, { project }, 200);
  }

  /**
   * DELETE /api/v1/projects/:projectId
   */
  public async delete(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const projectId = String(req.params.projectId);

    await projectService.deleteProject(userId, projectId);
    sendSuccess(res, { message: 'Project deleted successfully' }, 200);
  }
}

export const projectController = new ProjectController();
