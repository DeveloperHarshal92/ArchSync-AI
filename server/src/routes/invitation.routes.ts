import { Router } from 'express';
import { invitationController } from '../controllers/invitation.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { invitationIdParamSchema } from '../validators/membership.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const invitationRouter = Router();

// Require authentication for all user invitation routes
invitationRouter.use(requireAuth);

invitationRouter.get(
  '/',
  asyncHandler((req, res) => invitationController.listUserInvitations(req, res))
);

invitationRouter.post(
  '/:invitationId/accept',
  validate(invitationIdParamSchema),
  asyncHandler((req, res) => invitationController.accept(req, res))
);

invitationRouter.post(
  '/:invitationId/reject',
  validate(invitationIdParamSchema),
  asyncHandler((req, res) => invitationController.reject(req, res))
);
