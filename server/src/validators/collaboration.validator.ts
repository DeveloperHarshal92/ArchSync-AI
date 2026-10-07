import { z } from 'zod';
import { architectureNodeSchema, architectureEdgeSchema } from './architecture.validator';

export const projectJoinSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
});

export const projectLeaveSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
});

export const nodeCreateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  node: architectureNodeSchema,
  version: z.number().int().positive().optional(),
});

export const nodeUpdateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  node: architectureNodeSchema,
  version: z.number().int().positive().optional(),
});

export const nodeDeleteSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  nodeId: z.string({ required_error: 'nodeId is required' }).trim().min(1, 'nodeId cannot be empty'),
  version: z.number().int().positive().optional(),
});

export const edgeCreateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  edge: architectureEdgeSchema,
  version: z.number().int().positive().optional(),
});

export const edgeUpdateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  edge: architectureEdgeSchema,
  version: z.number().int().positive().optional(),
});

export const edgeDeleteSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  edgeId: z.string({ required_error: 'edgeId is required' }).trim().min(1, 'edgeId cannot be empty'),
  version: z.number().int().positive().optional(),
});

export const cursorUpdateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  x: z.number({ required_error: 'x is required' }).finite('x coordinate must be finite'),
  y: z.number({ required_error: 'y is required' }).finite('y coordinate must be finite'),
});

export const presenceUpdateSchema = z.object({
  projectId: z.string({ required_error: 'projectId is required' }).trim().min(1, 'projectId cannot be empty'),
  selectedNodeId: z.string().nullable().optional(),
});
