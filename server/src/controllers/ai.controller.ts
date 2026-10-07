import { Request, Response, NextFunction } from 'express';
import { aiService } from '../ai/ai.service';
import { sendSuccess } from '../utils/apiResponse';

export class AIController {
  /**
   * POST /api/v1/ai/analyze
   * Advisory-only architecture analysis. Zero-mutation.
   */
  public async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, question } = req.body;

      const result = await aiService.analyzeArchitecture(userId, projectId, question);

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/chat
   * Advisory-only conversational Q&A grounded in current architecture diagram. Zero-mutation.
   */
  public async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { projectId, question } = req.body;

      const result = await aiService.chatArchitecture(userId, projectId, question);

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
