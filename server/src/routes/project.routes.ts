import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { invitationController } from '../controllers/invitation.controller';
import { membershipRouter } from './membership.routes';
import { architectureRouter } from './architecture.routes';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from '../validators/project.validator';
import { createInvitationSchema } from '../validators/membership.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const projectRouter = Router();

// All project routes require an authenticated user session
projectRouter.use(requireAuth);

projectRouter.post(
  '/',
  validate(createProjectSchema),
  asyncHandler((req, res) => projectController.create(req, res))
);

projectRouter.get(
  '/',
  asyncHandler((req, res) => projectController.list(req, res))
);

projectRouter.get(
  '/:projectId',
  validate(projectIdParamSchema),
  asyncHandler((req, res) => projectController.getById(req, res))
);

projectRouter.patch(
  '/:projectId',
  validate(updateProjectSchema),
  asyncHandler((req, res) => projectController.update(req, res))
);

projectRouter.delete(
  '/:projectId',
  validate(projectIdParamSchema),
  asyncHandler((req, res) => projectController.delete(req, res))
);

// Create invitation for project (Owner only)
projectRouter.post(
  '/:projectId/invitations',
  validate(createInvitationSchema),
  asyncHandler((req, res) => invitationController.create(req, res))
);

// Mount members sub-router
projectRouter.use('/:projectId/members', membershipRouter);

// Mount architecture sub-router
projectRouter.use('/:projectId/architecture', architectureRouter);
