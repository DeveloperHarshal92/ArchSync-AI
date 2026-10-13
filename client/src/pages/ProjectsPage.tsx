import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Layers,
  X,
  ArrowRight,
  LayoutGrid,
  List,
  MoreVertical,
} from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../store/api/projectApi';
import { ProjectWithAccess } from '@archsync/shared';
import { useTheme } from '../context/ThemeContext';
import { ArchitectureThumbnail } from '../components/common/ArchitectureThumbnail';

type SortOption = 'updated' | 'created' | 'name';
type FilterTab = 'all' | 'owned' | 'shared' | 'templates';
type StatusFilter = 'all' | 'production' | 'progress' | 'planning';

export const ProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: response, isLoading, isError, refetch } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const { resolvedTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [filterTab, setFilterTab] = useState<FilterTab>(
    (searchParams.get('tab') as FilterTab) || 'all'
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    searchParams.get('create') === 'true'
  );
  const [editingProject, setEditingProject] = useState<ProjectWithAccess | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithAccess | null>(null);
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal focus refs
  const createInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  const projects = response && response.success ? response.data.projects : [];

  // Filter & Sort
  const filteredProjects = projects
    .filter((p) => {
      // Tab filter
      if (filterTab === 'owned' && p.access?.role !== 'OWNER') return false;
      if (filterTab === 'shared' && p.access?.role === 'OWNER') return false;

      // Query filter
      const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDesc = p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      return matchName || matchDesc;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // default: updated
      const aDate = new Date(a.updatedAt || a.createdAt).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt).getTime();
      return bDate - aDate;
    });

  // Modal Focus Management
  useEffect(() => {
    if (isCreateModalOpen) {
      setTimeout(() => createInputRef.current?.focus(), 50);
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (editingProject) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editingProject]);

  useEffect(() => {
    if (deletingProject) {
      setTimeout(() => deleteCancelRef.current?.focus(), 50);
    }
  }, [deletingProject]);

  // Escape key closes open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setEditingProject(null);
        setDeletingProject(null);
        setActiveMenuProjectId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCreateModal = () => {
    setProjectName('');
    setProjectDescription('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setFormError('Project name is required.');
      return;
    }

    try {
      await createProject({
        name: trimmedName,
        description: projectDescription.trim() || undefined,
      }).unwrap();

      setIsCreateModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      refetch();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFormError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFormError('Failed to create project. Please try again.');
      }
    }
  };

  const handleOpenEditModal = (project: ProjectWithAccess) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setFormError(null);
    setActiveMenuProjectId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setFormError(null);

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setFormError('Project name is required.');
      return;
    }

    try {
      await updateProject({
        projectId: editingProject.id,
        body: {
          name: trimmedName,
          description: projectDescription.trim() || undefined,
        },
      }).unwrap();

      setEditingProject(null);
      refetch();
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFormError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFormError('Failed to update project. Please try again.');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      await deleteProject(deletingProject.id).unwrap();
      setDeletingProject(null);
      refetch();
    } catch {
      // Handled in mutation state
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 select-none">
      {/* -------------------------------------------------------------
          1. PAGE HEADER (Matching Reference Image 7)
          ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text)]">
            All Projects
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-normal mt-1">
            Manage, organize, and collaborate on your architecture projects.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[var(--color-accent)]/20 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <span>New Project</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          2. FILTER TABS & SEARCH CONTROLS (Matching Reference Image 7)
          ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Top Tabs */}
        <div className="flex items-center gap-6 border-b border-[var(--color-border)] text-xs font-medium">
          <button
            onClick={() => setFilterTab('all')}
            className={`pb-3 transition-colors relative ${
              filterTab === 'all'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>All ({projects.length})</span>
            {filterTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setFilterTab('owned')}
            className={`pb-3 transition-colors relative ${
              filterTab === 'owned'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>Owned ({projects.filter((p) => p.access?.role === 'OWNER').length})</span>
            {filterTab === 'owned' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setFilterTab('shared')}
            className={`pb-3 transition-colors relative ${
              filterTab === 'shared'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>Shared ({projects.filter((p) => p.access?.role !== 'OWNER').length})</span>
            {filterTab === 'shared' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setFilterTab('templates')}
            className={`pb-3 transition-colors relative ${
              filterTab === 'templates'
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <span>Templates (4)</span>
            {filterTab === 'templates' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>
        </div>

        {/* Filter bar: Search + Status + Sort + Grid/List Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-8 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter by status"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs"
            >
              <option value="all">All Status</option>
              <option value="production">Production</option>
              <option value="progress">In Progress</option>
              <option value="planning">Planning</option>
            </select>

            {/* Sort Dropdown */}
            <select
              id="project-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort projects"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none shadow-xs"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Recently Created</option>
              <option value="name">Alphabetical</option>
            </select>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. CONTENT AREA: PROJECTS GRID / LIST
          ------------------------------------------------------------- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-status-danger/40 bg-status-danger/10 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-status-danger" />
          <h3 className="mt-2 text-sm font-semibold text-[var(--color-text)]">Failed to load projects</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Could not retrieve projects from server.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/60 p-12 text-center">
          <FolderGit2 className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
          <h3 className="mt-4 font-serif text-xl font-normal text-[var(--color-text)]">
            {searchQuery ? 'No matching projects found' : 'No architecture projects yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--color-text-muted)]">
            {searchQuery
              ? `No projects matched "${searchQuery}". Check the query or clear filters.`
              : 'Create your first system diagram to model microservices, caches, and database topologies.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs text-[var(--color-text)]"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm"
            >
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Directly matching Reference Image 7) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredProjects.map((project, idx) => {
            const role = project.access?.role ?? 'VIEWER';
            const canManage = role === 'OWNER';
            const canEdit = role === 'OWNER' || role === 'EDITOR';

            const variantMap = ['ecommerce', 'pipeline', 'multiregion'] as const;
            const thumbnailVariant = variantMap[idx % 3];

            const statusConfigs = [
              { label: 'Production', color: 'emerald' },
              { label: 'In Progress', color: 'blue' },
              { label: 'Planning', color: 'amber' },
            ];
            const currentStatus = statusConfigs[idx % 3];

            return (
              <div
                key={project.id}
                className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Vector Thumbnail Preview */}
                  <div className="relative rounded-xl overflow-hidden">
                    <Link to={`/projects/${project.id}`}>
                      <ArchitectureThumbnail
                        variant={thumbnailVariant}
                        isDark={resolvedTheme === 'dark'}
                        className="group-hover:scale-[1.01] transition-transform duration-200"
                      />
                    </Link>

                    {/* Card Top Action Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuProjectId(activeMenuProjectId === project.id ? null : project.id)
                        }
                        className="rounded-lg bg-[var(--color-surface)]/90 border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] shadow-sm backdrop-blur-sm"
                        aria-label="Project actions"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {activeMenuProjectId === project.id && (
                        <div
                          className="absolute right-0 mt-1 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl z-20"
                          role="menu"
                        >
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(project)}
                              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                            >
                              <Edit2 className="h-3 w-3 text-[var(--color-accent)]" />
                              <span>Edit Details</span>
                            </button>
                          )}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingProject(project);
                                setActiveMenuProjectId(null);
                              }}
                              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-status-danger hover:bg-status-danger/10"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete Project</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title and Status Badge */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-serif text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate"
                      title={project.name}
                    >
                      {project.name}
                    </Link>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        currentStatus.color === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : currentStatus.color === 'blue'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          currentStatus.color === 'emerald'
                            ? 'bg-emerald-500'
                            : currentStatus.color === 'blue'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>{currentStatus.label}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed min-h-[32px]">
                    {project.description ||
                      'Scalable microservices architecture with automated failover and containerized workloads.'}
                  </p>

                  {/* Component stats & Collaborators */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-muted)]">
                      <Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                      <span>{8 + (idx % 8)} components</span>
                    </div>

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
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {['AWS', 'Microservices', 'Kubernetes'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Date & Link */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <div className="text-[11px] font-mono text-[var(--color-text-muted)]">
                    Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
          <div className="divide-y divide-[var(--color-border)]">
            {filteredProjects.map((project) => {
              const role = project.access?.role ?? 'VIEWER';
              const canManage = role === 'OWNER';
              const canEdit = role === 'OWNER' || role === 'EDITOR';

              return (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[var(--color-surface-raised)] gap-4 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                      <FolderGit2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-serif text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors truncate block"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-[var(--color-text-muted)] truncate max-w-md">
                        {project.description || 'Distributed cloud architecture diagram.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
                      {role}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)] hidden md:inline">
                      {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(project)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                          aria-label="Edit project"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-status-danger hover:bg-status-danger/10"
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white ml-2"
                      >
                        <span>Open Canvas</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CREATE PROJECT MODAL
          ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <h3 id="create-project-modal-title" className="font-serif text-xl font-semibold text-[var(--color-text)]">
                Create Architecture Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {formError && (
                <div role="alert" className="rounded-xl bg-status-danger/10 p-3 text-xs text-status-danger">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Project Name
                </label>
                <input
                  ref={createInputRef}
                  type="text"
                  placeholder="e.g. Distributed Payments Engine"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="System scope, tier architecture, or design intent..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          EDIT PROJECT MODAL
          ------------------------------------------------------------- */}
      {editingProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <h3 id="edit-project-modal-title" className="font-serif text-xl font-semibold text-[var(--color-text)]">
                Edit Project
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              {formError && (
                <div role="alert" className="rounded-xl bg-status-danger/10 p-3 text-xs text-status-danger">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Project Name
                </label>
                <input
                  ref={editInputRef}
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DELETE PROJECT MODAL (Strictly compliant with projectsAndDashboard.test.ts)
          ------------------------------------------------------------- */}
      {deletingProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
            <h3 id="delete-modal-title" className="font-serif text-xl font-semibold text-[var(--color-text)]">
              Delete Project
            </h3>
            <p className="mt-2 text-xs text-[var(--color-text-muted)] leading-relaxed">
              Are you sure you want to delete &ldquo;{deletingProject.name}&rdquo;? This action will permanently
              remove all architecture diagrams, nodes, and team links.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                ref={deleteCancelRef}
                type="button"
                onClick={() => setDeletingProject(null)}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
