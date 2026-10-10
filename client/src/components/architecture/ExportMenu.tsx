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
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/80 ${
          isOpen
            ? 'border-cyan-500/60 bg-cyan-950/80 text-cyan-300'
            : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
        } ${isExporting ? 'opacity-80 cursor-wait' : ''}`}
        aria-label={isExporting ? `Exporting ${activeFormat?.toUpperCase()}…` : 'Export architecture diagram (PNG, SVG, or JSON)'}
        onKeyDown={handleTriggerKeyDown}
        title={undefined}
      >
        {isExporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
        ) : (
          <Download className="h-3.5 w-3.5 text-cyan-400" />
        )}
        <span>{isExporting ? `Exporting ${activeFormat?.toUpperCase()}...` : 'Export'}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
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
          className={`absolute top-full mt-2 right-0 z-50 flex items-center gap-2 rounded-xl border p-2.5 text-xs shadow-2xl backdrop-blur-md whitespace-nowrap min-w-[220px] transition-all animate-in fade-in slide-in-from-top-1 ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-slate-900/95 text-emerald-400'
              : 'border-rose-500/30 bg-slate-900/95 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
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
          className="absolute right-0 top-full mt-2 z-50 w-72 origin-top-right rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/50 focus:outline-none animate-in fade-in slide-in-from-top-2"
        >
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
            <h4 className="text-xs font-semibold text-white">Export Diagram</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
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
              className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-800/80 focus:bg-slate-800 focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Export PNG</span>
                  <span className="rounded bg-cyan-500/10 px-1 py-0.2 text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                    Raster
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
              className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-800/80 focus:bg-slate-800 focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <FileCode2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Export SVG</span>
                  <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                    Vector
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
              className="w-full flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-800/80 focus:bg-slate-800 focus:outline-none disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                <FileJson className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Export JSON</span>
                  <span className="rounded bg-indigo-500/10 px-1 py-0.2 text-[9px] font-bold text-indigo-400 border border-indigo-500/20">
                    Data
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
