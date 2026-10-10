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
          ? 'border-[#ef8557]/40 bg-[#ef8557]/10 text-[#ef8557]'
          : status === 'dirty'
          ? 'border-[#ef8557]/30 bg-[#ef8557]/5 text-[#ef8557]'
          : status === 'error'
          ? 'border-[#ef8557]/50 bg-[#ef8557]/10 text-[#ef8557] shadow-sm'
          : 'border-[#226192]/20 bg-[#eae6ed] text-[#226192]/80'
      } ${className}`}
    >
      {/* 1. Saving */}
      {status === 'saving' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ef8557]" />
          <span>Saving changes...</span>
        </>
      )}

      {/* 2. Dirty / Unsaved */}
      {status === 'dirty' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef8557] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef8557]" />
          </span>
          <span>Unsaved changes</span>
        </>
      )}

      {/* 3. Error or Version Conflict */}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-[#ef8557] shrink-0" />
          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate" title={lastSaveError || 'Failed to save'}>
              {hasVersionConflict ? 'Version conflict' : 'Unable to save'}
            </span>

            {hasVersionConflict && onReload && (
              <button
                type="button"
                onClick={onReload}
                className="inline-flex items-center gap-1 rounded bg-[#ef8557]/20 border border-[#ef8557]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#ef8557] hover:bg-[#ef8557]/30"
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
                className="inline-flex items-center gap-1 rounded bg-[#ef8557]/20 border border-[#ef8557]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#ef8557] hover:bg-[#ef8557]/30"
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
          <CheckCircle className="h-3.5 w-3.5 text-[#226192]" />
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
