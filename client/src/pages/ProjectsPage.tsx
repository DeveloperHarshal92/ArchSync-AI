import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Layers,
  X,
  ArrowUpDown,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../store/api/projectApi';
import { ProjectWithAccess } from '@archsync/shared';

type SortOption = 'updated' | 'created' | 'name';
type FilterTab = 'all' | 'owned' | 'shared';

export const ProjectsPage: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithAccess | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithAccess | null>(null);

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
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (editingProject) setEditingProject(null);
        if (deletingProject) setDeletingProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, editingProject, deletingProject]);

  const handleOpenCreateModal = () => {
    setProjectName('');
    setProjectDescription('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectWithAccess) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmed = projectName.trim();
    if (!trimmed) {
      setFormError('Project name cannot be empty');
      return;
    }
    try {
      await createProject({
        name: trimmed,
        description: projectDescription.trim() || undefined,
      }).unwrap();
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFormError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFormError('Failed to create project');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setFormError(null);
    const trimmed = projectName.trim();
    if (!trimmed) {
      setFormError('Project name cannot be empty');
      return;
    }
    try {
      await updateProject({
        projectId: editingProject.id,
        body: {
          name: trimmed,
          description: projectDescription.trim() || undefined,
        },
      }).unwrap();
      setEditingProject(null);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as { data?: { error?: { message?: string } } }).data?.error?.message === 'string'
      ) {
        setFormError((err as { data: { error: { message: string } } }).data.error.message);
      } else {
        setFormError('Failed to update project');
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id).unwrap();
      setDeletingProject(null);
    } catch {
      // error handled by RTK Query
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)] text-xs font-mono uppercase tracking-widest font-semibold">
            <FolderGit2 className="h-4 w-4" aria-hidden="true" />
            <span>ARCHITECTURE REPOSITORIES</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-text)]">
            All Architecture Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]">
            Create, inspect, and collaborate on distributed software architecture diagrams.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          id="create-project-btn"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FFFFFF] dark:text-[#090907] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] transition-all shadow-md shadow-[var(--color-accent)]/20 shrink-0"
        >
          <span>New Project</span>
        </button>
      </div>

      {/* 2. Filter Tabs & Search Controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] font-semibold shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilterTab('owned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'owned'
                ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] font-semibold shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Owned ({projects.filter((p) => p.access?.role === 'OWNER').length})
          </button>
          <button
            onClick={() => setFilterTab('shared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'shared'
                ? 'bg-[var(--color-accent)] text-[#FFFFFF] dark:text-[#090907] font-semibold shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            Shared ({projects.filter((p) => p.access?.role !== 'OWNER').length})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]"
              aria-hidden="true"
            >
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-8 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 transition-colors focus:border-[var(--color-accent)] focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <select
              id="project-sort-select"
              aria-label="Sort projects"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none shadow-sm"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Content Area */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--color-surface-raised)]" />
                  <div className="h-4 w-3/4 rounded bg-[var(--color-surface-raised)]" />
                </div>
                <div className="mt-4 h-3 w-full rounded bg-[var(--color-surface-raised)]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-[var(--color-surface-raised)]" />
              </div>
              <div className="h-3 w-1/3 rounded bg-[var(--color-surface-raised)]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-status-danger/40 bg-status-danger/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-status-danger" />
          <h3 className="mt-2 text-sm font-semibold text-[var(--color-text)]">Failed to load projects</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Could not retrieve architecture projects from the server.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)] shadow-sm">
            <FolderGit2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-normal text-[var(--color-text)]">
            {searchQuery ? 'No matching projects found' : 'No architecture projects yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--color-text-muted)] leading-relaxed">
            {searchQuery
              ? `No projects matched "${searchQuery}". Check the spelling or clear the filter.`
              : 'Create your first system diagram to begin modeling services, databases, and message queues.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs text-[var(--color-text)] hover:border-[var(--color-accent)] shadow-sm"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] shadow-sm"
            >
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const role = project.access?.role ?? 'VIEWER';
            const canManage = role === 'OWNER';
            const canEdit = role === 'OWNER' || role === 'EDITOR';

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-serif font-semibold text-base text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate block"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                        <span
                          className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-mono border ${
                            role === 'OWNER'
                              ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-semibold'
                              : role === 'EDITOR'
                              ? 'border-status-success/40 bg-status-success/10 text-status-success font-semibold'
                              : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                          }`}
                        >
                          {role}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(project)}
                          title="Edit project details"
                          aria-label={`Edit ${project.name}`}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={() => setDeletingProject(project)}
                          title="Delete project"
                          aria-label={`Delete ${project.name}`}
                          className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-status-danger/10 hover:text-status-danger transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="mt-3.5 text-xs text-[var(--color-text-muted)] line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || 'No project description provided.'}
                  </p>
                </div>

                {/* Card Footer: Metadata from actual API */}
                <div className="mt-5 pt-3.5 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-muted)] opacity-80">
                    <Calendar className="h-3 w-3 text-[var(--color-accent)]" aria-hidden="true" />
                    <span>{new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline transition-colors"
                  >
                    <span>Open Canvas</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Create Project Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl text-[var(--color-text)]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <h2 id="create-modal-title" className="font-serif text-xl font-semibold text-[var(--color-text)]">
                Create Architecture Project
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-danger/40 bg-status-danger/10 p-3 text-xs text-status-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="create-project-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]"
                >
                  Project Name *
                </label>
                <input
                  id="create-project-name"
                  ref={createInputRef}
                  type="text"
                  required
                  placeholder="e.g. Distributed Event Pipeline"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="create-project-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="create-project-description"
                  rows={3}
                  placeholder="System overview, target microservices, data persistence layers..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Project Modal */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl text-[var(--color-text)]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <h2 id="edit-modal-title" className="font-serif text-xl font-semibold text-[var(--color-text)]">
                Edit Project Details
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                aria-label="Close dialog"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-danger/40 bg-status-danger/10 p-3 text-xs text-status-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-project-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]"
                >
                  Project Name *
                </label>
                <input
                  id="edit-project-name"
                  ref={editInputRef}
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="edit-project-description"
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2 text-xs font-semibold text-[#FFFFFF] dark:text-[#090907] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deletingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-md rounded-2xl border border-status-danger/40 bg-[var(--color-surface)] p-6 shadow-2xl text-[var(--color-text)]"
          >
            <div className="flex items-center gap-3 text-status-danger pb-3 border-b border-[var(--color-border)]">
              <Trash2 className="h-5 w-5" />
              <h2 id="delete-modal-title" className="font-serif text-lg font-semibold text-[var(--color-text)]">
                Delete Architecture Project
              </h2>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[var(--color-text)] font-semibold">{deletingProject.name}</strong>? All nodes,
              connections, and real-time collaboration history will be lost.
            </p>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                ref={deleteCancelRef}
                type="button"
                onClick={() => setDeletingProject(null)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-status-danger hover:bg-status-danger/90 px-5 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors disabled:opacity-50 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Project</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
