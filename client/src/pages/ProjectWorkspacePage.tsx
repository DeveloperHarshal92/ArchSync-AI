import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Cpu,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  Clock,
  GitBranch,
  CircleDot,
  CheckCircle,
} from 'lucide-react';
import { useGetProjectByIdQuery, useGetProjectMembersQuery, useCreateInvitationMutation, useUpdateMemberRoleMutation, useRemoveMemberMutation } from '../store/api/projectApi';
import { useGetArchitectureQuery } from '../store/api/architectureApi';
import { ArchitectureCanvas } from '../components/architecture/ArchitectureCanvas';
import { ProjectMemberWithUser } from '@archsync/shared';
import { canEditArchitecture, canManageMembers } from '../lib/permissions';
import { parseApiError } from '../lib/apiErrors';
import { useAppDispatch } from '../store/hooks';
import { setActiveProjectId, resetEditorState } from '../store/slices/editorSlice';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const validProjectId = projectId || '';
  const dispatch = useAppDispatch();

  // Manage project-scoped editor state isolation
  React.useEffect(() => {
    if (validProjectId) {
      dispatch(setActiveProjectId(validProjectId));
    }
    return () => {
      dispatch(resetEditorState());
    };
  }, [validProjectId, dispatch]);

  const {
    data: projectRes,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useGetProjectByIdQuery(validProjectId);

  const {
    data: membersRes,
    isLoading: isMembersLoading,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useGetProjectMembersQuery(validProjectId);

  const { data: archRes, isLoading: isArchLoading } = useGetArchitectureQuery(validProjectId);

  const [createInvitation, { isLoading: isInviting }] = useCreateInvitationMutation();
  const [updateMemberRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();

  // Invite Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Remove Member States
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberWithUser | null>(null);

  // General Notification
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  if (isProjectLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <p className="text-sm text-slate-400">Loading architecture project...</p>
      </div>
    );
  }

  if (isProjectError || !projectRes || !projectRes.success) {
    const errorDetails = parseApiError(projectError);

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Cannot Access Project</h2>
        <p className="mt-2 text-sm text-slate-400">{errorDetails.message}</p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const project = projectRes.data.project;
  const currentUserRole = project.access?.role ?? 'VIEWER';
  const isOwner = canManageMembers(currentUserRole);
  const isEditable = canEditArchitecture(currentUserRole);
  const members = membersRes && membersRes.success ? membersRes.data.members : [];

  const handleOpenInviteModal = () => {
    setInviteEmail('');
    setInviteRole('EDITOR');
    setInviteError(null);
    setInviteSuccess(null);
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    const emailTrimmed = inviteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    try {
      await createInvitation({
        projectId: validProjectId,
        body: {
          email: emailTrimmed,
          role: inviteRole,
        },
      }).unwrap();

      setInviteSuccess(`Invitation sent successfully to ${emailTrimmed} as ${inviteRole}.`);
      setInviteEmail('');
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setInviteError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setInviteError('Failed to send invitation. Please try again.');
      }
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: 'EDITOR' | 'VIEWER') => {
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      await updateMemberRole({
        projectId: validProjectId,
        userId: targetUserId,
        body: { role: newRole },
      }).unwrap();

      setFeedbackSuccess(`Role successfully updated to ${newRole}.`);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFeedbackError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFeedbackError('Failed to update member role.');
      }
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      await removeMember({
        projectId: validProjectId,
        userId: memberToRemove.userId,
      }).unwrap();

      setFeedbackSuccess(`Member "${memberToRemove.user.name}" has been removed from the project.`);
      setMemberToRemove(null);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFeedbackError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFeedbackError('Failed to remove member.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation & Project Metadata Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                currentUserRole === 'OWNER'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : currentUserRole === 'EDITOR'
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span>{currentUserRole} Access</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Layers className="h-7 w-7 text-cyan-400" />
              {project.name}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-3xl">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Global Action Feedback Alerts */}
      {feedbackSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {feedbackError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
          <button
            onClick={() => setFeedbackError(null)}
            className="text-rose-400/80 hover:text-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Project Members Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>Team & Collaboration</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">Project Members</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Users authorized to view or edit this architecture project.
            </p>
          </div>

          {isOwner && (
            <button
              onClick={handleOpenInviteModal}
              id="invite-member-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        {/* Member List */}
        {isMembersLoading ? (
          <div className="mt-6 space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-slate-800 bg-slate-900/30 p-4 animate-pulse"
              />
            ))}
          </div>
        ) : isMembersError ? (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-rose-400" />
            <p className="mt-2 text-xs text-rose-300">Failed to load project members.</p>
            <button
              onClick={() => refetchMembers()}
              className="mt-2 rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="mt-6 p-8 text-center text-xs text-slate-400">
            No members found for this project.
          </div>
        ) : (
          <div className="mt-6 divide-y divide-slate-800/80">
            {members.map((member) => {
              const isMemberOwner = member.role === 'OWNER';

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-sm">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {member.user.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide border ${
                            member.role === 'OWNER'
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              : member.role === 'EDITOR'
                              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                              : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Owner Management Controls */}
                    {isOwner && (
                      <div className="flex items-center gap-2">
                        {isMemberOwner ? (
                          <span className="text-[11px] font-medium text-amber-400/70 italic px-2">
                            Owner
                          </span>
                        ) : (
                          <>
                            {/* Role select */}
                            <select
                              value={member.role}
                              disabled={isUpdatingRole}
                              onChange={(e) =>
                                handleRoleChange(
                                  member.userId,
                                  e.target.value as 'EDITOR' | 'VIEWER'
                                )
                              }
                              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                            >
                              <option value="EDITOR">EDITOR</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>

                            {/* Remove button */}
                            <button
                              onClick={() => setMemberToRemove(member)}
                              disabled={isRemovingMember}
                              title="Remove member"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Architecture Canvas Workspace */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="h-4 w-4" />
              <span>Interactive Architecture Canvas</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">System Architecture Canvas</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {isEditable
                ? 'Drag components from the palette, connect nodes, and configure technologies in real time.'
                : 'Viewing system architecture diagram with read-only permissions.'}
            </p>
          </div>

          {/* Live Architecture Status Indicators */}
          {archRes && archRes.success && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
                <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                <span>v{archRes.data.architecture.version}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
                <CircleDot className="h-3.5 w-3.5 text-emerald-400" />
                <span>{archRes.data.architecture.nodes.length} Components</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300">
                <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  {archRes.data.validation?.valid !== false ? 'Valid Graph' : 'Validation Issues'}
                </span>
              </span>
            </div>
          )}
        </div>

        {isArchLoading ? (
          <div className="flex h-[720px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 shadow-2xl backdrop-blur-md">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
            <p className="text-sm text-slate-400">Loading architecture diagram and components...</p>
          </div>
        ) : archRes && archRes.success ? (
          <ArchitectureCanvas
            initialArchitecture={archRes.data.architecture}
            isEditable={isEditable}
          />
        ) : (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Failed to load architecture</h3>
            <p className="mt-1 text-xs text-rose-300">Could not retrieve diagram state from server.</p>
          </div>
        )}
      </section>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Invite Collaborator</h2>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            {inviteError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Collaborator Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="architect@organization.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Access Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="EDITOR">EDITOR — Can edit architecture and metadata</option>
                  <option value="VIEWER">VIEWER — Can view architecture diagrams only</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending Invite...</span>
                    </>
                  ) : (
                    <span>Send Invitation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <Trash2 className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Remove Project Member</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to revoke access for{' '}
              <strong className="text-white font-semibold">
                "{memberToRemove.user.name}" ({memberToRemove.user.email})
              </strong>
              ? They will no longer be able to view or edit this project.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirm}
                disabled={isRemovingMember}
                className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {isRemovingMember ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Member</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
