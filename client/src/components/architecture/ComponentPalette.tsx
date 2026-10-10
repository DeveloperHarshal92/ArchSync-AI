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

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return NODE_CATALOG;

    return Object.entries(NODE_CATALOG).reduce(
      (acc, [type, meta]) => {
        const matchesLabel = meta.label.toLowerCase().includes(q);
        const matchesDesc = meta.description.toLowerCase().includes(q);
        const matchesType = type.toLowerCase().includes(q);
        const matchesCategory = (meta.category || '').toLowerCase().includes(q);

        if (matchesLabel || matchesDesc || matchesType || matchesCategory) {
          acc[type as ArchitectureNodeType] = meta;
        }
        return acc;
      },
      {} as typeof NODE_CATALOG
    );
  }, [searchQuery]);

  const categorizedItems = useMemo(() => {
    return PALETTE_CATEGORIES.map((cat) => {
      const items = cat.types
        .filter((type) => Boolean(filteredCatalog[type]))
        .map((type) => ({
          ...filteredCatalog[type],
        }));

      return {
        ...cat,
        items,
      };
    });
  }, [filteredCatalog]);

  const totalMatchingItems = useMemo(() => {
    return Object.keys(filteredCatalog).length;
  }, [filteredCatalog]);

  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-[#226192]/15 bg-[#eae6ed] text-[#226192] select-none backdrop-blur-md ${className}`}
      aria-label="Component palette"
    >
      {/* 1. Header & Search Bar */}
      <div className="border-b border-[#226192]/15 p-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#226192] font-mono text-[11px] font-semibold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5 text-[#ef8557]" aria-hidden="true" />
            <span>Node Catalog</span>
          </div>
          <span className="rounded bg-[#226192]/5 border border-[#226192]/15 px-2 py-0.5 text-[10px] font-mono text-[#226192]/70">
            {totalMatchingItems} items
          </span>
        </div>

        {/* Read-Only Notice for Viewers */}
        {!isEditable && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-[#ef8557]/40 bg-[#ef8557]/15 p-2 text-[11px] text-[#ef8557]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Viewer mode: Node placement disabled.</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-2.5">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#226192]/60"
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
            className="w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] py-1.5 pl-8 pr-7 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#226192]/60 hover:text-[#226192]"
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
          <div className="py-8 px-4 text-center text-xs text-[#226192]/70" role="status">
            No components matching &quot;{searchQuery}&quot;
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 block mx-auto text-[11px] text-[#ef8557] hover:underline font-mono"
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
                className="rounded-md border border-[#226192]/15 bg-[#226192]/[0.03] overflow-hidden transition-colors"
              >
                {/* Accordion Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`category-panel-${category.id}`}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs font-medium text-[#226192] hover:bg-[#226192]/5 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#226192]/70 transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{category.name}</span>
                  </span>
                  <span className="rounded bg-[#226192]/10 border border-[#226192]/15 px-1.5 py-0.2 text-[10px] font-mono text-[#226192]/70">
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
                          className={`group flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-xs transition-all select-none ${
                            isEditable
                              ? 'cursor-grab border-[#226192]/20 bg-[#eae6ed] hover:border-[#226192]/40 hover:bg-[#226192]/[0.04] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]'
                              : 'cursor-not-allowed opacity-60 border-[#226192]/10 bg-[#eae6ed]'
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
                              <span className="font-medium text-[#226192] group-hover:text-[#ef8557] transition-colors truncate block text-[11px]">
                                {item.label}
                              </span>
                            </div>
                          </div>

                          {isEditable && (
                            <div
                              className="text-[#226192]/40 group-hover:text-[#226192]/80 transition-colors shrink-0"
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
      <div className="border-t border-[#226192]/15 px-3 py-2 text-[10px] font-mono text-[#226192]/60 bg-[#eae6ed] shrink-0">
        <span className="block truncate">
          {isEditable
            ? 'Tip: Drag or press Enter to add node.'
            : 'Read-only canvas mode.'}
        </span>
      </div>
    </aside>
  );
};
