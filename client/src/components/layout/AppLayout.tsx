import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#eae6ed] text-[#226192]">
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

      <Header />

      {/* tabIndex={-1} lets the skip link programmatically focus this element */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
