import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
};
