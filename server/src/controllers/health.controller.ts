import { Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Controller handling health, liveness, and readiness endpoints
 */
export class HealthController {
  public getHealth(_req: Request, res: Response): void {
    const healthData = healthService.getHealthStatus();
    sendSuccess(res, healthData, 200);
  }

  public getLiveness(_req: Request, res: Response): void {
    const livenessData = healthService.getLivenessStatus();
    sendSuccess(res, livenessData, 200);
  }

  public getReadiness(_req: Request, res: Response): void {
    const readinessData = healthService.getReadinessStatus();
    if (readinessData.ready) {
      sendSuccess(res, readinessData, 200);
    } else {
      sendError(
        res,
        `Service not ready. Database connection is ${readinessData.database}.`,
        'SERVICE_NOT_READY',
        503,
        readinessData
      );
    }
  }
}

export const healthController = new HealthController();

