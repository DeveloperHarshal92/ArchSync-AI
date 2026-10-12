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
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-mono font-medium transition-all duration-200 ${
        status === 'saving'
          ? 'border-[#B99D73]/50 bg-[#B99D73]/15 text-[#D6B887]'
          : status === 'dirty'
          ? 'border-[#B99D73]/40 bg-[#B99D73]/10 text-[#D6B887]'
          : status === 'error'
          ? 'border-red-500/50 bg-red-950/20 text-red-300 shadow-sm'
          : 'border-[#B99D73]/20 bg-[#11110F] text-[#B9B1A5]'
      } ${className}`}
    >
      {/* 1. Saving */}
      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D6B887]" />
          <span>Saving changes...</span>
        </>
      )}

      {/* 2. Dirty / Unsaved */}
      {status === 'dirty' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B99D73] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B99D73]" />
          </span>
          <span>Unsaved changes</span>
        </>
      )}

      {/* 3. Error or Version Conflict */}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate" title={lastSaveError || 'Failed to save'}>
              {hasVersionConflict ? 'Version conflict' : 'Unable to save'}
            </span>

            {hasVersionConflict && onReload && (
              <button
                type="button"
                onClick={onReload}
                className="inline-flex items-center gap-1 rounded bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-300 hover:bg-red-500/30"
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
                className="inline-flex items-center gap-1 rounded bg-[#B99D73]/20 border border-[#B99D73]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#D6B887] hover:bg-[#B99D73]/30"
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
          <CheckCircle className="h-3.5 w-3.5 text-[#B99D73]" />
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
