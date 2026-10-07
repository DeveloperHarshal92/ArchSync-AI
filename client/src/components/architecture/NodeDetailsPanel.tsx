import React from 'react';
import { CustomNodeData, AppNode, AppEdge } from '../../lib/architecture/adapters';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import { EdgeType } from '@archsync/shared';
import {
  Trash2,
  Sliders,
  X,
  Info,
  GitBranch,
  ShieldAlert,
} from 'lucide-react';

interface NodeDetailsPanelProps {
  selectedNode: AppNode | null;
  selectedEdge: AppEdge | null;
  isEditable: boolean;
  onUpdateNodeData: (nodeId: string, updates: Partial<CustomNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEdgeData: (edgeId: string, updates: { label?: string; edgeType?: EdgeType; animated?: boolean }) => void;
  onDeleteEdge: (edgeId: string) => void;
  onClose?: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  isEditable,
  onUpdateNodeData,
  onDeleteNode,
  onUpdateEdgeData,
  onDeleteEdge,
  onClose,
}) => {
  // 1. Edge Selected View
  if (selectedEdge) {
    const edgeType = (selectedEdge.data?.edgeType as EdgeType) || 'default';
    const isAnimated = selectedEdge.animated ?? edgeType === 'animated';

    return (
      <aside className="flex h-full w-full flex-col border-l border-slate-800 bg-slate-950/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Connection Properties</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Edge properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {/* Source & Target summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="font-mono text-cyan-400 truncate max-w-[150px]">{selectedEdge.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target:</span>
              <span className="font-mono text-cyan-400 truncate max-w-[150px]">{selectedEdge.target}</span>
            </div>
          </div>

          {/* Connection Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Connection Label
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. HTTPS, gRPC, Pub/Sub..."
              value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { label: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Edge Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Line Style
            </label>
            <select
              disabled={!isEditable}
              value={edgeType}
              onChange={(e) =>
                onUpdateEdgeData(selectedEdge.id, {
                  edgeType: e.target.value as EdgeType,
                  animated: e.target.value === 'animated' ? true : isAnimated,
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            >
              <option value="default">Solid Line (Default)</option>
              <option value="animated">Animated Flow</option>
              <option value="dashed">Dashed Line</option>
            </select>
          </div>

          {/* Animated Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Animate Data Flow
            </label>
            <input
              type="checkbox"
              disabled={!isEditable}
              checked={isAnimated}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { animated: e.target.checked })}
              className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Delete Edge Action */}
          {isEditable && (
            <div className="pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Connection</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 2. Node Selected View
  if (selectedNode) {
    const visual = getNodeVisual(selectedNode.data.nodeType);
    const IconComponent = visual.icon;

    return (
      <aside className="flex h-full w-full flex-col border-l border-slate-800 bg-slate-950/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Component Properties</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Component properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {/* Header Card */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${visual.badgeBg} ${visual.badgeText}`}
              >
                {selectedNode.data.nodeType}
              </span>
              <p className="mt-1 font-mono text-[10px] text-slate-500 truncate max-w-[170px]">
                {selectedNode.id}
              </p>
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Component Name *
            </label>
            <input
              type="text"
              disabled={!isEditable}
              required
              placeholder="e.g. Auth Service"
              value={selectedNode.data.label || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Technology Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Technology Stack
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. Node.js, PostgreSQL, Redis..."
              value={selectedNode.data.technology || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { technology: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Category
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. Core, Storage, Edge..."
              value={selectedNode.data.category || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              disabled={!isEditable}
              placeholder="Responsibilities, endpoints, data stores..."
              value={selectedNode.data.description || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50 resize-none"
            />
          </div>

          {/* Delete Node Action */}
          {isEditable && (
            <div className="pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Component</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // 3. Empty State (No selection)
  return (
    <aside className="flex h-full w-full flex-col items-center justify-center border-l border-slate-800 bg-slate-950/70 p-6 text-center backdrop-blur-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
        <Info className="h-6 w-6" />
      </div>
      <h4 className="mt-3 text-sm font-semibold text-white">No Selection</h4>
      <p className="mt-1 max-w-[200px] text-xs text-slate-400 leading-relaxed">
        Select a component or connection on the canvas to inspect and modify its properties.
      </p>
    </aside>
  );
};
