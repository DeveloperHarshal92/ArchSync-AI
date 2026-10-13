import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, LogOut, FolderGit2, Mail } from 'lucide-react';
import { useGetHealthQuery } from '../../store/api/healthApi';
import { useGetInvitationsQuery } from '../../store/api/projectApi';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { data: healthResponse, isLoading: isHealthLoading, isError: isHealthError } = useGetHealthQuery(undefined, {
    pollingInterval: 30000,
  });
  const { user, isAuthenticated, logout } = useAuth();
  const { data: invitationsRes } = useGetInvitationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const pendingInvitationsCount =
    invitationsRes && invitationsRes.success
      ? invitationsRes.data.invitations.filter((i) => i.status === 'PENDING').length
      : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md transition-colors"
      aria-label="ArchSync AI application header"
    >
      <nav
        className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 text-[var(--color-text)]"
        aria-label="Main navigation"
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          aria-label="ArchSync AI — go to home page"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
                  ArchSync
                </span>
                <span className="rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FFFFFF] dark:text-[#090907]">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block">Collaborative Architecture Workspace</p>
            </div>
          </div>
        </Link>

        {/* Center / Navigation Links for Public View */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--color-text-muted)]">
            <a href="#features" className="hover:text-[var(--color-text)] transition-colors">Features</a>
            <a href="#collaboration" className="hover:text-[var(--color-text)] transition-colors">Collaboration</a>
            <a href="#ai-assistant" className="hover:text-[var(--color-text)] transition-colors">AI Co-Pilot</a>
            <a href="#cta" className="hover:text-[var(--color-text)] transition-colors">Documentation</a>
          </div>
        )}

        {/* Right Section: Health + Theme Switch + Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
            <Activity className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span className="opacity-70">API:</span>
            {isHealthLoading ? (
              <span className="text-[var(--color-accent)]">Connecting...</span>
            ) : isHealthError ? (
              <span className="text-status-danger flex items-center gap-1">Offline</span>
            ) : (
              <span className="text-status-success flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-status-success" />
                {healthResponse?.data?.status ?? 'Online'}
              </span>
            )}
          </div>

          {/* Theme Toggle (Light / Dark / System) */}
          <ThemeToggle variant="compact" />

          {/* Authentication Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                to="/projects"
                id="header-projects-link"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span className="hidden sm:inline">Projects</span>
              </Link>

              <Link
                to="/invitations"
                id="header-invitations-link"
                className="relative flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span className="hidden sm:inline">Invites</span>
                {pendingInvitationsCount > 0 && (
                  <span className="ml-1 rounded-full bg-[var(--color-accent)] px-1.5 py-0.2 text-[10px] font-bold text-[#FFFFFF] dark:text-[#090907]">
                    {pendingInvitationsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                id="header-dashboard-link"
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-[#FFFFFF] dark:text-[#090907]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </span>
                <span className="hidden sm:inline font-medium">{user.name || user.email}</span>
              </Link>

              <button
                type="button"
                id="header-logout-btn"
                onClick={handleLogout}
                aria-label="Sign out of ArchSync AI"
                className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:border-status-danger hover:text-status-danger hover:bg-[var(--color-surface-raised)] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="header-login-btn"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="header-register-btn"
                className="rounded-lg bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
