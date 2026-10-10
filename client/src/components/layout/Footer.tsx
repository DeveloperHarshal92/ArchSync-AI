import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#226192]/15 bg-[#eae6ed] py-6 text-center text-xs text-[#226192]/70">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ArchSync AI. Real-Time Collaborative Architecture Workspace.</p>
        <div className="flex items-center gap-4 text-[#226192]/60">
          <span>React 18</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Vite</span>
          <span>•</span>
          <span>Redux Toolkit</span>
          <span>•</span>
          <span>Express</span>
        </div>
      </div>
    </footer>
  );
};
