import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { env } from '../config/env';
import { verifyAuthToken } from '../utils/jwt';
import { authService } from '../services/auth.service';
import { SocketData } from './types';

/**
 * Parses raw cookie header string into key-value pairs
 */
export function parseCookieHeader(header?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  const pairs = header.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

/**
 * Socket.IO authentication middleware verifying HTTP-only JWT cookie
 * strictly binds verified user identity to socket.data.user
 */
export async function socketAuthMiddleware(
  socket: Socket<any, any, any, SocketData>,
  next: (err?: ExtendedError) => void
): Promise<void> {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const cookies = parseCookieHeader(cookieHeader);
    const cookieToken = cookies[env.COOKIE_NAME];
    const authToken = socket.handshake.auth?.token;

    const token = cookieToken || authToken;

    if (!token) {
      const err = new Error('Authentication required. No session cookie provided.') as ExtendedError;
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    const payload = verifyAuthToken(token);
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      const err = new Error('Authenticated user does not exist.') as ExtendedError;
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    socket.data.user = user;
    next();
  } catch (error: any) {
    const err = new Error(error.message || 'Authentication failed') as ExtendedError;
    err.data = { code: 'UNAUTHORIZED' };
    next(err);
  }
}
