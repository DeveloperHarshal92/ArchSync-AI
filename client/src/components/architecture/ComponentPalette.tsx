import React, { useState, useMemo } from 'react';
import {
  NODE_CATALOG,
  ArchitectureNodeType,
} from '@archsync/shared';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import {
  Search,
  GripVertical,
  ShieldAlert,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';

export interface ComponentPaletteProps {
  isEditable: boolean;
  onSelectComponent?: (type: ArchitectureNodeType) => void;
  className?: string;
}

export interface PaletteCategory {
  id: string;
  name: string;
  types: ArchitectureNodeType[];
}

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'compute',
    name: 'Compute',
    types: ['server', 'microservice'],
  },
  {
    id: 'storage',
    name: 'Storage',
    types: ['database', 'cache'],
  },
  {
    id: 'networking',
    name: 'Networking',
    types: ['api-gateway'],
  },
  {
    id: 'messaging',
    name: 'Messaging',
    types: ['queue'],
  },
  {
    id: 'integration',
    name: 'Integration',
    types: ['external-api'],
  },
  {
    id: 'client-cloud',
    name: 'Client & Cloud',
    types: ['client', 'web-app', 'mobile-app', 'cloud-service'],
  },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  isEditable,
  onSelectComponent,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isCategoryExpanded = (categoryId: string) => {
    // When searching, always expand categories that have matching items
    if (searchQuery.trim().length > 0) return true;
    return !collapsedCategories[categoryId];
  };

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

  // F14: keyboard activation — Enter or Space triggers onSelectComponent
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

  // Filtered categories and their items
  const categorizedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return PALETTE_CATEGORIES.map((category) => {
      const items = category.types
        .map((type) => NODE_CATALOG[type])
        .filter(Boolean)
        .filter((item) => {
          if (!query) return true;
          return (
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
          );
        });

      return {
        ...category,
        items,
        totalCount: category.types.length,
      };
    });
  }, [searchQuery]);

  const totalMatchingItems = useMemo(() => {
    return categorizedItems.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [categorizedItems]);

  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-slate-800/80 bg-slate-950/90 text-slate-100 select-none backdrop-blur-md ${className}`}
      aria-label="Component palette"
    >
      {/* 1. Header & Search Bar */}
      <div className="border-b border-slate-800/80 p-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Node Catalog</span>
          </div>
          <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            {totalMatchingItems} items
          </span>
        </div>

        {/* Read-Only Notice for Viewers */}
        {!isEditable && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Viewer mode: Node placement disabled.</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-2.5">
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
            placeholder="Search nodes (e.g. redis, api)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search components"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categorized Accordion List */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-2.5"
        role="region"
        aria-label="Categorized component catalog"
      >
        {totalMatchingItems === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-slate-500" role="status">
            No components matching &quot;{searchQuery}&quot;
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 block mx-auto text-[11px] text-cyan-400 hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          categorizedItems.map((category) => {
            if (category.items.length === 0) return null;
            const isExpanded = isCategoryExpanded(category.id);

            return (
              <div
                key={category.id}
                className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden transition-colors"
              >
                {/* Accordion Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`category-panel-${category.id}`}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800/40 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{category.name}</span>
                  </span>
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                    {category.items.length}
                  </span>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div
                    id={`category-panel-${category.id}`}
                    role="list"
                    aria-label={`${category.name} components`}
                    className="p-1.5 pt-0.5 space-y-1"
                  >
                    {category.items.map((item) => {
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
                          aria-label={`${item.label} — ${category.name}. ${item.description}`}
                          aria-disabled={!isEditable}
                          title={
                            isEditable
                              ? `Drag onto canvas or press Enter/Space to place ${item.label}`
                              : `${item.label} (Viewer: read-only)`
                          }
                          className={`group flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition-all select-none ${
                            isEditable
                              ? 'cursor-grab border-slate-800/80 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/90 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500'
                              : 'cursor-not-allowed opacity-60 border-slate-800/40 bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
                              aria-hidden="true"
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-slate-200 group-hover:text-white transition-colors truncate block text-[11px]">
                                {item.label}
                              </span>
                            </div>
                          </div>

                          {isEditable && (
                            <div
                              className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0"
                              aria-hidden="true"
                            >
                              <GripVertical className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Footer Keyboard Hint */}
      <div className="border-t border-slate-800/80 px-3 py-2 text-[10px] text-slate-500 bg-slate-950/60 shrink-0">
        <span className="block truncate">
          {isEditable
            ? 'Tip: Drag or press Enter to add node.'
            : 'Read-only canvas mode.'}
        </span>
      </div>
    </aside>
  );
};
