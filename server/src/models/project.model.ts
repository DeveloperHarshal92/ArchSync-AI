import { Schema, model, Document, Types } from 'mongoose';
import { Project } from '@archsync/shared';

export interface IProject extends Document {
  name: string;
  description?: string;
  ownerId: Types.ObjectId;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): Project;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [1, 'Project name cannot be empty'],
      maxlength: [100, 'Project name must be under 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be under 500 characters'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast retrieval of user projects sorted by creation
projectSchema.index({ ownerId: 1, createdAt: -1 });

/**
 * Returns a client-safe representation matching the shared Project contract
 */
projectSchema.methods.toSafeObject = function (): Project {
  return {
    id: String(this._id),
    name: this.name,
    description: this.description,
    ownerId: String(this.ownerId),
    thumbnailUrl: this.thumbnailUrl,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const ProjectModel = model<IProject>('Project', projectSchema);
