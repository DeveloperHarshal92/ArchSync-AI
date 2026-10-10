import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AppNode } from '../../lib/architecture/adapters';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';

export const ArchitectureNodeComponent: React.FC<NodeProps<AppNode>> = memo(
  ({ data, selected }) => {
    const visual = getNodeVisual(data.nodeType);
    const IconComponent = visual.icon;

    return (
      <div
        className={`group relative min-w-[210px] max-w-[260px] rounded-lg border transition-all duration-150 ${
          selected
            ? 'border-[#ef8557] bg-[#eae6ed] shadow-lg ring-2 ring-[#ef8557]'
            : `border-[#226192]/20 bg-[#eae6ed] shadow-sm hover:border-[#226192]/40 hover:bg-[#226192]/[0.02] ${visual.borderStyle || ''}`
        }`}
      >
        {/* Handles on all 4 cardinal directions for maximum connection flexibility */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[#eae6ed] !bg-[#ef8557] transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[#eae6ed] !bg-[#ef8557] transition-transform group-hover:scale-125"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[#eae6ed] !bg-[#ef8557] transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!h-3 !w-3 !rounded-full !border-2 !border-[#eae6ed] !bg-[#ef8557] transition-transform group-hover:scale-125"
        />

        {/* Node Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#226192]/15 px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
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
            <span className="text-[10px] font-mono text-[#226192]/60">
              {data.category}
            </span>
          )}
        </div>

        {/* Node Body */}
        <div className="p-3.5 space-y-2">
          <div>
            <h4 className="font-serif text-base font-medium text-[#226192] tracking-tight break-words line-clamp-2">
              {data.label || 'Untitled Component'}
            </h4>
            {data.description && (
              <p className="mt-1 text-xs text-[#226192]/70 leading-snug line-clamp-2">
                {data.description}
              </p>
            )}
          </div>

          {/* Technology tag if specified */}
          {data.technology && (
            <div className="pt-1">
              <span className="inline-flex items-center rounded border border-[#226192]/20 bg-[#226192]/5 px-2 py-0.5 text-[10px] font-mono font-medium text-[#226192]">
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
