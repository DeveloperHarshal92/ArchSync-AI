import { RegisterRequest, LoginRequest, UserSafe } from '@archsync/shared';
import { User } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { signAuthToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../utils/errors';

export interface AuthResult {
  user: UserSafe;
  token: string;
}

/**
 * Service orchestrating authentication logic matching RULES.md Section 6 & 7
 */
export class AuthService {
  /**
   * Registers a new user account with hashed password and unique email constraint
   */
  public async register(input: RegisterRequest): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check for duplicate account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError(
        'An account with this email already exists',
        'EMAIL_ALREADY_EXISTS'
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(input.password);

    // Create user in database
    try {
      const newUser = await User.create({
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
      });

      const safeUser = newUser.toSafeObject();

      // Generate JWT token containing minimal identity
      const token = signAuthToken({
        userId: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });

      return { user: safeUser, token };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictError(
          'An account with this email already exists',
          'EMAIL_ALREADY_EXISTS'
        );
      }
      throw error;
    }
  }

  /**
   * Validates credentials and generates authentication token
   */
  public async login(input: LoginRequest): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      // Do not reveal whether email or password specifically was incorrect
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Verify password hash with bcrypt
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const safeUser = user.toSafeObject();

    // Generate JWT token
    const token = signAuthToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return { user: safeUser, token };
  }

  /**
   * Retrieves authenticated user by ID
   */
  public async getUserById(userId: string): Promise<UserSafe> {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User account not found', 'USER_NOT_FOUND');
    }

    return user.toSafeObject();
  }
}

export const authService = new AuthService();
