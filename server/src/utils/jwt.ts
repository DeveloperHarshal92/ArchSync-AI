import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@archsync/shared';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Signs an authentication JWT containing minimal user identity
 */
export function signAuthToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number, // jsonwebtoken accepts string like '7d'
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verifies and decodes an authentication JWT
 * Rejects expired, malformed, or tampered tokens with UnauthorizedError
 */
export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      throw new UnauthorizedError('Invalid authentication token payload');
    }
    return decoded as unknown as AuthTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Authentication token has expired', 'TOKEN_EXPIRED');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid authentication token', 'INVALID_TOKEN');
    }
    if (err instanceof UnauthorizedError) {
      throw err;
    }
    throw new UnauthorizedError('Token verification failed', 'INVALID_TOKEN');
  }
}
