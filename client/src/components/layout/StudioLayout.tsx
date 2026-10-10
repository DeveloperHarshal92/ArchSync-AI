import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * StudioLayout — Dedicated full-viewport layout for ArchSync AI Architecture Studio.
 *
 * Implements Phase 2B:
 * - 100dvh viewport locking without document-level body scrollbars.
 * - Suppresses global marketing Header and Footer to maximize architecture diagram real estate.
 * - The Unified Studio Top Bar is rendered inside the studio workspace.
 * - Preserves accessibility landmarks (skip-link, live announcer, main container).
 */
export const StudioLayout: React.FC = () => {
  return (
    <div className="flex h-screen h-[100dvh] max-h-screen max-h-[100dvh] w-full overflow-hidden flex-col bg-slate-950 text-slate-100">
      {/* F14: Skip navigation link (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* F14: ARIA live region for screen-reader announcements */}
      <div
        id="a11y-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* tabIndex={-1} lets the skip link programmatically focus this element */}
      <main
        id="main-content"
        className="flex-1 h-full min-h-0 w-full overflow-hidden flex flex-col"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  );
};
