import { Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess } from '../utils/apiResponse';

/**
 * Controller handling health endpoints
 */
export class HealthController {
  public getHealth(_req: Request, res: Response): void {
    const healthData = healthService.getHealthStatus();
    sendSuccess(res, healthData, 200);
  }
}

export const healthController = new HealthController();
