import { Schema, model, Document, Types } from 'mongoose';
import {
  Architecture,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureViewport,
  ARCHITECTURE_NODE_TYPES,
  ARCHITECTURE_EDGE_TYPES,
} from '@archsync/shared';

export interface IArchitectureDocument extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  viewport: ArchitectureViewport;
  canvasSettings?: {
    backgroundColor?: string;
    gridType?: 'dots' | 'lines' | 'cross' | 'none';
    gridSpacing?: number;
    gridVisible?: boolean;
    snapToGrid?: boolean;
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): Architecture;
}

const nodeDataSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    technology: { type: String, trim: true },
    category: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const nodePositionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const nodeStyleSchema = new Schema(
  {
    fillColor: { type: String, trim: true },
    borderColor: { type: String, trim: true },
    borderWidth: { type: Number },
    textColor: { type: String, trim: true },
    opacity: { type: Number },
  },
  { _id: false }
);

const nodeSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ARCHITECTURE_NODE_TYPES,
    },
    position: { type: nodePositionSchema, required: true },
    width: { type: Number },
    height: { type: Number },
    data: { type: nodeDataSchema, required: true },
    style: { type: nodeStyleSchema, required: false },
    createdBy: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const edgeStyleSchema = new Schema(
  {
    strokeColor: { type: String, trim: true },
    strokeWidth: { type: Number },
    opacity: { type: Number },
    strokeStyle: { type: String, enum: ['solid', 'dashed', 'dotted'] },
    connectorType: { type: String, enum: ['straight', 'smoothstep', 'curved'] },
    arrowHeadStart: { type: String, enum: ['none', 'arrow', 'arrowclosed'] },
    arrowHeadEnd: { type: String, enum: ['none', 'arrow', 'arrowclosed'] },
  },
  { _id: false }
);

const edgeSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ARCHITECTURE_EDGE_TYPES,
      default: 'default',
    },
    label: { type: String, trim: true },
    animated: { type: Boolean, default: false },
    style: { type: edgeStyleSchema, required: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const viewportSchema = new Schema(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 },
  },
  { _id: false }
);

const canvasSettingsSchema = new Schema(
  {
    backgroundColor: { type: String, default: '#eae6ed' },
    gridType: { type: String, enum: ['dots', 'lines', 'cross', 'none'], default: 'dots' },
    gridSpacing: { type: Number, default: 20 },
    gridVisible: { type: Boolean, default: true },
    snapToGrid: { type: Boolean, default: false },
  },
  { _id: false }
);

const architectureSchema = new Schema<IArchitectureDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      index: true,
    },
    nodes: {
      type: [nodeSchema],
      default: [],
    },
    edges: {
      type: [edgeSchema],
      default: [],
    },
    viewport: {
      type: viewportSchema,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
    canvasSettings: {
      type: canvasSettingsSchema,
      default: () => ({
        backgroundColor: '#eae6ed',
        gridType: 'dots',
        gridSpacing: 20,
        gridVisible: true,
        snapToGrid: false,
      }),
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

architectureSchema.methods.toSafeObject = function (): Architecture {
  return {
    projectId: this.projectId.toString(),
    nodes: (this.nodes || []).map((node: ArchitectureNode) => ({
      id: node.id,
      type: node.type,
      position: {
        x: Number(node.position.x),
        y: Number(node.position.y),
      },
      width: node.width !== undefined ? Number(node.width) : undefined,
      height: node.height !== undefined ? Number(node.height) : undefined,
      data: {
        label: node.data.label,
        description: node.data.description,
        technology: node.data.technology,
        category: node.data.category,
        metadata: node.data.metadata,
      },
      style: node.style
        ? {
            fillColor: node.style.fillColor,
            borderColor: node.style.borderColor,
            borderWidth: node.style.borderWidth !== undefined ? Number(node.style.borderWidth) : undefined,
            textColor: node.style.textColor,
            opacity: node.style.opacity !== undefined ? Number(node.style.opacity) : undefined,
          }
        : undefined,
      createdBy: node.createdBy || '',
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: node.updatedAt || new Date().toISOString(),
    })),
    edges: (this.edges || []).map((edge: ArchitectureEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
      label: edge.label,
      animated: edge.animated,
      style: edge.style
        ? {
            strokeColor: edge.style.strokeColor,
            strokeWidth: edge.style.strokeWidth !== undefined ? Number(edge.style.strokeWidth) : undefined,
            opacity: edge.style.opacity !== undefined ? Number(edge.style.opacity) : undefined,
            strokeStyle: edge.style.strokeStyle,
            connectorType: edge.style.connectorType,
            arrowHeadStart: edge.style.arrowHeadStart,
            arrowHeadEnd: edge.style.arrowHeadEnd,
          }
        : undefined,
      metadata: edge.metadata,
      createdBy: edge.createdBy || '',
      createdAt: edge.createdAt || new Date().toISOString(),
      updatedAt: edge.updatedAt || new Date().toISOString(),
    })),
    viewport: {
      x: Number(this.viewport?.x ?? 0),
      y: Number(this.viewport?.y ?? 0),
      zoom: Number(this.viewport?.zoom ?? 1),
    },
    canvasSettings: {
      backgroundColor: this.canvasSettings?.backgroundColor || '#eae6ed',
      gridType: this.canvasSettings?.gridType || 'dots',
      gridSpacing: Number(this.canvasSettings?.gridSpacing ?? 20),
      gridVisible: this.canvasSettings?.gridVisible !== false,
      snapToGrid: Boolean(this.canvasSettings?.snapToGrid),
    },
    version: Number(this.version),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const ArchitectureModel = model<IArchitectureDocument>(
  'Architecture',
  architectureSchema
);
