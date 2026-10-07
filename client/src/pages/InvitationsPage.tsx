import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FolderGit2,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import {
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from '../store/api/projectApi';

export const InvitationsPage: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetInvitationsQuery();
  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const invitations = response && response.success ? response.data.invitations : [];

  const handleAccept = async (invitationId: string) => {
    setActiveActionId(invitationId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await acceptInvitation(invitationId).unwrap();
      if (res.success) {
        setActionSuccess(`Invitation accepted! You now have access to "${res.data.project.name}".`);
      }
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setActionError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setActionError('Failed to accept invitation. Please try again.');
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setActiveActionId(invitationId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await rejectInvitation(invitationId).unwrap();
      setActionSuccess('Invitation declined.');
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setActionError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setActionError('Failed to decline invitation. Please try again.');
      }
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Mail className="h-4 w-4" />
            <span>Project Access Invitations</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Invitations Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Accept invitations from other architects to collaborate on architecture projects.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        >
          <FolderGit2 className="h-4 w-4 text-cyan-400" />
          <span>My Projects</span>
        </Link>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400/80 hover:text-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Invitations List */}
      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">Failed to load invitations</h3>
          <p className="mt-1 text-xs text-rose-300">
            Could not connect to the invitations service.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      ) : invitations.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">No invitations received</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
            When another user invites you to join their architecture project, the invitation will appear here.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
          >
            <span>Go to My Projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {invitations.map((inv) => {
            const isPending = inv.status === 'PENDING';
            const isExpired =
              inv.status === 'EXPIRED' ||
              (isPending && new Date(inv.expiresAt).getTime() < Date.now());
            const isAccepted = inv.status === 'ACCEPTED';
            const isRejected = inv.status === 'REJECTED';
            const isOperating = activeActionId === inv.id;

            return (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg transition-all hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-white text-base">
                      {inv.projectName || 'Architecture Project'}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide border ${
                        inv.role === 'EDITOR'
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                      }`}
                    >
                      {inv.role}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        isAccepted
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : isRejected
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                          : isExpired
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>Invited by</span>
                    <strong className="text-slate-300">{inv.inviterName || 'Project Owner'}</strong>
                    <span>to contribute as an {inv.role.toLowerCase()}.</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {isExpired
                          ? `Expired on ${new Date(inv.expiresAt).toLocaleDateString()}`
                          : `Expires on ${new Date(inv.expiresAt).toLocaleDateString()}`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {isPending && !isExpired ? (
                    <>
                      <button
                        onClick={() => handleAccept(inv.id)}
                        disabled={isOperating || isAccepting || isRejecting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
                      >
                        {isOperating && isAccepting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(inv.id)}
                        disabled={isOperating || isAccepting || isRejecting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-50 transition-all"
                      >
                        {isOperating && isRejecting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Declining...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : isAccepted ? (
                    <Link
                      to={`/projects/${inv.projectId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-cyan-400 hover:bg-slate-700 hover:text-cyan-300"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>View Project</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No action available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
