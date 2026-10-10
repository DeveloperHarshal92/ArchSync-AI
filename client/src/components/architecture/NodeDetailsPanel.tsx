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
      <aside className="flex h-full w-full flex-col border-l border-[#226192]/15 bg-[#eae6ed] p-4 text-[#226192]">
        <div className="flex items-center justify-between pb-3 border-b border-[#226192]/15">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#ef8557]" />
            <h3 className="font-serif text-base font-medium text-[#226192]">Connection Properties</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#226192]/70 hover:text-[#226192] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-[#ef8557]/40 bg-[#ef8557]/15 p-2 text-[11px] text-[#ef8557]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Edge properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {/* Source & Target summary */}
          <div className="rounded-md border border-[#226192]/20 bg-[#226192]/5 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#226192]/70">Source:</span>
              <span className="font-mono text-[#ef8557] truncate max-w-[150px]">{selectedEdge.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#226192]/70">Target:</span>
              <span className="font-mono text-[#ef8557] truncate max-w-[150px]">{selectedEdge.target}</span>
            </div>
          </div>

          {/* Connection Label */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
              Connection Label
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. HTTPS, gRPC, Pub/Sub..."
              value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { label: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50"
            />
          </div>

          {/* Edge Style Selector */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
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
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50 font-mono"
            >
              <option value="default" className="bg-[#eae6ed] text-[#226192]">Solid Line (Default)</option>
              <option value="animated" className="bg-[#eae6ed] text-[#226192]">Animated Flow</option>
              <option value="dashed" className="bg-[#eae6ed] text-[#226192]">Dashed Line</option>
            </select>
          </div>

          {/* Animated Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-mono font-semibold uppercase text-[#226192]">
              Animate Data Flow
            </label>
            <input
              type="checkbox"
              disabled={!isEditable}
              checked={isAnimated}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { animated: e.target.checked })}
              className="h-4 w-4 rounded border-[#226192]/30 bg-[#eae6ed] text-[#ef8557] focus:ring-[#ef8557] accent-[#ef8557] disabled:opacity-50"
            />
          </div>

          {/* Delete Edge Action */}
          {isEditable && (
            <div className="pt-6 border-t border-[#226192]/15">
              <button
                type="button"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-[#ef8557]/40 bg-[#ef8557]/15 px-4 py-2 text-xs font-medium text-[#ef8557] hover:bg-[#ef8557]/25 hover:text-[#226192] transition-colors focus:ring-2 focus:ring-[#ef8557]"
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
      <aside className="flex h-full w-full flex-col border-l border-[#226192]/15 bg-[#eae6ed] p-4 text-[#226192]">
        <div className="flex items-center justify-between pb-3 border-b border-[#226192]/15">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#ef8557]" />
            <h3 className="font-serif text-base font-medium text-[#226192]">Component Properties</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#226192]/70 hover:text-[#226192] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-[#ef8557]/40 bg-[#ef8557]/15 p-2 text-[11px] text-[#ef8557]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Component properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {/* Header Card */}
          <div className="flex items-center gap-3 rounded-md border border-[#226192]/20 bg-[#226192]/5 p-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded border ${visual.badgeBg} ${visual.badgeBorder} ${visual.badgeText}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${visual.badgeBg} ${visual.badgeText}`}
              >
                {selectedNode.data.nodeType}
              </span>
              <p className="mt-1 font-mono text-[10px] text-[#226192]/70 truncate max-w-[170px]">
                {selectedNode.id}
              </p>
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
              Component Name *
            </label>
            <input
              type="text"
              disabled={!isEditable}
              required
              placeholder="e.g. Auth Service"
              value={selectedNode.data.label || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50"
            />
          </div>

          {/* Technology Input */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
              Technology Stack
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. Node.js, PostgreSQL, Redis..."
              value={selectedNode.data.technology || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { technology: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50"
            />
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
              Category
            </label>
            <input
              type="text"
              disabled={!isEditable}
              placeholder="e.g. Core, Storage, Edge..."
              value={selectedNode.data.category || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { category: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[#226192]">
              Description
            </label>
            <textarea
              rows={3}
              disabled={!isEditable}
              placeholder="Responsibilities, endpoints, data stores..."
              value={selectedNode.data.description || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#226192]/20 bg-[#eae6ed] px-3 py-1.5 text-xs text-[#226192] placeholder-[#226192]/40 focus:border-[#ef8557] focus:outline-none focus:ring-1 focus:ring-[#ef8557] disabled:opacity-50 resize-none"
            />
          </div>

          {/* Delete Node Action */}
          {isEditable && (
            <div className="pt-6 border-t border-[#226192]/15">
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-[#ef8557]/40 bg-[#ef8557]/15 px-4 py-2 text-xs font-medium text-[#ef8557] hover:bg-[#ef8557]/25 hover:text-[#226192] transition-colors focus:ring-2 focus:ring-[#ef8557]"
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
    <aside className="flex h-full w-full flex-col items-center justify-center border-l border-[#226192]/15 bg-[#eae6ed] p-6 text-center text-[#226192]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#226192]/5 border border-[#226192]/20 text-[#226192]/70">
        <Info className="h-6 w-6" />
      </div>
      <h4 className="mt-3 font-serif text-base font-medium text-[#226192]">No Selection</h4>
      <p className="mt-1 max-w-[200px] text-xs text-[#226192]/70 leading-relaxed">
        Select a component or connection on the canvas to inspect and modify its properties.
      </p>
    </aside>
  );
};
