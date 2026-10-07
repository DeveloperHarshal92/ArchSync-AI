import { Request, Response } from 'express';
import { RegisterRequest, LoginRequest } from '@archsync/shared';
import { authService } from '../services/auth.service';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  public async register(req: Request, res: Response): Promise<void> {
    const input: RegisterRequest = req.body;
    const { user, token } = await authService.register(input);

    // Set HTTP-only session cookie
    setAuthCookie(res, token);

    // Return safe user representation matching contract
    sendSuccess(res, { user }, 201);
  }

  /**
   * POST /api/v1/auth/login
   */
  public async login(req: Request, res: Response): Promise<void> {
    const input: LoginRequest = req.body;
    const { user, token } = await authService.login(input);

    // Set HTTP-only session cookie
    setAuthCookie(res, token);

    // Return safe user data
    sendSuccess(res, { user }, 200);
  }

  /**
   * POST /api/v1/auth/logout
   */
  public logout(_req: Request, res: Response): void {
    // Clear HTTP-only session cookie
    clearAuthCookie(res);

    sendSuccess(res, { message: 'Logged out successfully' }, 200);
  }

  /**
   * GET /api/v1/auth/me
   */
  public getMe(req: Request, res: Response): void {
    // req.user is guaranteed by requireAuth middleware
    sendSuccess(res, { user: req.user }, 200);
  }
}

export const authController = new AuthController();
