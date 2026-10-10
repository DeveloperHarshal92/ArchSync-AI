import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/**
 * StudioLayout — Dedicated full-viewport layout for ArchSync AI Architecture Studio.
 *
 * Implements Phase 2A.2:
 * - 100dvh viewport locking without document-level body scrollbars.
 * - Suppresses the global marketing Footer to maximize diagram real estate.
 * - Preserves accessibility landmarks (skip-link, live announcer, header, main).
 * - Allows the studio workspace to manage its internal layout and scrolling.
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

      {/* Studio Header (retained until Phase 2B integrates the unified Studio Top Bar) */}
      <Header />

      {/* tabIndex={-1} lets the skip link programmatically focus this element */}
      <main
        id="main-content"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  );
};
