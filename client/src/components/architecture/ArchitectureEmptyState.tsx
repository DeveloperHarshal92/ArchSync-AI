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
      <div className="max-w-md rounded-3xl border border-dashed border-[#226192]/20 bg-[#eae6ed]/90 p-8 text-center backdrop-blur-md shadow-xl text-[#226192]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#226192]/5 text-[#ef8557] border border-[#ef8557]/40 mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#226192] tracking-tight">
          Start Designing Your Architecture
        </h3>
        <p className="mt-2 text-xs text-[#226192]/70 leading-relaxed">
          {isEditable
            ? 'Drag any component from the Component Palette on the left and drop it anywhere on this canvas to begin modeling services, databases, and message streams.'
            : 'This architecture project currently has no components. Viewers can inspect diagrams once the owner or editor creates them.'}
        </p>

        {isEditable && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-[11px] font-semibold text-[#ef8557]">
            <MousePointerClick className="h-3.5 w-3.5 text-[#ef8557]" />
            <span>Drag & Drop Enabled</span>
          </div>
        )}
      </div>
    </div>
  );
};
