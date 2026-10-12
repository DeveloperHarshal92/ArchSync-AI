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
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 text-[var(--color-text)] bg-[var(--color-bg)] transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)] font-mono text-xs uppercase tracking-widest font-semibold">
            <Mail className="h-4 w-4" />
            <span>Collaboration & Access Management</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text)]">
            Invitations Inbox
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Review and respond to collaboration requests from engineering teams across workspaces.
          </p>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] shadow-sm"
        >
          <FolderGit2 className="h-4 w-4 text-[var(--color-accent)]" />
          <span>My Projects</span>
        </Link>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div
          role="status"
          className="mt-6 flex items-center justify-between rounded-lg border border-status-success/40 bg-status-success/10 p-4 text-xs text-status-success"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="hover:underline transition-colors text-xs font-medium"
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between rounded-lg border border-status-danger/40 bg-status-danger/10 p-4 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="hover:underline transition-colors text-xs font-medium"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      {!isLoading && !isError && invitations.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 font-mono text-xs shadow-sm">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'ALL'
                  ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              All ({invitations.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'PENDING'
                  ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
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
              className="h-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-status-danger/40 bg-status-danger/10 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-status-danger" />
          <h3 className="mt-3 font-serif text-lg font-medium text-[var(--color-text)]">Failed to load invitations</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Could not connect to the invitations service.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : invitations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)] shadow-sm">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-medium text-[var(--color-text)]">No invitations received</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--color-text-muted)]">
            When another user invites you to join their architecture project, your invitation will appear here.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-4 py-2 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
          >
            <span>Go to My Projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-8 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">No invitations matching the "{filter.toLowerCase()}" filter.</p>
          <button
            onClick={() => setFilter('ALL')}
            className="mt-3 text-xs text-[var(--color-accent)] hover:underline font-mono font-medium transition-colors"
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all hover:border-[var(--color-accent)]"
              >
                {/* Information Column */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-serif text-lg font-medium text-[var(--color-text)]">
                      {inv.projectName || 'Architecture Project'}
                    </h3>

                    {/* Role Pill */}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                        inv.role === 'EDITOR'
                          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {inv.role}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase border ${
                        isAccepted
                          ? 'border-status-success/30 bg-status-success/10 text-status-success'
                          : isRejected
                          ? 'border-status-danger/40 bg-status-danger/15 text-status-danger'
                          : isExpired
                          ? 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                          : 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 flex-wrap">
                    <span>Invited by</span>
                    <strong className="text-[var(--color-text)] font-medium">
                      {inv.inviterName || 'Project Owner'}
                    </strong>
                    <span>to contribute as an {inv.role.toLowerCase()}.</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] font-mono pt-0.5">
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] px-4 py-2 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isAnyActionRunning}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] shadow-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                      <span>View Project</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-[var(--color-text-muted)] italic font-mono">No action available</span>
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
