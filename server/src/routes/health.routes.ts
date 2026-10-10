import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Returns comprehensive system health and status
 */
healthRouter.get('/', (req, res) => healthController.getHealth(req, res));

/**
 * GET /api/v1/health/live
 * Liveness probe: returns HTTP 200 if process is running
 */
healthRouter.get('/live', (req, res) => healthController.getLiveness(req, res));

/**
 * GET /api/v1/health/ready
 * Readiness probe: returns HTTP 200 if dependencies (MongoDB) are ready, HTTP 503 otherwise
 */
healthRouter.get('/ready', (req, res) => healthController.getReadiness(req, res));

