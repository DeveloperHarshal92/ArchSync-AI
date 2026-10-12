import React from 'react';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8 text-xs text-[var(--color-text-muted)] transition-colors">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--color-text)]">
          <Layers className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="font-serif text-sm font-semibold">ArchSync AI</span>
          <span className="text-[var(--color-text-muted)] opacity-70">— Design the systems behind what comes next.</span>
        </div>
        <p className="text-[var(--color-text-muted)] opacity-70">© 2026 ArchSync AI. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[var(--color-text-muted)] opacity-70">
          <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-[var(--color-accent)] transition-colors">Security</a>
        </div>
      </div>
    </footer>
  );
};
