import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ArchSync AI. Real-Time Collaborative Architecture Workspace.</p>
        <div className="flex items-center gap-4 text-slate-400">
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
