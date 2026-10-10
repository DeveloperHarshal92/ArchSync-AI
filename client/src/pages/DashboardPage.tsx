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
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 space-y-8 text-[#226192]">
      {/* 1. Welcome Header Banner */}
      <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#226192]/10 border border-[#226192]/20 text-[#226192] font-bold text-2xl shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#226192]">
                  Welcome back, {user?.name ?? 'Architect'}
                </h1>
                <span className="rounded-full bg-[#ef8557]/15 border border-[#ef8557]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#226192]">
                  {user?.role ?? 'USER'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#226192]/70 flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-[#226192]/50" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/projects"
              id="dashboard-projects-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8557]"
            >
              <FolderGit2 className="h-3.5 w-3.5 text-[#226192]" />
              <span>Projects ({projectCount})</span>
            </Link>

            <Link
              to="/invitations"
              id="dashboard-invitations-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-3.5 py-2 text-xs font-semibold text-[#226192] hover:border-[#226192] hover:bg-[#226192]/5 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#ef8557]" />
              <span>Invitations</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-[#ef8557] px-1.5 py-0.2 text-[10px] font-bold text-[#226192]">
                  {pendingCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              id="dashboard-logout-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 text-xs font-medium text-[#226192]/70 hover:border-[#226192] hover:bg-[#226192]/5 hover:text-[#226192] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Asymmetrical Content Section: Projects Workspace Stream (8 cols) + Identity & Security Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Projects Workspace List (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#226192]/15">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#226192]">
                Active Architecture Workspaces
              </h2>
              <p className="text-xs text-[#226192]/70 mt-0.5">
                Review distributed system topologies and continue collaboration.
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#ef8557] hover:underline"
            >
              <span>View All ({projectCount})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {projectCount === 0 ? (
            <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-8 text-center">
              <FolderGit2 className="mx-auto h-10 w-10 text-[#226192]/40 mb-3" />
              <h3 className="font-serif text-lg font-semibold text-[#226192]">No Architecture Projects Yet</h3>
              <p className="mt-1 text-xs text-[#226192]/70 max-w-sm mx-auto">
                Create your first distributed system diagram to begin modeling services, message queues, and databases.
              </p>
              <Link
                to="/projects"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm transition-colors"
              >
                <span>Go to Projects Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projectRes && projectRes.success && projectRes.data.projects.slice(0, 5).map((project) => {
                const role = project.access?.role ?? 'VIEWER';
                return (
                  <div
                    key={project.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#226192]/15 bg-[#eae6ed] p-4 hover:border-[#226192] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-sm text-[#226192] hover:text-[#ef8557] transition-colors truncate"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold border ${
                            role === 'OWNER'
                              ? 'border-[#ef8557]/60 bg-[#ef8557]/15 text-[#226192]'
                              : role === 'EDITOR'
                              ? 'border-[#226192]/30 bg-[#226192]/10 text-[#226192]'
                              : 'border-[#226192]/15 bg-transparent text-[#226192]/70'
                          }`}
                        >
                          {role}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#226192]/70 line-clamp-1">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#226192]/60">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#eae6ed] border border-[#226192]/20 px-3 py-1.5 text-xs font-semibold text-[#226192] hover:border-[#226192] hover:bg-[#226192]/5 transition-colors"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Identity, Security & Invitations (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Profile Card */}
          <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-5 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#226192]/15">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#226192]/10 border border-[#226192]/20 text-[#226192]">
                <User className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#226192]">
                Architect Identity
              </h3>
            </div>
            <dl className="mt-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#226192]/10 pb-2">
                <dt className="text-[#226192]/60">User ID</dt>
                <dd className="font-mono text-[#226192]/80 truncate max-w-[150px]">{user?.id}</dd>
              </div>
              <div className="flex justify-between border-b border-[#226192]/10 pb-2">
                <dt className="text-[#226192]/60">Full Name</dt>
                <dd className="text-[#226192] font-medium">{user?.name}</dd>
              </div>
              <div className="flex justify-between border-b border-[#226192]/10 pb-2">
                <dt className="text-[#226192]/60">Account Role</dt>
                <dd className="text-[#ef8557] font-semibold">{user?.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#226192]/60">Member Since</dt>
                <dd className="text-[#226192]/80 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#226192]/50" />
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Access & Security Telemetry Card */}
          <div className="rounded-2xl border border-[#226192]/15 bg-[#eae6ed] p-5 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#226192]/15">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ef8557]/15 text-[#ef8557]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#226192]">
                Security Assurance
              </h3>
            </div>
            <ul className="mt-3.5 space-y-2 text-xs text-[#226192]/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557] shrink-0" />
                <span>Role-based access (Owner, Editor, Viewer)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557] shrink-0" />
                <span>HTTP-Only cookie session tokens</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557] shrink-0" />
                <span>Workspace data and member isolation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ef8557] shrink-0" />
                <span>Deterministic graph syntax validation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
