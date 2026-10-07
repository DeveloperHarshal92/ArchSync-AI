import { Request, Response, NextFunction } from 'express';
import { architectureService } from '../services/architecture.service';
import { sendSuccess } from '../utils/apiResponse';

export class ArchitectureController {
  /**
   * GET /api/v1/projects/:projectId/architecture
   */
  public async getArchitecture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await architectureService.getArchitecture(
        req.user!.id,
        req.params.projectId as string
      );

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/architecture
   */
  public async updateArchitecture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await architectureService.replaceArchitecture(
        req.user!.id,
        req.params.projectId as string,
        req.body
      );

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const architectureController = new ArchitectureController();
