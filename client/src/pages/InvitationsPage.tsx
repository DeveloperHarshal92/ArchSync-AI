import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FolderGit2,
  Inbox,
  ArrowRight,
  ShieldCheck,
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

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const invitations = response && response.success ? response.data.invitations : [];

  const pendingCount = useMemo(() => {
    const now = Date.now();
    return invitations.filter(
      (inv) => inv.status === 'PENDING' && new Date(inv.expiresAt).getTime() >= now
    ).length;
  }, [invitations]);

  const resolvedCount = useMemo(() => {
    return invitations.length - pendingCount;
  }, [invitations, pendingCount]);

  const filteredInvitations = useMemo(() => {
    const now = Date.now();
    if (filter === 'PENDING') {
      return invitations.filter(
        (inv) => inv.status === 'PENDING' && new Date(inv.expiresAt).getTime() >= now
      );
    }
    if (filter === 'RESOLVED') {
      return invitations.filter(
        (inv) => inv.status !== 'PENDING' || new Date(inv.expiresAt).getTime() < now
      );
    }
    return invitations;
  }, [invitations, filter]);

  const isAnyActionRunning = isAccepting || isRejecting || activeActionId !== null;

  const handleAccept = async (invitationId: string) => {
    if (isAnyActionRunning) return;
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
    if (isAnyActionRunning) return;
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
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 text-[#226192]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#226192]/15">
        <div>
          <div className="flex items-center gap-2 text-[#ef8557] font-mono text-xs uppercase tracking-widest font-semibold">
            <Mail className="h-4 w-4" />
            <span>Collaboration & Access Management</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#226192]">
            Invitations Inbox
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#226192]/70">
            Review and respond to collaboration requests from engineering teams across workspaces.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-semibold text-[#226192] hover:border-[#226192] hover:bg-[#226192]/5 transition-colors self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-[#ef8557]"
        >
          <FolderGit2 className="h-4 w-4 text-[#ef8557]" />
          <span>My Projects</span>
        </Link>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div
          role="status"
          className="mt-6 flex items-center justify-between rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/10 p-4 text-xs text-[#226192]"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ef8557]" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-[#ef8557] hover:underline transition-colors text-xs font-medium"
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/10 p-4 text-xs text-[#226192]"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ef8557]" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-[#ef8557] hover:underline transition-colors text-xs font-medium"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      {!isLoading && !isError && invitations.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#226192]/20 bg-[#eae6ed] p-1 font-mono text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#ef8557] text-[#226192] shadow-sm'
                  : 'text-[#226192]/70 hover:text-[#226192]'
              }`}
            >
              All ({invitations.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'PENDING'
                  ? 'bg-[#ef8557] text-[#226192] shadow-sm'
                  : 'text-[#226192]/70 hover:text-[#226192]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-[#ef8557] text-[#226192] shadow-sm'
                  : 'text-[#226192]/70 hover:text-[#226192]'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>
      )}

      {/* Invitations List / States */}
      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-[#226192]/15 bg-[#226192]/5 p-5 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-[#ef8557]/40 bg-[#ef8557]/10 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[#ef8557]" />
          <h3 className="mt-3 font-serif text-lg font-medium text-[#226192]">Failed to load invitations</h3>
          <p className="mt-1 text-xs text-[#226192]/70">
            Could not connect to the invitations service.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-[#eae6ed] border border-[#226192]/20 px-4 py-2 text-xs font-semibold text-[#226192] hover:border-[#ef8557] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : invitations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#226192]/20 bg-[#226192]/5 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#226192]/10 text-[#226192] border border-[#226192]/20">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-medium text-[#226192]">No invitations received</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#226192]/70">
            When another user invites you to join their architecture project, your invitation will appear here.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557]"
          >
            <span>Go to My Projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#226192]/15 bg-[#226192]/5 p-8 text-center">
          <p className="text-xs text-[#226192]/70">No invitations matching the "{filter.toLowerCase()}" filter.</p>
          <button
            onClick={() => setFilter('ALL')}
            className="mt-3 text-xs text-[#ef8557] hover:underline font-mono font-medium transition-colors"
          >
            View all invitations
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredInvitations.map((inv) => {
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#226192]/15 bg-[#eae6ed] p-5 shadow-sm transition-all hover:border-[#226192]"
              >
                {/* Information Column */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-serif text-lg font-medium text-[#226192]">
                      {inv.projectName || 'Architecture Project'}
                    </h3>

                    {/* Role Pill */}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                        inv.role === 'EDITOR'
                          ? 'border-[#226192]/30 bg-[#226192]/10 text-[#226192]'
                          : 'border-[#226192]/15 bg-transparent text-[#226192]/70'
                      }`}
                    >
                      {inv.role}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                        isAccepted
                          ? 'border-[#226192]/30 bg-[#226192]/10 text-[#226192]'
                          : isRejected
                          ? 'border-[#ef8557]/40 bg-[#ef8557]/15 text-[#226192]'
                          : isExpired
                          ? 'border-[#226192]/15 bg-transparent text-[#226192]/60'
                          : 'border-[#ef8557]/40 bg-[#ef8557]/15 text-[#226192]'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#226192]/70 flex items-center gap-1.5 flex-wrap">
                    <span>Invited by</span>
                    <strong className="text-[#226192] font-medium">
                      {inv.inviterName || 'Project Owner'}
                    </strong>
                    <span>to contribute as an {inv.role.toLowerCase()}.</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#226192]/60 font-mono pt-0.5">
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

                {/* Actions Column */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {isPending && !isExpired ? (
                    <>
                      <button
                        onClick={() => handleAccept(inv.id)}
                        disabled={isAnyActionRunning}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOperating && isAccepting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#226192]" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#226192]" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(inv.id)}
                        disabled={isAnyActionRunning}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-medium text-[#226192]/70 hover:border-[#226192] hover:text-[#226192] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-semibold text-[#226192] hover:border-[#226192] hover:bg-[#226192]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef8557]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#ef8557]" />
                      <span>View Project</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-[#226192]/50 italic font-mono">No action available</span>
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
