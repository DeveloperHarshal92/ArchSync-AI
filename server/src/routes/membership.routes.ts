import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  projectIdParamSchema,
  memberUserIdParamSchema,
  updateMemberRoleSchema,
} from '../validators/membership.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const membershipRouter = Router({ mergeParams: true });

// Require authentication for all member routes
membershipRouter.use(requireAuth);

membershipRouter.get(
  '/',
  validate(projectIdParamSchema),
  asyncHandler((req, res) => membershipController.listMembers(req, res))
);

membershipRouter.patch(
  '/:userId',
  validate(updateMemberRoleSchema),
  asyncHandler((req, res) => membershipController.updateRole(req, res))
);

membershipRouter.delete(
  '/:userId',
  validate(memberUserIdParamSchema),
  asyncHandler((req, res) => membershipController.removeMember(req, res))
);
