import React from 'react';
import { Layers, MousePointerClick } from 'lucide-react';

interface ArchitectureEmptyStateProps {
  isEditable: boolean;
}

export const ArchitectureEmptyState: React.FC<ArchitectureEmptyStateProps> = ({
  isEditable,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="max-w-md rounded-3xl border border-dashed border-slate-800 bg-slate-950/70 p-8 text-center backdrop-blur-md shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Start Designing Your Architecture
        </h3>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          {isEditable
            ? 'Drag any component from the Component Palette on the left and drop it anywhere on this canvas to begin modeling services, databases, and message streams.'
            : 'This architecture project currently has no components. Viewers can inspect diagrams once the owner or editor creates them.'}
        </p>

        {isEditable && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-cyan-300">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>Drag & Drop Enabled</span>
          </div>
        )}
      </div>
    </div>
  );
};
