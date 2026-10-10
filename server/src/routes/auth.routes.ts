import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { authRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter.middleware(),
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res))
);

authRouter.post(
  '/login',
  authRateLimiter.middleware(),
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);


authRouter.post('/logout', (req, res) => authController.logout(req, res));

authRouter.get(
  '/me',
  requireAuth,
  (req, res) => authController.getMe(req, res)
);
