import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, FolderGit2 } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center text-[var(--color-text)] select-none">
      <div className="rounded-2xl bg-[#ef8557]/12 p-4 text-[var(--color-accent)] mb-5 border border-[#ef8557]/30 shadow-xs">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-text)]">
        404 — Page Not Found
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-[var(--color-text-muted)] max-w-md leading-relaxed">
        The requested architecture route or workspace does not exist. Please check the URL or return to your projects.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] px-4 py-2.5 text-xs font-semibold text-[var(--color-text)] shadow-xs transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home Page</span>
        </Link>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[var(--color-accent)]/20 active:scale-[0.98] transition-all"
        >
          <FolderGit2 className="h-4 w-4" />
          <span>View Projects</span>
        </Link>
      </div>
    </div>
  );
};
