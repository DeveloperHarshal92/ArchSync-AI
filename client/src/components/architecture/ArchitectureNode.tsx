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
        className={`group relative min-w-[210px] max-w-[260px] rounded-2xl border transition-all duration-150 ${
          selected
            ? 'border-cyan-400 bg-slate-900 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/80'
            : 'border-slate-800 bg-slate-900/95 shadow-lg shadow-black/40 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        {/* Handles on all 4 cardinal directions for maximum connection flexibility */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400 transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400 transition-transform group-hover:scale-125"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400 transition-transform group-hover:scale-125"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!h-3 !w-3 !rounded-full !border-2 !border-slate-900 !bg-cyan-400 transition-transform group-hover:scale-125"
        />

        {/* Node Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
            >
              <IconComponent className="h-4 w-4" />
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${visual.badgeBg} ${visual.badgeText}`}
            >
              {data.nodeType}
            </span>
          </div>

          {data.category && (
            <span className="text-[10px] font-medium text-slate-500">
              {data.category}
            </span>
          )}
        </div>

        {/* Node Body */}
        <div className="p-3.5 space-y-2">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight break-words line-clamp-2">
              {data.label || 'Untitled Component'}
            </h4>
            {data.description && (
              <p className="mt-1 text-xs text-slate-400 leading-snug line-clamp-2">
                {data.description}
              </p>
            )}
          </div>

          {/* Technology tag if specified */}
          {data.technology && (
            <div className="pt-1">
              <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
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
