import { Router } from 'express';
import { architectureController } from '../controllers/architecture.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  getArchitectureSchema,
  putArchitectureSchema,
} from '../validators/architecture.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const architectureRouter = Router({ mergeParams: true });

// Require authentication for all architecture operations
architectureRouter.use(requireAuth);

// GET /api/v1/projects/:projectId/architecture
architectureRouter.get(
  '/',
  validate(getArchitectureSchema),
  asyncHandler((req, res, next) => architectureController.getArchitecture(req, res, next))
);

// PUT /api/v1/projects/:projectId/architecture
architectureRouter.put(
  '/',
  validate(putArchitectureSchema),
  asyncHandler((req, res, next) => architectureController.updateArchitecture(req, res, next))
);
