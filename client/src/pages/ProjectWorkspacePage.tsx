import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';
import {
  useGetProjectByIdQuery,
  useGetProjectMembersQuery,
  useCreateInvitationMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useUpdateProjectMutation,
} from '../store/api/projectApi';
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
  useEffect(() => {
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

  const {
    data: archRes,
    isLoading: isArchLoading,
    refetch: refetchArchitecture,
  } = useGetArchitectureQuery(validProjectId);

  const [createInvitation, { isLoading: isInviting }] = useCreateInvitationMutation();
  const [updateMemberRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();
  const [updateProject] = useUpdateProjectMutation();

  // Team Members Modal State
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const membersModalRef = useRef<HTMLDivElement>(null);

  // Invite Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const inviteModalRef = useRef<HTMLDivElement>(null);
  const inviteFirstFocusRef = useRef<HTMLInputElement>(null);

  // Remove Member States
  const [memberToRemove, setMemberToRemove] = useState<ProjectMemberWithUser | null>(null);
  const removeModalRef = useRef<HTMLDivElement>(null);
  const removeCancelRef = useRef<HTMLButtonElement>(null);

  // General Notification
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // F14: Focus first focusable element when invite modal opens
  useEffect(() => {
    if (isInviteModalOpen) {
      setTimeout(() => inviteFirstFocusRef.current?.focus(), 50);
    }
  }, [isInviteModalOpen]);

  // F14: Focus cancel button when remove modal opens
  useEffect(() => {
    if (memberToRemove) {
      setTimeout(() => removeCancelRef.current?.focus(), 50);
    }
  }, [memberToRemove]);

  // F14: Escape key closes whichever modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isInviteModalOpen) setIsInviteModalOpen(false);
        else if (memberToRemove) setMemberToRemove(null);
        else if (isMembersModalOpen) setIsMembersModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInviteModalOpen, memberToRemove, isMembersModalOpen]);

  if (isProjectLoading) {
    return (
      <div className="flex h-full w-full min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#0a0f1d]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <p className="text-sm text-slate-400">Loading architecture project...</p>
      </div>
    );
  }

  if (isProjectError || !projectRes || !projectRes.success) {
    const errorDetails = parseApiError(projectError);

    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0a0f1d] px-4 py-16 text-center">
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
      refetchMembers();
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
      refetchMembers();
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
      refetchMembers();
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

  const handleRenameProject = async (newName: string) => {
    try {
      await updateProject({
        projectId: validProjectId,
        body: { name: newName },
      }).unwrap();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFeedbackError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFeedbackError('Failed to rename project.');
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#0a0f1d]">
      {/* Architecture Canvas Full-Viewport Workspace */}
      {isArchLoading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-sm text-slate-400">Loading architecture diagram and components...</p>
        </div>
      ) : archRes && archRes.success ? (
        <ArchitectureCanvas
          initialArchitecture={archRes.data.architecture}
          initialValidation={archRes.data.validation}
          projectName={project.name}
          projectDescription={project.description}
          isEditable={isEditable}
          currentUserRole={currentUserRole}
          membersCount={members.length}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          onRenameProject={handleRenameProject}
          onReload={refetchArchitecture}
        />
      ) : (
        <div className="m-auto max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-400 mb-2" />
          <h3 className="text-base font-semibold text-white">Failed to load architecture</h3>
          <p className="mt-1 text-xs text-rose-300">Could not retrieve diagram state from server.</p>
          <button
            onClick={() => refetchArchitecture()}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Accessible Project Members Modal */}
      {isMembersModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMembersModalOpen(false);
          }}
        >
          <div
            ref={membersModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="members-modal-title"
            className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="members-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                    <span>Project Collaborators</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono font-medium text-slate-300">
                      {members.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Users authorized to view or edit &quot;{project.name}&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={handleOpenInviteModal}
                    id="invite-member-btn"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Invite</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMembersModalOpen(false)}
                  aria-label="Close project members dialog"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* In-Modal Alerts */}
            {feedbackSuccess && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
                <button
                  onClick={() => setFeedbackSuccess(null)}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Dismiss
                </button>
              </div>
            )}

            {feedbackError && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400 shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedbackError}</span>
                </div>
                <button
                  onClick={() => setFeedbackError(null)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Member List */}
            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1">
              {isMembersLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl border border-slate-800 bg-slate-900/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : isMembersError ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center my-4">
                  <AlertCircle className="mx-auto h-5 w-5 text-rose-400" />
                  <p className="mt-2 text-xs text-rose-300">Failed to load project members.</p>
                  <button
                    onClick={() => refetchMembers()}
                    className="mt-2 rounded bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    Retry
                  </button>
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No members found for this project.
                </div>
              ) : (
                members.map((member) => {
                  const isMemberOwner = member.role === 'OWNER';

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 font-bold text-xs">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {member.user.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-semibold border ${
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
                          <p className="text-[11px] text-slate-400">{member.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Owner Controls */}
                        {isOwner && (
                          <div className="flex items-center gap-2">
                            {isMemberOwner ? (
                              <span className="text-[11px] font-medium text-amber-400/70 italic px-2">
                                Owner
                              </span>
                            ) : (
                              <>
                                <select
                                  value={member.role}
                                  disabled={isUpdatingRole}
                                  onChange={(e) =>
                                    handleRoleChange(
                                      member.userId,
                                      e.target.value as 'EDITOR' | 'VIEWER'
                                    )
                                  }
                                  className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                                >
                                  <option value="EDITOR">EDITOR</option>
                                  <option value="VIEWER">VIEWER</option>
                                </select>

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
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="rounded-lg border border-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInviteModalOpen(false);
          }}
        >
          <div
            ref={inviteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                <h2 id="invite-modal-title" className="text-lg font-bold text-white">
                  Invite Collaborator
                </h2>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Close invite collaborator dialog"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
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
                <label
                  htmlFor="invite-email-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Collaborator Email *
                </label>
                <input
                  id="invite-email-input"
                  ref={inviteFirstFocusRef}
                  type="email"
                  required
                  placeholder="architect@organization.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-role-select"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Access Role *
                </label>
                <select
                  id="invite-role-select"
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
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMemberToRemove(null);
          }}
        >
          <div
            ref={removeModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-modal-title"
            className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <Trash2 className="h-6 w-6" aria-hidden="true" />
              <h3 id="remove-modal-title" className="text-base font-bold text-white">
                Remove Project Member
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to revoke access for{' '}
              <strong className="text-white font-semibold">
                &quot;{memberToRemove.user.name}&quot; ({memberToRemove.user.email})
              </strong>
              ? They will no longer be able to view or edit this project.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={removeCancelRef}
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
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
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
