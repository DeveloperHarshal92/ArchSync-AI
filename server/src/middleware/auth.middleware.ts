import { Request, Response, NextFunction } from 'express';
import { UserSafe } from '@archsync/shared';
import { getAuthTokenFromRequest } from '../utils/cookies';
import { verifyAuthToken } from '../utils/jwt';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

// Augment Express Request interface with typed authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserSafe;
    }
  }
}

/**
 * Authentication middleware verifying HTTP-only cookie JWT
 * Attaches verified safe user to req.user or throws UnauthorizedError
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedError(
        'Authentication required. No session cookie provided.',
        'AUTH_REQUIRED'
      );
    }

    const payload = verifyAuthToken(token);
    const user = await authService.getUserById(payload.userId);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
