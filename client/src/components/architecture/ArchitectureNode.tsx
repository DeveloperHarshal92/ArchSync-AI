import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AppNode } from '../../lib/architecture/adapters';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';

export const ArchitectureNodeComponent: React.FC<NodeProps<AppNode>> = memo(
  ({ data, selected }) => {
    const visual = getNodeVisual(data.nodeType);
    const IconComponent = visual.icon;

    const customStyle = data.style;
    const hasCustomFill = Boolean(customStyle?.fillColor);
    const hasCustomBorder = Boolean(customStyle?.borderColor);
    const hasCustomBorderWidth = customStyle?.borderWidth !== undefined;
    const hasCustomTextColor = Boolean(customStyle?.textColor);
    const hasCustomOpacity = customStyle?.opacity !== undefined;

    const dynamicContainerStyle: React.CSSProperties = {
      ...(hasCustomFill ? { backgroundColor: customStyle!.fillColor } : {}),
      ...(hasCustomBorder && !selected ? { borderColor: customStyle!.borderColor } : {}),
      ...(hasCustomBorderWidth ? { borderWidth: `${customStyle!.borderWidth}px` } : {}),
      ...(hasCustomOpacity ? { opacity: customStyle!.opacity } : {}),
      ...(hasCustomTextColor ? { color: customStyle!.textColor } : {}),
    };

    return (
      <div
        style={dynamicContainerStyle}
        className={`group relative min-w-[210px] max-w-[260px] rounded-xl border transition-all duration-150 ${
          selected
            ? 'border-[var(--color-focus)] bg-[var(--color-surface-raised)] shadow-2xl ring-2 ring-[var(--color-focus)]/60'
            : `border-[var(--color-border)] bg-[var(--color-surface)] shadow-md hover:border-[var(--color-accent)] hover:shadow-lg ${visual.borderStyle || ''}`
        }`}
      >
        {/* Handles on all 4 cardinal directions */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--color-bg)] !bg-[var(--color-accent)] transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--color-bg)] !bg-[var(--color-accent)] transition-transform group-hover:scale-125"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--color-bg)] !bg-[var(--color-accent)] transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[var(--color-bg)] !bg-[var(--color-accent)] transition-transform group-hover:scale-125"
        />

        {/* Node Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
            >
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${visual.badgeBg} ${visual.badgeText}`}
            >
              {data.nodeType}
            </span>
          </div>

          {data.category && (
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] opacity-70">
              {data.category}
            </span>
          )}
        </div>

        {/* Node Body */}
        <div className="p-3.5 space-y-2">
          <div>
            <h4
              style={hasCustomTextColor ? { color: customStyle!.textColor } : {}}
              className="font-serif text-base font-semibold text-[var(--color-text)] tracking-tight break-words line-clamp-2"
            >
              {data.label || 'Untitled Component'}
            </h4>
            {data.description && (
              <p
                style={hasCustomTextColor ? { color: customStyle!.textColor, opacity: 0.8 } : {}}
                className="mt-1 text-xs text-[var(--color-text-muted)] leading-snug line-clamp-2"
              >
                {data.description}
              </p>
            )}
          </div>

          {/* Technology tag if specified */}
          {data.technology && (
            <div className="pt-1">
              <span className="inline-flex items-center rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--color-accent)]">
                {data.technology}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ArchitectureNodeComponent.displayName = 'ArchitectureNodeComponent';
