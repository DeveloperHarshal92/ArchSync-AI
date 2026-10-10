import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Activity, ShieldCheck, LogOut, FolderGit2, Mail } from 'lucide-react';
import { useGetHealthQuery } from '../../store/api/healthApi';
import { useGetInvitationsQuery } from '../../store/api/projectApi';
import { useAuth } from '../../hooks/useAuth';

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
      className="sticky top-0 z-50 border-b border-[#226192]/15 bg-[#eae6ed]/95 backdrop-blur-md"
      aria-label="ArchSync AI application header"
    >
      <nav
        className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10"
        aria-label="Main navigation"
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          aria-label="ArchSync AI — go to home page"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#226192] text-[#eae6ed] shadow-sm"
            aria-hidden="true"
          >
            <Layers className="h-5 w-5 text-[#eae6ed]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#226192]">
                ArchSync
              </span>
              <span className="rounded bg-[#ef8557] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#226192]">
                AI
              </span>
            </div>
            <p className="text-xs text-[#226192]/70 hidden sm:block">Collaborative Architecture Workspace</p>
          </div>
        </Link>

        {/* Right Section: Health + Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#226192]/15 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192]/80">
            <Activity className="h-3.5 w-3.5 text-[#226192]" />
            <span className="text-[#226192]/60">API:</span>
            {isHealthLoading ? (
              <span className="text-[#ef8557]">Connecting...</span>
            ) : isHealthError ? (
              <span className="text-[#ef8557] flex items-center gap-1">Offline</span>
            ) : (
              <span className="text-[#226192] flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                {healthResponse?.data?.status ?? 'Online'}
              </span>
            )}
          </div>

          {/* Authentication Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/projects"
                id="header-projects-link"
                className="flex items-center gap-1.5 rounded-lg border border-[#226192]/15 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] hover:border-[#226192]/30 hover:bg-[#226192]/5 transition-colors"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-[#ef8557]" />
                <span>Projects</span>
              </Link>

              <Link
                to="/invitations"
                id="header-invitations-link"
                className="relative flex items-center gap-1.5 rounded-lg border border-[#226192]/15 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] hover:border-[#226192]/30 hover:bg-[#226192]/5 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#ef8557]" />
                <span>Invites</span>
                {pendingInvitationsCount > 0 && (
                  <span className="ml-1 rounded-full bg-[#ef8557] px-1.5 py-0.2 text-[10px] font-bold text-[#226192]">
                    {pendingInvitationsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                id="header-dashboard-link"
                className="flex items-center gap-2 rounded-lg border border-[#226192]/15 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] hover:border-[#226192]/30 hover:bg-[#226192]/5 transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#226192] text-[#eae6ed] font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium hidden md:inline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                title="Sign Out"
                className="flex items-center gap-1.5 rounded-lg border border-[#226192]/15 bg-[#eae6ed] px-2.5 py-1.5 text-xs text-[#226192]/70 hover:border-[#ef8557]/40 hover:bg-[#ef8557]/15 hover:text-[#ef8557] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="header-login-link"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#226192] transition-colors hover:text-[#ef8557]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="header-register-link"
                className="rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 px-3.5 py-1.5 text-xs font-semibold text-[#226192] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8557]"
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
