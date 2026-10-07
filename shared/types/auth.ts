/**
 * Authentication domain contracts matching RULES.md Section 6 & F03 specifications
 */

export type UserRole = 'USER' | 'ADMIN';

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: UserSafe;
}
