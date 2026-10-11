import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface PanelResizeHandleProps {
  side: 'left' | 'right';
  width: number;
  minWidth: number;
  maxWidth: number;
  onResize: (newWidth: number) => void;
  label?: string;
  disabled?: boolean;
}

export const PanelResizeHandle: React.FC<PanelResizeHandleProps> = ({
  side,
  width,
  minWidth,
  maxWidth,
  onResize,
  label,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const defaultLabel =
    label || (side === 'left' ? 'Resize component palette' : 'Resize contextual inspector');

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      // Prevent text selection during drag
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta =
          side === 'left'
            ? moveEvent.clientX - startXRef.current
            : startXRef.current - moveEvent.clientX;

        const next = Math.max(minWidth, Math.min(maxWidth, Math.round(startWidthRef.current + delta)));
        onResize(next);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [disabled, side, width, minWidth, maxWidth, onResize]
  );

  // Keyboard navigation for accessible resizing
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const step = e.shiftKey ? 20 : 10;

      let nextWidth: number | null = null;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextWidth = side === 'left' ? width - step : width + step;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextWidth = side === 'left' ? width + step : width - step;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextWidth = minWidth;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextWidth = maxWidth;
      }

      if (nextWidth !== null) {
        const clamped = Math.max(minWidth, Math.min(maxWidth, nextWidth));
        onResize(clamped);
      }
    },
    [disabled, side, width, minWidth, maxWidth, onResize]
  );

  // Clean up body style if unmounted while dragging
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  if (disabled) return null;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={defaultLabel}
      aria-valuenow={Math.round(width)}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={`group relative z-30 flex w-2 shrink-0 cursor-col-resize items-center justify-center transition-colors focus:outline-none ${
        isDragging ? 'bg-[#ef8557]' : 'hover:bg-[#ef8557]/40'
      }`}
    >
      {/* Central visual indicator bar */}
      <div
        className={`h-8 w-1 rounded-full transition-colors ${
          isDragging
            ? 'bg-[#eae6ed]'
            : 'bg-[#226192]/20 group-hover:bg-[#ef8557] group-focus-visible:bg-[#ef8557]'
        }`}
      />
    </div>
  );
};
