import { Schema, model, Document, Types } from 'mongoose';
import { InvitationStatus, ProjectInvitation } from '@archsync/shared';

export interface IProjectInvitation extends Document {
  projectId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUserId?: Types.ObjectId;
  invitedEmail: string;
  role: 'EDITOR' | 'VIEWER';
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): ProjectInvitation;
}

const projectInvitationSchema = new Schema<IProjectInvitation>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviter ID is required'],
    },
    invitedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    invitedEmail: {
      type: String,
      required: [true, 'Invited email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['EDITOR', 'VIEWER'],
      required: [true, 'Role must be EDITOR or VIEWER'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
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

// Compound index for querying existing invitations per project and email
projectInvitationSchema.index({ projectId: 1, invitedEmail: 1 });
// Index for finding all user invitations
projectInvitationSchema.index({ invitedEmail: 1, status: 1 });

/**
 * Returns a client-safe ProjectInvitation representation
 */
projectInvitationSchema.methods.toSafeObject = function (): ProjectInvitation {
  return {
    id: String(this._id),
    projectId: String(this.projectId),
    invitedBy: String(this.invitedBy),
    invitedUserId: this.invitedUserId ? String(this.invitedUserId) : undefined,
    invitedEmail: this.invitedEmail,
    role: this.role,
    status: this.status,
    expiresAt: this.expiresAt.toISOString(),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const ProjectInvitationModel = model<IProjectInvitation>(
  'ProjectInvitation',
  projectInvitationSchema
);
