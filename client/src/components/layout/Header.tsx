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
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md"
      aria-label="ArchSync AI application header"
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          aria-label="ArchSync AI — go to home page"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
            aria-hidden="true"
          >
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">ArchSync</span>
              <span className="rounded bg-gradient-to-r from-cyan-400 to-blue-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Collaborative Architecture Workspace</p>
          </div>
        </Link>

        {/* Right Section: Health + Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">API:</span>
            {isHealthLoading ? (
              <span className="text-amber-400">Connecting...</span>
            ) : isHealthError ? (
              <span className="text-rose-400 flex items-center gap-1">
                Offline
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
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
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Projects</span>
              </Link>

              <Link
                to="/invitations"
                id="header-invitations-link"
                className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 text-cyan-400" />
                <span>Invites</span>
                {pendingInvitationsCount > 0 && (
                  <span className="ml-1 rounded-full bg-cyan-500 px-1.5 py-0.2 text-[10px] font-bold text-slate-950">
                    {pendingInvitationsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/dashboard"
                id="header-dashboard-link"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-700 hover:text-white"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium hidden md:inline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                title="Sign Out"
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
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
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="header-register-link"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500"
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
