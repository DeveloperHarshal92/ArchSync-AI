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
    createdBy: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
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
    version: Number(this.version),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const ArchitectureModel = model<IArchitectureDocument>(
  'Architecture',
  architectureSchema
);
