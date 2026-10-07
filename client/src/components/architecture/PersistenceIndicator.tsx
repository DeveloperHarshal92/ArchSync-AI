import React from 'react';
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  selectPersistenceStatus,
  selectLastSavedAt,
  selectLastSaveError,
  selectHasVersionConflict,
} from '../../store/slices/editorSlice';

interface PersistenceIndicatorProps {
  onRetry?: () => void;
  onReload?: () => void;
  className?: string;
}

export const PersistenceIndicator: React.FC<PersistenceIndicatorProps> = ({
  onRetry,
  onReload,
  className = '',
}) => {
  const status = useAppSelector(selectPersistenceStatus);
  const lastSavedAt = useAppSelector(selectLastSavedAt);
  const lastSaveError = useAppSelector(selectLastSaveError);
  const hasVersionConflict = useAppSelector(selectHasVersionConflict);

  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200 ${
        status === 'saving'
          ? 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300'
          : status === 'dirty'
          ? 'border-amber-500/30 bg-amber-950/40 text-amber-300'
          : status === 'error'
          ? 'border-rose-500/40 bg-rose-950/50 text-rose-300 shadow-lg shadow-rose-950/30'
          : 'border-slate-800 bg-slate-900/60 text-slate-400'
      } ${className}`}
    >
      {/* 1. Saving */}
      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          <span>Saving changes...</span>
        </>
      )}

      {/* 2. Dirty / Unsaved */}
      {status === 'dirty' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          <span>Unsaved changes</span>
        </>
      )}

      {/* 3. Error or Version Conflict */}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate" title={lastSaveError || 'Failed to save'}>
              {hasVersionConflict ? 'Version conflict' : 'Unable to save'}
            </span>

            {hasVersionConflict && onReload && (
              <button
                type="button"
                onClick={onReload}
                className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30"
                title="Reload the latest architecture from the server"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reload</span>
              </button>
            )}

            {!hasVersionConflict && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30"
                title="Retry saving now"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* 4. Saved or Idle */}
      {(status === 'saved' || status === 'idle') && (
        <>
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            {status === 'saved'
              ? formattedTime
                ? `Saved at ${formattedTime}`
                : 'Saved'
              : 'All changes saved'}
          </span>
        </>
      )}
    </div>
  );
};
