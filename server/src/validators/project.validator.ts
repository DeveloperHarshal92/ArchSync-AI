import { z } from 'zod';

/**
 * Zod validation schemas for Project domain matching RULES.md Section 10 & F04
 */

export const projectIdParamSchema = {
  params: z.object({
    projectId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
  }),
};

export const createProjectSchema = {
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be at most 100 characters'),
      description: z
        .string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    })
    .strict(), // Strictly forbids ownerId, id, or other unexpected fields
};

export const updateProjectSchema = {
  params: projectIdParamSchema.params,
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Project name cannot be empty')
        .max(100, 'Project name must be at most 100 characters')
        .optional(),
      description: z
        .string()
        .trim()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    })
    .strict()
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: 'At least one field (name or description) must be provided for update',
      }
    ),
};
