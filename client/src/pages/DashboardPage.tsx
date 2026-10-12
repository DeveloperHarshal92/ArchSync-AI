import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  FolderGit2,
  ArrowRight,
  Plus,
  Users,
  Sparkles,
} from 'lucide-react';
import { useGetProjectsQuery, useGetInvitationsQuery } from '../store/api/projectApi';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { data: projectRes } = useGetProjectsQuery();
  const { data: invitationsRes } = useGetInvitationsQuery();

  const projects = projectRes && projectRes.success ? projectRes.data.projects : [];
  const projectCount = projects.length;
  const pendingCount =
    invitationsRes && invitationsRes.success
      ? invitationsRes.data.invitations.filter((i) => i.status === 'PENDING').length
      : 0;

  const latestProject = projects.length > 0 ? projects[0] : null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      {/* 1. Cinematic Architectural Header Banner (Matching reference image 4) */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1 text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>PROJECTS & SYSTEMS</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[var(--color-text)] leading-[1.12]">
              Welcome back, {user?.name?.split(' ')[0] || 'Architect'} <br />
              <span className="italic text-[var(--color-accent)]">Your systems, in progress.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-light max-w-lg leading-relaxed">
              Design, visualize, and evolve complex architectures with your team, powered by continuous graph validation and AI insights.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                id="dashboard-projects-btn"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all shadow-md shadow-[var(--color-accent)]/20"
              >
                <span>Create or Manage Projects ({projectCount})</span>
              </Link>

              <Link
                to="/invitations"
                id="dashboard-invitations-btn"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors shadow-sm"
              >
                <Mail className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span>Invitations</span>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-[var(--color-accent)] px-1.5 py-0.2 text-[10px] font-bold text-[#FFFFFF] dark:text-[#090907]">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Right Architectural Monument Artwork Panel */}
          <div className="hidden lg:block lg:col-span-5 relative h-full min-h-[260px] overflow-hidden">
            <img
              src={resolvedTheme === 'light' ? '/assets/arch_monument_lake_light.jpg' : '/assets/arch_monument_lake.jpg'}
              alt="Architectural structure representing systems in progress"
              className="absolute inset-0 h-full w-full object-cover filter contrast-[1.03] transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/30 to-transparent" />
            <div className="absolute bottom-6 right-6 z-10 text-right">
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase block font-semibold">
                IDEAS - STRUCTURES - SYSTEMS
              </span>
              <span className="text-xs text-[var(--color-text)] font-medium block">
                Real-Time Cloud Modeling
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Featured Recent Project Showcase */}
      {latestProject && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-border)] gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[var(--color-accent)] uppercase font-semibold">
                RECENT PROJECT
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="font-serif text-2xl font-semibold text-[var(--color-text)]">
                  {latestProject.name}
                </h2>
                <span className="rounded-full bg-status-success/15 border border-status-success/30 px-2.5 py-0.5 text-[10px] font-mono text-status-success font-medium">
                  {latestProject.access?.role || 'EDITOR'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xl">
                {latestProject.description || 'Distributed cloud architecture diagram.'}
              </p>
            </div>

            <Link
              to={`/projects/${latestProject.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all self-start sm:self-auto shrink-0 shadow-md shadow-[var(--color-accent)]/20"
            >
              <span>Open Studio Canvas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Diagram Preview Canvas Box */}
          <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas-bg)] p-6 relative overflow-hidden flex items-center justify-center min-h-[200px]">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(var(--color-canvas-dot) 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text)] shadow-sm">
                <span className="text-[var(--color-technical)] block text-[10px] font-semibold">INGRESS</span>
                <span>Load Balancer</span>
              </div>
              <span className="text-[var(--color-accent)]">→</span>
              <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text)] shadow-sm ring-1 ring-[var(--color-accent)]/30">
                <span className="text-[var(--color-accent)] block text-[10px] font-semibold">CORE</span>
                <span>Service Mesh</span>
              </div>
              <span className="text-[var(--color-accent)]">→</span>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[var(--color-text)] shadow-sm">
                <span className="text-[var(--color-accent)] block text-[10px] font-semibold">DATABASE</span>
                <span>Replica Cluster</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quick Navigation & Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workspace Quick Link */}
        <Link
          to="/projects"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-accent)] transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-accent)] transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[var(--color-text)] mt-4">All Projects</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Access, duplicate, or delete all owned and shared system diagrams.
          </p>
        </Link>

        {/* Invitations Quick Link */}
        <Link
          to="/invitations"
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-accent)] transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-accent)] transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[var(--color-text)] mt-4">Team Invitations</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Review collaborator invitations and accept access to new workspaces.
          </p>
        </Link>

        {/* User Identity Profile Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <button
              onClick={handleLogout}
              id="dashboard-logout-btn"
              className="text-xs font-mono text-status-danger hover:underline"
            >
              Sign out
            </button>
          </div>
          <h3 className="font-serif text-lg font-semibold text-[var(--color-text)] mt-4">{user?.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};
