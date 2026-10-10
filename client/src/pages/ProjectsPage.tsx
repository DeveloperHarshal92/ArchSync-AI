import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Layers,
  X,
  ArrowUpDown,
} from 'lucide-react';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../store/api/projectApi';
import { ProjectWithAccess } from '@archsync/shared';

type SortOption = 'updated' | 'created' | 'name';

export const ProjectsPage: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
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
        else if (editingProject) setEditingProject(null);
        else if (deletingProject) setDeletingProject(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    setProjectDescription(project.description ?? '');
    setFormError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setFormError('Project name cannot be empty');
      return;
    }

    try {
      await createProject({
        name: trimmedName,
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
        setFormError('Failed to create project. Please try again.');
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setFormError(null);

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setFormError('Project name cannot be empty');
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
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 py-8 text-[#226192]">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#226192]/15">
        <div>
          <div className="flex items-center gap-1.5 text-[#ef8557] text-xs font-semibold uppercase tracking-wider">
            <FolderGit2 className="h-4 w-4" aria-hidden="true" />
            <span>Architecture Catalog</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#226192]">
            Architecture Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#226192]/70">
            Create, inspect, and collaborate on distributed software architecture diagrams.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          id="create-project-btn"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 active:bg-[#ef8557]/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#226192] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef8557] shrink-0"
        >
          <Plus className="h-4 w-4 text-[#226192]" aria-hidden="true" />
          <span>New Project</span>
        </button>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#226192]/50"
            aria-hidden="true"
          >
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search projects"
            className="w-full rounded-xl border border-[#226192]/20 bg-[#eae6ed] py-2 pl-9 pr-8 text-xs sm:text-sm text-[#226192] placeholder-[#226192]/40 transition-colors focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#226192]/60 hover:text-[#226192]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#226192]/70">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#226192]/60" aria-hidden="true" />
            <label htmlFor="project-sort-select" className="sr-only">
              Sort projects
            </label>
            <select
              id="project-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1.5 text-xs text-[#226192] focus:border-[#ef8557] focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          <span className="font-mono text-[#226192]/60">
            {filteredProjects.length} of {projects.length}
          </span>
        </div>
      </div>

      {/* 3. Content Area */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border border-[#226192]/15 bg-[#226192]/5 p-5 animate-pulse flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#226192]/10" />
                  <div className="h-4 w-3/4 rounded bg-[#226192]/10" />
                </div>
                <div className="mt-4 h-3 w-full rounded bg-[#226192]/10" />
                <div className="mt-2 h-3 w-2/3 rounded bg-[#226192]/10" />
              </div>
              <div className="h-3 w-1/3 rounded bg-[#226192]/10" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-[#ef8557]/40 bg-[#ef8557]/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[#ef8557]" />
          <h3 className="mt-2 text-sm font-semibold text-[#226192]">Failed to load projects</h3>
          <p className="mt-1 text-xs text-[#226192]/70">
            Could not retrieve architecture projects from the server.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-[#eae6ed] border border-[#226192]/20 px-3.5 py-1.5 text-xs font-medium text-[#226192] hover:border-[#226192]"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#226192]/20 bg-[#226192]/5 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#226192]/10 text-[#226192] border border-[#226192]/20">
            <FolderGit2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-[#226192]">
            {searchQuery ? 'No matching projects found' : 'No architecture projects yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#226192]/70 leading-relaxed">
            {searchQuery
              ? `No projects matched "${searchQuery}". Check the spelling or clear the filter.`
              : 'Create your first system diagram to begin modeling services, databases, and message queues.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] hover:border-[#226192]"
            >
              Clear Filter
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] shadow-sm"
            >
              <Plus className="h-4 w-4 text-[#226192]" />
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
                className="group relative flex flex-col justify-between rounded-2xl border border-[#226192]/15 bg-[#eae6ed] hover:border-[#226192] p-5 shadow-sm transition-all duration-150"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#226192]/10 border border-[#226192]/20 text-[#226192] group-hover:bg-[#ef8557]/15 group-hover:text-[#226192] transition-colors">
                        <Layers className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-sm text-[#226192] group-hover:text-[#ef8557] transition-colors truncate block"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                        <span
                          className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold border ${
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
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(project)}
                          title="Edit project details"
                          aria-label={`Edit ${project.name}`}
                          className="rounded-lg p-1.5 text-[#226192]/60 hover:bg-[#226192]/10 hover:text-[#226192] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canManage && (
                        <button
                          onClick={() => setDeletingProject(project)}
                          title="Delete project"
                          aria-label={`Delete ${project.name}`}
                          className="rounded-lg p-1.5 text-[#226192]/60 hover:bg-[#ef8557]/20 hover:text-[#ef8557] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="mt-3.5 text-xs text-[#226192]/70 line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || 'No project description provided.'}
                  </p>
                </div>

                {/* Card Footer: Metadata from actual API */}
                <div className="mt-5 pt-3.5 border-t border-[#226192]/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#226192]/60">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    <span>{new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#ef8557] hover:underline transition-colors"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#226192]/40 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
            className="w-full max-w-md rounded-2xl border border-[#226192]/20 bg-[#eae6ed] p-6 shadow-2xl text-[#226192]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#226192]/15">
              <h2 id="create-modal-title" className="font-serif text-xl font-bold text-[#226192]">
                Create Architecture Project
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
                className="text-[#226192]/60 hover:text-[#226192]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/10 p-3 text-xs text-[#226192]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#ef8557]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="create-project-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
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
                  className="mt-1.5 w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 text-sm text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                />
              </div>

              <div>
                <label
                  htmlFor="create-project-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="create-project-description"
                  rows={3}
                  placeholder="System overview, target microservices, data persistence layers..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 text-sm text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#226192]/15">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-medium text-[#226192]/70 hover:border-[#226192] hover:text-[#226192]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] transition-colors disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#226192]" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#226192]/40 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="w-full max-w-md rounded-2xl border border-[#226192]/20 bg-[#eae6ed] p-6 shadow-2xl text-[#226192]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#226192]/15">
              <h2 id="edit-modal-title" className="font-serif text-xl font-bold text-[#226192]">
                Edit Project Details
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                aria-label="Close dialog"
                className="text-[#226192]/60 hover:text-[#226192]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ef8557]/40 bg-[#ef8557]/10 p-3 text-xs text-[#226192]">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#ef8557]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="edit-project-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
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
                  className="mt-1.5 w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 text-sm text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#226192]"
                >
                  Description
                </label>
                <textarea
                  id="edit-project-description"
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-3 py-2 text-sm text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#226192]/15">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-medium text-[#226192]/70 hover:border-[#226192] hover:text-[#226192]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#226192]" />
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

      {/* 6. Delete Confirmation Dialog */}
      {deletingProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#226192]/40 p-4 backdrop-blur-sm"
          aria-hidden="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-sm rounded-2xl border border-[#226192]/20 bg-[#eae6ed] p-6 shadow-2xl text-[#226192]"
          >
            <div className="flex items-center gap-3 text-[#ef8557] mb-3">
              <Trash2 className="h-6 w-6" aria-hidden="true" />
              <h3 id="delete-modal-title" className="font-serif text-lg font-bold text-[#226192]">
                Delete Project
              </h3>
            </div>
            <p className="text-xs text-[#226192]/70 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#226192] font-semibold">
                &quot;{deletingProject.name}&quot;
              </strong>
              ? All architecture nodes and diagram data will be lost.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={deleteCancelRef}
                type="button"
                onClick={() => setDeletingProject(null)}
                className="rounded-lg border border-[#226192]/20 bg-[#eae6ed] px-4 py-2 text-xs font-medium text-[#226192]/70 hover:border-[#226192] hover:text-[#226192]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#226192]" />
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
