import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  FileText,
  Settings,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGetInvitationsQuery } from '../../store/api/projectApi';
import { ThemeToggle } from '../common/ThemeToggle';

export interface WorkspaceShellProps {
  children: React.ReactNode;
}

/**
 * WorkspaceShell — The authentic application sidebar & header layout
 * reproduced directly from Reference Images 1, 5, 6, 7, and 8.
 */
export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const { data: invitationsRes } = useGetInvitationsQuery();
  const pendingInvitationsCount =
    invitationsRes && invitationsRes.success
      ? invitationsRes.data.invitations.filter((i) => i.status === 'PENDING').length
      : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderGit2,
    },
    {
      name: 'Invitations',
      path: '/invitations',
      icon: Mail,
      badge: pendingInvitationsCount > 0 ? pendingInvitationsCount : undefined,
    },
    {
      name: 'Templates',
      path: '/projects?tab=templates',
      icon: FileText,
    },
    {
      name: 'Settings',
      path: '/dashboard#settings',
      icon: Settings,
    },
  ];

  const currentWorkspaceName = user?.name ? `${user.name.split(' ')[0]}'s Workspace` : 'Acme Workspace';

  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
      {/* -------------------------------------------------------------
          LEFT SIDEBAR (DESKTOP)
          ------------------------------------------------------------- */}
      <aside
        className="hidden lg:flex w-64 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] p-5 select-none shrink-0"
        aria-label="Workspace primary sidebar"
      >
        <div className="space-y-6">
          {/* Logo / Brand header (Matching Reference 1 & 7) */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-2 py-1 text-[var(--color-text)] transition-opacity hover:opacity-90"
            aria-label="ArchSync AI Dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef8557] to-[#e07444] text-white shadow-md shadow-[#ef8557]/25">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 22h4.5l5.5-11 5.5 11H22L12 2zm0 6l3.5 7h-7L12 8z" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--color-text)]">
                ArchSync <span className="text-[var(--color-accent)] font-sans text-lg font-semibold">AI</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path.split('?')[0]);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#ef8557]/12 text-[var(--color-accent)] font-semibold shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-accent)]' : 'opacity-70'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom "Upgrade to Pro" Card (Matching Reference 1 & 7) */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-semibold text-[var(--color-text)] flex items-center gap-1.5">
                <span>Upgrade to Pro</span>
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                Unlock advanced AI analysis and team collaboration.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects?tab=pro')}
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-surface)] py-1.5 text-[11px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          >
            <span>View Plans</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MAIN APPLICATION COLUMN
          ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Top Navigation Bar (Matching Reference 1, 7, 8) */}
        <header
          className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors"
          aria-label="ArchSync AI application header"
        >
          {/* Left: Mobile trigger & Workspace selector dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]"
              aria-label="Toggle navigation drawer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Workspace Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors shadow-xs"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--color-surface-raised)] text-[var(--color-accent)]">
                  <Layers className="h-3 w-3" />
                </div>
                <span>{currentWorkspaceName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              </button>

              {isWorkspaceMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                    Workspaces
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                  >
                    <span>{currentWorkspaceName}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      navigate('/projects');
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
                  >
                    <span>+ Create Workspace</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Bar with ⌘K (Matching Reference 1, 7, 8) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <input
                type="search"
                placeholder="Search projects, components, or collaborators..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1.5 pl-9 pr-12 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors shadow-xs"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right Controls: Notifications, Collaborators, User Profile & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => navigate('/invitations')}
              aria-label="View notifications and invitations"
              className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors shadow-xs"
            >
              <Bell className="h-4 w-4" />
              {pendingInvitationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-surface)]" />
              )}
            </button>

            {/* Collaborator Avatars Pile (Matching Reference 1) */}
            <div className="hidden sm:flex items-center -space-x-2">
              <div
                className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                title="Priya Sharma"
              >
                PS
              </div>
              <div
                className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                title="Aditya Mehta"
              >
                AM
              </div>
              <div
                className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                title="Arjun Kapoor"
              >
                AK
              </div>
              <div className="h-7 w-7 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] flex items-center justify-center text-[9px] font-mono font-semibold shadow-xs">
                +2
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle variant="compact" />

            {/* User Profile Badge (Matching Reference 1) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 sm:px-2.5 sm:py-1.5 hover:border-[var(--color-accent)] transition-colors shadow-xs"
                aria-label="User account menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-blue)] text-white text-xs font-bold shadow-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-semibold text-[var(--color-text)] truncate max-w-[90px]">
                    {user?.name?.split(' ')[0] || 'Architect'}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)]">Owner</div>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <div className="px-2.5 py-1.5 border-b border-[var(--color-border)] mb-1">
                    <p className="text-xs font-semibold text-[var(--color-text)] truncate">{user?.name || 'Architect'}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/projects"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                  >
                    <FolderGit2 className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    <span>My Projects</span>
                  </Link>
                  <Link
                    to="/invitations"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    <span>Invitations</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-status-danger hover:bg-status-danger/10 transition-colors mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[var(--color-accent)]" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Dynamic Page Content */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
};
