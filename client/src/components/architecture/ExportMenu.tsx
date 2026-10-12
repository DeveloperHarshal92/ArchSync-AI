import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Image as ImageIcon,
  FileCode2,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Architecture, SupportedExportFormat } from '@archsync/shared';
import {
  exportArchitectureAsJson,
  exportArchitectureAsSvg,
  exportArchitectureAsPng,
  downloadBlob,
} from '../../lib/export';

export interface ExportMenuProps {
  getCurrentArchitecture: () => Architecture;
  projectName?: string;
  projectDescription?: string;
  isAutosavePending?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  getCurrentArchitecture,
  projectName = 'Architecture',
  projectDescription,
  isAutosavePending = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeFormat, setActiveFormat] = useState<SupportedExportFormat | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Arrow-key navigation for menu items
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
    );
    const idx = items.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === 'Tab' || e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  // Open menu and focus first item on ArrowDown from trigger
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  }, [isOpen]);

  // Auto-dismiss feedback notifications
  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      setFeedback(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [feedback]);

  const handleExport = useCallback(
    async (format: SupportedExportFormat) => {
      setIsExporting(true);
      setActiveFormat(format);
      setFeedback(null);

      try {
        // Obtains live in-memory architecture without mutating canvas state
        const architecture = getCurrentArchitecture();
        const projectMeta = { name: projectName, description: projectDescription };

        if (format === 'json') {
          const { blob, filename } = exportArchitectureAsJson(projectMeta, architecture);
          downloadBlob(blob, filename);
          setFeedback({ type: 'success', text: `Exported JSON: ${filename}` });
        } else if (format === 'svg') {
          const { blob, filename } = exportArchitectureAsSvg(projectMeta, architecture);
          downloadBlob(blob, filename);
          setFeedback({ type: 'success', text: `Exported SVG: ${filename}` });
        } else if (format === 'png') {
          const { blob, filename } = await exportArchitectureAsPng(projectMeta, architecture);
          downloadBlob(blob, filename);
          setFeedback({ type: 'success', text: `Exported PNG: ${filename}` });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Export failed due to an unexpected error.';
        setFeedback({
          type: 'error',
          text: `Export failed: ${errorMsg}`,
        });
      } finally {
        setIsExporting(false);
        setActiveFormat(null);
      }
    },
    [getCurrentArchitecture, projectName, projectDescription]
  );

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id="export-architecture-btn"
        data-testid="canvas-export-btn"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${
          isOpen
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-text)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)]'
        } ${isExporting ? 'opacity-80 cursor-wait' : ''}`}
        aria-label={isExporting ? `Exporting ${activeFormat?.toUpperCase()}…` : 'Export architecture diagram (PNG, SVG, or JSON)'}
        onKeyDown={handleTriggerKeyDown}
        title={undefined}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
        ) : (
          <Download className="h-3.5 w-3.5 text-[var(--color-accent)]" />
        )}
        <span>{isExporting ? `Exporting ${activeFormat?.toUpperCase()}...` : 'Export'}</span>
        <ChevronDown
          className={`h-3 w-3 text-[var(--color-text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Status / Feedback Toast */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          data-testid="export-feedback"
          className={`absolute top-full mt-2 right-0 z-50 flex items-center gap-2 rounded-lg border p-2.5 text-xs shadow-2xl whitespace-nowrap min-w-[220px] transition-all animate-in fade-in slide-in-from-top-1 ${
            feedback.type === 'success'
              ? 'border-[var(--color-accent)]/40 bg-[var(--color-surface)] text-[var(--color-text)]'
              : 'border-red-500/50 bg-[var(--color-surface)] text-red-600 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          )}
          <span className="font-medium text-[11px] truncate">{feedback.text}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="export-architecture-btn"
          data-testid="export-menu-dropdown"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-full mt-2 z-50 w-72 origin-top-right rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl ring-1 ring-[var(--color-border)] focus:outline-none animate-in fade-in slide-in-from-top-2 text-[var(--color-text)]"
        >
          <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
            <h4 className="font-serif text-sm font-medium text-[var(--color-text)]">Export Diagram</h4>
            <p className="text-[11px] font-mono text-[var(--color-text-muted)] mt-0.5">
              {isAutosavePending
                ? 'Includes active in-memory canvas edits'
                : 'Current architecture state'}
            </p>
          </div>

          <div className="space-y-1">
            {/* 1. Export PNG */}
            <button
              type="button"
              role="menuitem"
              data-testid="export-png-option"
              disabled={isExporting}
              onClick={() => {
                handleExport('png');
                setIsOpen(false);
              }}
              className="w-full flex items-start gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)] focus:bg-[var(--color-surface-elevated)] focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-text)]">Export PNG</span>
                  <span className="rounded bg-[var(--color-accent)]/20 px-1 py-0.2 text-[9px] font-mono font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                    Raster
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  High-resolution raster diagram (2x Retina scale)
                </p>
              </div>
            </button>

            {/* 2. Export SVG */}
            <button
              type="button"
              role="menuitem"
              data-testid="export-svg-option"
              disabled={isExporting}
              onClick={() => {
                handleExport('svg');
                setIsOpen(false);
              }}
              className="w-full flex items-start gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)] focus:bg-[var(--color-surface-elevated)] focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/15 text-blue-500">
                <FileCode2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-text)]">Export SVG</span>
                  <span className="rounded bg-blue-500/15 px-1 py-0.2 text-[9px] font-mono font-bold text-blue-600 dark:text-blue-300 border border-blue-500/30">
                    Vector
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Scalable vector graphic for docs, web & design tools
                </p>
              </div>
            </button>

            {/* 3. Export JSON */}
            <button
              type="button"
              role="menuitem"
              data-testid="export-json-option"
              disabled={isExporting}
              onClick={() => {
                handleExport('json');
                setIsOpen(false);
              }}
              className="w-full flex items-start gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)] focus:bg-[var(--color-surface-elevated)] focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <FileJson className="h-4 w-4 text-[var(--color-accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-text)]">Export JSON</span>
                  <span className="rounded bg-[var(--color-accent)]/15 px-1 py-0.2 text-[9px] font-mono font-bold text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    Data
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Portable architecture schema & topology backup
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
