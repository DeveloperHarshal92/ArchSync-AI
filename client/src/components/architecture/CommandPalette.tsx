import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Command } from 'lucide-react';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description?: string;
  category: 'components' | 'edit' | 'align' | 'canvas' | 'tools';
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onExecute: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
}

const CATEGORY_ORDER: Array<{ key: CommandPaletteAction['category']; label: string }> = [
  { key: 'edit', label: 'Edit & Selection' },
  { key: 'align', label: 'Layout & Alignment' },
  { key: 'components', label: 'Add Component' },
  { key: 'canvas', label: 'Canvas Appearance' },
  { key: 'tools', label: 'Tools & Export' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  actions,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
    );
  }, [actions, query]);

  // Reset query and selectedIndex on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Adjust selection bounds when filtered list changes
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredActions.length === 0) return 0;
      return Math.min(prev, filteredActions.length - 1);
    });
  }, [filteredActions.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-action-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredActions.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredActions.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredActions[selectedIndex];
      if (current && !current.disabled) {
        current.onExecute();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 dark:bg-[#090907]/80 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        className="w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden flex flex-col text-[var(--color-text)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Search className="h-4 w-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
          <h2 id="command-palette-title" className="sr-only">
            Command Palette
          </h2>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            placeholder="Search commands, tools, or components... (e.g. 'Align', 'Duplicate')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[var(--color-surface-raised)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-accent)] border border-[var(--color-border)]">
            Esc
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action List */}
        <div
          id="command-palette-results"
          ref={listRef}
          role="listbox"
          className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--color-border)]"
        >
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
              No matching commands or actions found for &quot;{query}&quot;.
            </div>
          ) : (
            CATEGORY_ORDER.map(({ key, label: categoryLabel }) => {
              const categoryActions = filteredActions.filter((a) => a.category === key);
              if (categoryActions.length === 0) return null;

              return (
                <div key={key} className="py-1.5 first:pt-0 last:pb-0">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    {categoryLabel}
                  </div>
                  <div className="space-y-0.5">
                    {categoryActions.map((action) => {
                      const globalIndex = filteredActions.indexOf(action);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          role="option"
                          data-action-index={globalIndex}
                          aria-selected={isSelected}
                          disabled={action.disabled}
                          onClick={() => {
                            if (!action.disabled) {
                              action.onExecute();
                              onClose();
                            }
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent)] text-white dark:text-[#090907]'
                              : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                          } ${action.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {action.icon && (
                              <span
                                className={`shrink-0 ${
                                  isSelected ? 'text-white dark:text-[#090907]' : 'text-[var(--color-accent)]'
                                }`}
                              >
                                {action.icon}
                              </span>
                            )}
                            <div className="min-w-0">
                              <span className="font-medium block truncate">{action.label}</span>
                              {action.description && (
                                <span
                                  className={`text-[10px] block truncate ${
                                    isSelected ? 'opacity-80' : 'text-[var(--color-text-muted)]'
                                  }`}
                                >
                                  {action.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {action.shortcut && (
                            <kbd
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono border ${
                                isSelected
                                  ? 'bg-black/20 text-white dark:text-[#090907] border-black/30'
                                  : 'bg-[var(--color-surface-raised)] text-[var(--color-accent)] border-[var(--color-border)]'
                              }`}
                            >
                              {action.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Select</span>
            <span>•</span>
            <span>Esc Dismiss</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--color-accent)]">
            <Command className="h-3 w-3" />
            <span>ArchSync Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
