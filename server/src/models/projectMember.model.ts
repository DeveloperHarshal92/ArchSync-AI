import { Schema, model, Document, Types } from 'mongoose';
import { ProjectMemberRole, ProjectMember } from '@archsync/shared';

export interface IProjectMember extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ProjectMemberRole;
  joinedAt: Date;
  toSafeObject(): ProjectMember;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'EDITOR', 'VIEWER'],
      required: [true, 'Member role is required'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
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

// Compound unique index ensuring a user can have only one membership per project
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

// Secondary index for querying all projects a user belongs to
projectMemberSchema.index({ userId: 1, projectId: 1 });

/**
 * Returns a client-safe ProjectMember representation
 */
projectMemberSchema.methods.toSafeObject = function (): ProjectMember {
  return {
    id: String(this._id),
    projectId: String(this.projectId),
    userId: String(this.userId),
    role: this.role,
    joinedAt: this.joinedAt ? this.joinedAt.toISOString() : new Date().toISOString(),
  };
};

export const ProjectMemberModel = model<IProjectMember>('ProjectMember', projectMemberSchema);
