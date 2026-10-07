import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const projectIdParamSchema = {
  params: z.object({
    projectId: z.string().trim().regex(objectIdRegex, 'Invalid project ID format'),
  }),
};

export const invitationIdParamSchema = {
  params: z.object({
    invitationId: z
      .string()
      .trim()
      .regex(objectIdRegex, 'Invalid invitation ID format'),
  }),
};

export const memberUserIdParamSchema = {
  params: z.object({
    projectId: z.string().trim().regex(objectIdRegex, 'Invalid project ID format'),
    userId: z.string().trim().regex(objectIdRegex, 'Invalid user ID format'),
  }),
};

export const createInvitationSchema = {
  params: projectIdParamSchema.params,
  body: z
    .object({
      email: z.string().trim().email('Invalid email address format'),
      role: z.enum(['EDITOR', 'VIEWER'], {
        errorMap: () => ({ message: 'Invitation role must be EDITOR or VIEWER' }),
      }),
    })
    .strict(),
};

export const updateMemberRoleSchema = {
  params: memberUserIdParamSchema.params,
  body: z
    .object({
      role: z.enum(['EDITOR', 'VIEWER'], {
        errorMap: () => ({ message: 'Role must be EDITOR or VIEWER' }),
      }),
    })
    .strict(),
};
