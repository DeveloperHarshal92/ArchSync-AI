import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { aiAnalyzeSchema, aiChatSchema } from '../validators/ai.validator';

export const aiRouter = Router();

// All AI assistant endpoints require an authenticated user session
aiRouter.use(requireAuth);

/**
 * POST /api/v1/ai/analyze
 * Comprehensive or targeted architecture analysis (advisory, read-only)
 */
aiRouter.post(
  '/analyze',
  validate(aiAnalyzeSchema),
  (req, res, next) => aiController.analyze(req, res, next)
);

/**
 * POST /api/v1/ai/chat
 * Architecture-grounded contextual question & answer (advisory, read-only)
 */
aiRouter.post(
  '/chat',
  validate(aiChatSchema),
  (req, res, next) => aiController.chat(req, res, next)
);
