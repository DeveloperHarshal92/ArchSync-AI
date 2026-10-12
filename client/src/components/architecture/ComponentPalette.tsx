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

  // Group catalog items by defined categories
  const categorizedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return PALETTE_CATEGORIES.map((cat) => {
      const items = cat.types
        .map((type) => ({
          type,
          label: NODE_CATALOG[type]?.label || type,
          description: NODE_CATALOG[type]?.description || '',
        }))
        .filter((item) => {
          if (!query) return true;
          return (
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
          );
        });

      return {
        ...cat,
        items,
      };
    });
  }, [searchQuery]);

  const totalMatchingItems = categorizedItems.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <aside
      className={`flex h-full w-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors select-none ${className}`}
      aria-label="Component library"
      id="component-palette"
    >
      {/* 1. Header with Catalog Title & Search */}
      <div className="border-b border-[var(--color-border)] p-3 bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-mono text-[11px] font-semibold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <span>Component Library</span>
          </div>
          <span className="rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)]">
            {totalMatchingItems} items
          </span>
        </div>

        {/* Read-Only Notice for Viewers */}
        {!isEditable && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2 text-[11px] text-status-warning font-medium">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Viewer mode: Read-only canvas.</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mt-2.5">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[var(--color-text-muted)]"
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
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-1.5 pl-8 pr-7 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:outline-none transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categorized Accordion List */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-2"
        role="region"
        aria-label="Categorized component catalog"
      >
        {totalMatchingItems === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-[var(--color-text-muted)]" role="status">
            No components matching &quot;{searchQuery}&quot;
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 block mx-auto text-[11px] text-[var(--color-accent)] hover:underline font-mono"
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
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] overflow-hidden transition-colors"
              >
                {/* Accordion Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`category-panel-${category.id}`}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text)] font-semibold">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[var(--color-accent)] transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{category.name}</span>
                  </span>
                  <span className="rounded bg-[var(--color-surface)] border border-[var(--color-border)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--color-text-muted)]">
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
                          className={`group flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs transition-all select-none shadow-sm ${
                            isEditable
                              ? 'cursor-grab border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:shadow active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]'
                              : 'cursor-not-allowed opacity-50 border-[var(--color-border)] bg-[var(--color-surface-raised)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] group-hover:border-[var(--color-accent)] transition-colors"
                              aria-hidden="true"
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate block text-[11px]">
                                {item.label}
                              </span>
                            </div>
                          </div>

                          {isEditable && (
                            <div
                              className="text-[var(--color-text-muted)]/40 group-hover:text-[var(--color-accent)] transition-colors shrink-0"
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
      <div className="border-t border-[var(--color-border)] px-3 py-2 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)] shrink-0">
        <span className="block truncate">
          {isEditable
            ? 'Tip: Drag or press Enter to add node.'
            : 'Read-only canvas mode.'}
        </span>
      </div>
    </aside>
  );
};
