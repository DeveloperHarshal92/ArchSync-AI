import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Mail,
  Calendar,
  LogOut,
  FolderGit2,
  ArrowRight,
} from 'lucide-react';
import { useGetProjectsQuery, useGetInvitationsQuery } from '../store/api/projectApi';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: projectRes } = useGetProjectsQuery();
  const { data: invitationsRes } = useGetInvitationsQuery();

  const projectCount = projectRes && projectRes.success ? projectRes.data.projects.length : 0;
  const pendingCount =
    invitationsRes && invitationsRes.success
      ? invitationsRes.data.invitations.filter((i) => i.status === 'PENDING').length
      : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 text-white font-bold text-2xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome, {user?.name ?? 'Architect'}
                </h1>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                  {user?.role ?? 'USER'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/projects"
              id="dashboard-projects-btn"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <FolderGit2 className="h-4 w-4" />
              <span>My Projects ({projectCount})</span>
            </Link>

            <Link
              to="/invitations"
              id="dashboard-invitations-btn"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-all"
            >
              <Mail className="h-4 w-4 text-cyan-400" />
              <span>Invitations</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-cyan-500 px-1.5 py-0.2 text-xs font-bold text-slate-950">
                  {pendingCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              id="dashboard-logout-btn"
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Architecture Status Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Projects Overview Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">Architecture Projects</h3>
              </div>
              <span className="font-mono text-xl font-bold text-cyan-400">{projectCount}</span>
            </div>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              F04 Project Management is active. Manage system diagrams, edit descriptions, and prepare for collaborative canvas editing.
            </p>
          </div>
          <Link
            to="/projects"
            className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs font-semibold text-cyan-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
          >
            <span>Open Projects Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Safe Profile Details</h3>
          </div>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <dt className="text-slate-400">User ID</dt>
              <dd className="font-mono text-slate-200 truncate max-w-[160px]">{user?.id}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <dt className="text-slate-400">Full Name</dt>
              <dd className="text-slate-200">{user?.name}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <dt className="text-slate-400">Role</dt>
              <dd className="text-cyan-400 font-semibold">{user?.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Member Since</dt>
              <dd className="text-slate-300 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Security Boundary Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Authorization Boundary</h3>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Owner Isolation Enforced</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>HTTP-Only Cookie Authenticated</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Strict Zod Contract Validation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>403 Forbidden on Unauthorized Access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
