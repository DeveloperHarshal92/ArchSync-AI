import React, { useState } from 'react';
import {
  NODE_CATALOG,
  ArchitectureNodeType,
} from '@archsync/shared';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import { Search, GripVertical, ShieldAlert, Layers } from 'lucide-react';

interface ComponentPaletteProps {
  isEditable: boolean;
  onSelectComponent?: (type: ArchitectureNodeType) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  isEditable,
  onSelectComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const catalogItems = Object.values(NODE_CATALOG);

  const filteredItems = catalogItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: ArchitectureNodeType
  ) => {
    if (!isEditable) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // F14: keyboard activation — Enter/Space triggers onSelectComponent
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    nodeType: ArchitectureNodeType
  ) => {
    if (!isEditable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectComponent?.(nodeType);
    }
  };

  return (
    <aside
      className="flex h-full w-full flex-col border-r border-slate-800 bg-slate-950/70 backdrop-blur-md"
      aria-label="Component palette"
    >
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="h-4 w-4" aria-hidden="true" />
          <span>Components</span>
        </div>
        <h3 className="mt-1 text-sm font-bold text-white">Component Palette</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {isEditable
            ? 'Drag any component onto the canvas to construct your architecture.'
            : 'Viewer mode: Component creation is disabled.'}
        </p>

        {/* Read-Only Notice for Viewers */}
        {!isEditable && (
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Read-Only mode. Viewers cannot add nodes.</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-3">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500"
            aria-hidden="true"
          >
            <Search className="h-3.5 w-3.5" />
          </div>
          <label htmlFor="palette-search" className="sr-only">
            Search components
          </label>
          <input
            id="palette-search"
            type="search"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search components"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Palette Item List */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        role="list"
        aria-label={`${filteredItems.length} component${filteredItems.length !== 1 ? 's' : ''} available`}
      >
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500" role="status">
            No components matched &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredItems.map((item) => {
            const visual = getNodeVisual(item.type);
            const Icon = visual.icon;

            return (
              <div
                key={item.type}
                role="listitem"
                draggable={isEditable}
                onDragStart={(e) => handleDragStart(e, item.type)}
                onKeyDown={(e) => handleKeyDown(e, item.type)}
                tabIndex={isEditable ? 0 : -1}
                aria-label={`${item.label} — ${item.category}. ${item.description}`}
                aria-disabled={!isEditable}
                className={`group flex items-start gap-3 rounded-xl border p-2.5 transition-all select-none ${
                  isEditable
                    ? 'cursor-grab border-slate-800/80 bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-900/80 hover:shadow-md hover:shadow-cyan-500/5 active:cursor-grabbing focus:border-cyan-500/60 focus:bg-slate-900/80'
                    : 'cursor-not-allowed opacity-60 border-slate-800/40 bg-slate-950'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {item.label}
                    </span>
                    <span
                      className="text-[9px] font-medium text-slate-500 uppercase tracking-wider shrink-0"
                      aria-hidden="true"
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {isEditable && (
                  <div
                    className="text-slate-600 group-hover:text-slate-400 transition-colors mt-2"
                    aria-hidden="true"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
