import { z } from 'zod';

export const aiAnalyzeSchema = {
  body: z.object({
    projectId: z
      .string({ required_error: 'projectId is required' })
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
    question: z.string().max(1000, 'Question cannot exceed 1000 characters').optional(),
  }),
};

export const aiChatSchema = {
  body: z.object({
    projectId: z
      .string({ required_error: 'projectId is required' })
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
    question: z
      .string({ required_error: 'question is required' })
      .trim()
      .min(1, 'Question cannot be empty')
      .max(1000, 'Question cannot exceed 1000 characters'),
  }),
};
