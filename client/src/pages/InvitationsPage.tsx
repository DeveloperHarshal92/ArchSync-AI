import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  useGetInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from '../store/api/projectApi';
import { useTheme } from '../context/ThemeContext';

export const InvitationsPage: React.FC = () => {
  const { data: response, isLoading, isError } = useGetInvitationsQuery();
  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();
  const { resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  const filteredInvitations = useMemo(() => {
    const now = Date.now();
    return invitations.filter((inv) => {
      // Search
      const matchProject = (inv.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchInviter = (inv.inviterName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchEmail = (inv.invitedEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (searchQuery && !matchProject && !matchInviter && !matchEmail) return false;

      // Role
      if (roleFilter !== 'all' && inv.role !== roleFilter) return false;

      // Status
      if (statusFilter === 'pending' && (inv.status !== 'PENDING' || new Date(inv.expiresAt).getTime() < now))
        return false;
      if (statusFilter === 'accepted' && inv.status !== 'ACCEPTED') return false;

      return true;
    });
  }, [invitations, searchQuery, roleFilter, statusFilter]);

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
    <div className="mx-auto w-full max-w-[1600px] space-y-6 select-none">
      {/* -------------------------------------------------------------
          1. BREADCRUMBS & HEADER WITH ARCHITECTURAL ARTWORK (Reference 8)
          ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[160px]">
          {/* Left Text */}
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-2 z-10">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span>Collaboration</span>
              <span>&gt;</span>
              <span className="text-[var(--color-accent)] font-semibold">Team Invitations</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text)]">
              Team Invitations
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-lg leading-relaxed">
              Review and respond to collaboration requests from project owners and teammates.
            </p>
          </div>

          {/* Right Banner Artwork */}
          <div className="hidden lg:block lg:col-span-4 relative h-full min-h-[160px] overflow-hidden">
            <img
              src={
                resolvedTheme === 'light'
                  ? '/assets/images/arch_monument_lake_light.jpg'
                  : '/assets/images/arch_monument_lake.jpg'
              }
              alt="Architectural pavilion representing collaborative systems"
              className="absolute inset-0 h-full w-full object-cover filter contrast-[1.02] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div role="alert" className="rounded-xl border border-status-danger/30 bg-status-danger/10 p-3.5 text-xs text-status-danger flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. TABS & SEARCH / FILTER ROW (Matching Reference Image 8)
          ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Tabs: Received / Sent */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'received'
                ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/12 text-[var(--color-accent)] shadow-xs'
                : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Received ({invitations.length}{pendingCount > 0 ? ` • ${pendingCount} Pending` : ''})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'sent'
                ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/12 text-[var(--color-accent)] shadow-xs'
                : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>Sent (0)</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="search"
              placeholder="Search invitations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs"
            >
              <option value="all">All Roles</option>
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. INVITATIONS TABLE (Directly matching Reference Image 8)
          ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="mt-2 text-xs font-mono text-[var(--color-text-muted)]">Loading invitations...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-status-danger">
            <AlertCircle className="mx-auto h-8 w-8" />
            <p className="mt-2 text-xs">Failed to load team invitations.</p>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
            <h3 className="mt-3 font-serif text-lg font-medium text-[var(--color-text)]">No invitations found</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {searchQuery
                ? 'No invitations match your current filter criteria.'
                : 'You have no pending invitations to join external workspaces.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[10px] font-mono tracking-wider text-[var(--color-text-muted)] uppercase">
                  <th className="py-3 px-5 font-semibold">INVITER</th>
                  <th className="py-3 px-5 font-semibold">PROJECT</th>
                  <th className="py-3 px-5 font-semibold">INVITED DATE</th>
                  <th className="py-3 px-5 font-semibold">ROLE</th>
                  <th className="py-3 px-5 font-semibold">STATUS</th>
                  <th className="py-3 px-5 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredInvitations.map((inv) => {
                  const isPending = inv.status === 'PENDING' && new Date(inv.expiresAt).getTime() >= Date.now();
                  const isAccepted = inv.status === 'ACCEPTED';
                  const isProcessing = activeActionId === inv.id;

                  const inviterName = inv.inviterName || 'Architect';
                  const inviterEmail = inv.invitedEmail;
                  const projectName = inv.projectName || 'Architecture Workspace';
                  const projectDesc = 'Collaborative software system design';

                  return (
                    <tr key={inv.id} className="hover:bg-[var(--color-surface-raised)]/60 transition-colors">
                      {/* Inviter */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[var(--color-blue)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {inviterName[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--color-text)]">{inviterName}</div>
                            <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{inviterEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                            <FolderGit2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--color-text)]">{projectName}</div>
                            <div className="text-[11px] text-[var(--color-text-muted)] max-w-xs truncate">
                              {projectDesc}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Invited Date */}
                      <td className="py-4 px-5">
                        <div className="text-[11px] text-[var(--color-text)] font-medium">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                          {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        <span className="inline-block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1 text-[11px] font-mono font-medium text-[var(--color-text)]">
                          {inv.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Accepted</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                            <span>Expired</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Accepted</span>
                          </span>
                        ) : isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAccept(inv.id)}
                              disabled={isProcessing}
                              className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
                            >
                              {isProcessing ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(inv.id)}
                              disabled={isProcessing}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] shadow-xs disabled:opacity-50 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)] italic">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-5 py-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-raised)]/30">
          <div>Showing {filteredInvitations.length} invitations</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-40"
              disabled
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold">
              1
            </span>
            <button
              type="button"
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-40"
              disabled
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
