import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Returns system health and status
 */
healthRouter.get('/', (req, res) => healthController.getHealth(req, res));
