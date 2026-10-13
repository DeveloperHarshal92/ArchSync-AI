import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  ArrowRight,
  Plus,
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useGetProjectsQuery, useGetInvitationsQuery } from '../store/api/projectApi';
import { useTheme } from '../context/ThemeContext';
import { ArchitectureThumbnail } from '../components/common/ArchitectureThumbnail';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { data: projectRes } = useGetProjectsQuery();
  const { data: invitationsRes } = useGetInvitationsQuery();

  const projects = projectRes && projectRes.success ? projectRes.data.projects : [];
  const projectCount = projects.length;
  const sharedCount = projects.filter((p) => p.access?.role !== 'OWNER').length;
  const pendingCount =
    invitationsRes && invitationsRes.success
      ? invitationsRes.data.invitations.filter((i) => i.status === 'PENDING').length
      : 0;

  const recentProjects = projects.slice(0, 3);

  const projectOverviewDescription =
    'Access your distributed system diagrams, inspect microservice topologies, and collaborate with your engineering team.';

  const securityList = [
    'Role-based access (Owner, Editor, Viewer)',
    'HTTP-Only cookie session tokens',
    'Project workspace data isolation',
    '403 Forbidden on unauthorized operations',
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 select-none">
      {/* -------------------------------------------------------------
          1. HERO GREETING BANNER (Directly matching Reference Image 1)
          ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[200px]">
          {/* Left Greeting Text */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-2 z-10">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)] leading-[1.12]">
              Welcome back,{' '}
              <span className="text-[var(--color-accent)] italic font-medium">
                {user?.name?.split(' ')[0] || 'Rohan'}.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal max-w-lg leading-relaxed pt-1">
              Design, collaborate, and ship better architectures.
            </p>
          </div>

          {/* Right Architectural Monument Graphic & New Project CTA */}
          <div className="lg:col-span-5 relative h-full min-h-[160px] lg:min-h-[220px] flex items-center justify-end p-6 lg:p-10 overflow-hidden">
            <img
              src={
                resolvedTheme === 'light'
                  ? '/assets/images/arch_monument_lake_light.jpg'
                  : '/assets/images/arch_monument_lake.jpg'
              }
              alt="Architectural pavilion reflecting in lake"
              className="absolute inset-0 h-full w-full object-cover filter contrast-[1.02] opacity-80"
            />
            {/* Soft gradient blend into card surface */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/70 to-transparent" />

            <div className="relative z-10">
              <Link
                to="/projects?create=true"
                id="dashboard-projects-btn"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 active:scale-[0.98] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. METRIC SUMMARY CARDS (Directly matching Reference Image 1)
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Projects */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ef8557]/12 text-[var(--color-accent)]">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-serif text-3xl font-semibold text-[var(--color-text)] leading-none">
                {projectCount}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Projects</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ↑ 2 this month
              </div>
            </div>
          </div>

          {/* Sparkline mini-bar visualization */}
          <div className="flex items-end gap-1 h-10 pr-2">
            {[40, 60, 35, 75, 50, 90, 100].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-[#ef8557]"
                style={{ height: `${h}%`, opacity: 0.3 + (i / 7) * 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Shared with you */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="font-serif text-3xl font-semibold text-[var(--color-text)] leading-none">
                {sharedCount}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Shared with you</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ↑ 1 this month
              </div>
            </div>
          </div>

          {/* Sparkline mini-bar visualization */}
          <div className="flex items-end gap-1 h-10 pr-2">
            {[30, 45, 60, 40, 70, 85, 95].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-blue-500"
                style={{ height: `${h}%`, opacity: 0.3 + (i / 7) * 0.7 }}
              />
            ))}
          </div>
        </div>

        {/* Card 3: Templates */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/12 text-purple-600 dark:text-purple-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-serif text-3xl font-semibold text-[var(--color-text)] leading-none">8</div>
              <div className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Templates</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ↑ 3 this month
              </div>
            </div>
          </div>

          {/* Sparkline mini-bar visualization */}
          <div className="flex items-end gap-1 h-10 pr-2">
            {[50, 30, 70, 45, 80, 65, 100].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-purple-500"
                style={{ height: `${h}%`, opacity: 0.3 + (i / 7) * 0.7 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. RECENT PROJECTS SECTION (Directly matching Reference Image 1)
          ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-text)]">Recent Projects</h2>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/60 p-12 text-center">
            <FolderGit2 className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
            <h3 className="mt-3 font-serif text-lg font-medium text-[var(--color-text)]">No projects created yet</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
              {projectOverviewDescription}
            </p>
            <Link
              to="/projects?create=true"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Architecture</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project, idx) => {
              const variantMap = ['ecommerce', 'pipeline', 'multiregion'] as const;
              const thumbnailVariant = variantMap[idx % 3];

              return (
                <div
                  key={project.id}
                  className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Architecture diagram thumbnail */}
                    <Link to={`/projects/${project.id}`} className="block overflow-hidden rounded-xl">
                      <ArchitectureThumbnail
                        variant={thumbnailVariant}
                        isDark={resolvedTheme === 'dark'}
                        className="group-hover:scale-[1.01] transition-transform duration-200"
                      />
                    </Link>

                    {/* Title and status pill */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-serif text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate"
                      >
                        {project.name}
                      </Link>
                      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed min-h-[32px]">
                      {project.description ||
                        'A scalable microservices architecture with multi-region deployment and real-time analytics.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {['Microservices', 'AWS', 'PostgreSQL'].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
                        +2
                      </span>
                    </div>
                  </div>

                  {/* Footer: Collaborators & Update Timestamp */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                    <div className="flex items-center -space-x-1.5">
                      <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-[var(--color-surface)]">
                        PS
                      </div>
                      <div className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-[var(--color-surface)]">
                        AM
                      </div>
                      <div className="h-5 w-5 rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] flex items-center justify-center text-[8px] font-mono font-bold ring-1 ring-[var(--color-surface)]">
                        +3
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          4. WORKSPACE CONTROLS & SECURITY PRESENTATION
          Preserves contracts tested in projectsAndDashboard.test.ts
          ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-blue)]/12 text-[var(--color-blue)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">Security & Isolation</h3>
              <p className="text-xs text-[var(--color-text-muted)]">{projectOverviewDescription}</p>
            </div>
          </div>

          <Link
            to="/invitations"
            id="dashboard-invitations-btn"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors self-start sm:self-auto"
          >
            <span>Team Invitations ({pendingCount})</span>
            <ArrowRight className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-xs text-[var(--color-text-secondary)] font-medium"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
