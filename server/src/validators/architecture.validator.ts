import { z } from 'zod';
import {
  ARCHITECTURE_NODE_TYPES,
  ARCHITECTURE_EDGE_TYPES,
  ArchitectureNodeType,
  EdgeType,
} from '@archsync/shared';

/**
 * Node position validation (rejects NaN and Infinity)
 */
export const nodePositionSchema = z.object({
  x: z.number({ required_error: 'Position x is required' }).finite('Position x must be finite'),
  y: z.number({ required_error: 'Position y is required' }).finite('Position y must be finite'),
});

/**
 * Node data validation
 */
export const nodeDataSchema = z.object({
  label: z
    .string({ required_error: 'Node label is required' })
    .trim()
    .min(1, 'Node label cannot be empty')
    .max(100, 'Node label cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  technology: z.string().trim().max(100, 'Technology cannot exceed 100 characters').optional(),
  category: z.string().trim().max(100, 'Category cannot exceed 100 characters').optional(),
  metadata: z.record(z.unknown()).optional(),
});

const colorRegex = /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\([^)]+\)|transparent)$/;

export const nodeStyleSchema = z.object({
  fillColor: z.string().trim().regex(colorRegex, 'Invalid fill color format').optional(),
  borderColor: z.string().trim().regex(colorRegex, 'Invalid border color format').optional(),
  borderWidth: z.number().finite().min(0, 'Border width must be non-negative').max(20, 'Border width cannot exceed 20').optional(),
  textColor: z.string().trim().regex(colorRegex, 'Invalid text color format').optional(),
  opacity: z.number().finite().min(0, 'Opacity must be at least 0').max(1, 'Opacity cannot exceed 1').optional(),
});

/**
 * Single architecture node validation
 */
export const architectureNodeSchema = z.object({
  id: z
    .string({ required_error: 'Node id is required' })
    .trim()
    .min(1, 'Node id cannot be empty')
    .max(100, 'Node id cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9_\-.:]+$/, 'Node id contains invalid characters for graph identification'),
  type: z.enum(ARCHITECTURE_NODE_TYPES as [ArchitectureNodeType, ...ArchitectureNodeType[]], {
    errorMap: () => ({ message: 'Invalid architecture node type' }),
  }),
  position: nodePositionSchema,
  width: z
    .number()
    .finite()
    .positive('Node width must be positive')
    .max(5000, 'Node width cannot exceed 5000')
    .optional(),
  height: z
    .number()
    .finite()
    .positive('Node height must be positive')
    .max(5000, 'Node height cannot exceed 5000')
    .optional(),
  data: nodeDataSchema,
  style: nodeStyleSchema.optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const edgeStyleSchema = z.object({
  strokeColor: z.string().trim().regex(colorRegex, 'Invalid stroke color format').optional(),
  strokeWidth: z.number().finite().min(0.5, 'Stroke width must be at least 0.5').max(20, 'Stroke width cannot exceed 20').optional(),
  opacity: z.number().finite().min(0, 'Opacity must be at least 0').max(1, 'Opacity cannot exceed 1').optional(),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
  connectorType: z.enum(['straight', 'smoothstep', 'curved']).optional(),
  arrowHeadStart: z.enum(['none', 'arrow', 'arrowclosed']).optional(),
  arrowHeadEnd: z.enum(['none', 'arrow', 'arrowclosed']).optional(),
});

/**
 * Single architecture edge validation
 */
export const architectureEdgeSchema = z
  .object({
    id: z
      .string({ required_error: 'Edge id is required' })
      .trim()
      .min(1, 'Edge id cannot be empty')
      .max(100, 'Edge id cannot exceed 100 characters'),
    source: z
      .string({ required_error: 'Edge source is required' })
      .trim()
      .min(1, 'Edge source cannot be empty'),
    target: z
      .string({ required_error: 'Edge target is required' })
      .trim()
      .min(1, 'Edge target cannot be empty'),
    type: z
      .enum(ARCHITECTURE_EDGE_TYPES as [EdgeType, ...EdgeType[]], {
        errorMap: () => ({ message: 'Invalid architecture edge type' }),
      })
      .optional(),
    label: z.string().trim().max(100, 'Edge label cannot exceed 100 characters').optional(),
    animated: z.boolean().optional(),
    style: edgeStyleSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .refine((edge) => edge.source !== edge.target, {
    message: 'Self-loop edges are not allowed',
    path: ['target'],
  });

/**
 * Viewport schema (0.1 <= zoom <= 4)
 */
export const architectureViewportSchema = z.object({
  x: z.number({ required_error: 'Viewport x is required' }).finite('Viewport x must be finite'),
  y: z.number({ required_error: 'Viewport y is required' }).finite('Viewport y must be finite'),
  zoom: z
    .number({ required_error: 'Viewport zoom is required' })
    .finite('Viewport zoom must be finite')
    .min(0.1, 'Zoom must be at least 0.1')
    .max(4, 'Zoom cannot exceed 4'),
});

export const canvasSettingsSchema = z.object({
  backgroundColor: z.string().trim().regex(colorRegex, 'Invalid background color format').optional(),
  gridType: z.enum(['dots', 'lines', 'cross', 'none']).optional(),
  gridSpacing: z.number().finite().min(5, 'Grid spacing must be at least 5').max(100, 'Grid spacing cannot exceed 100').optional(),
  gridVisible: z.boolean().optional(),
  snapToGrid: z.boolean().optional(),
});

/**
 * Replacement update payload schema
 */
export const updateArchitectureSchema = z.object({
  nodes: z.array(architectureNodeSchema),
  edges: z.array(architectureEdgeSchema),
  viewport: architectureViewportSchema,
  canvasSettings: canvasSettingsSchema.optional(),
  version: z
    .number({ required_error: 'Architecture version is required' })
    .int('Version must be an integer')
    .nonnegative('Version must be non-negative'),
});

export const getArchitectureSchema = {
  params: z.object({
    projectId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
  }),
};

export const putArchitectureSchema = {
  params: z.object({
    projectId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
  }),
  body: updateArchitectureSchema,
};

export const validateArchitectureSchema = {
  params: z.object({
    projectId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID format'),
  }),
  body: z
    .object({
      nodes: z.array(z.any()).optional(),
      edges: z.array(z.any()).optional(),
    })
    .optional(),
};


