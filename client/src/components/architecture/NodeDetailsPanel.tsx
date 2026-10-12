import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CustomNodeData, AppNode, AppEdge } from '../../lib/architecture/adapters';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import {
  EdgeType,
  ArchitectureNodeStyle,
  ArchitectureEdgeStyle,
  CanvasAppearance,
  ConnectorType,
  EdgeStrokeStyle,
  ArrowheadType,
} from '@archsync/shared';
import {
  Trash2,
  Sliders,
  X,
  GitBranch,
  ShieldAlert,
  RotateCcw,
  Palette,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  Check,
} from 'lucide-react';

export interface NodeDetailsPanelProps {
  selectedNode: AppNode | null;
  selectedEdge: AppEdge | null;
  selectedNodes?: AppNode[];
  selectedEdges?: AppEdge[];
  canvasSettings?: CanvasAppearance;
  isEditable: boolean;
  onUpdateNodeData: (nodeId: string, updates: Partial<CustomNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEdgeData: (
    edgeId: string,
    updates: {
      label?: string;
      edgeType?: EdgeType;
      animated?: boolean;
      style?: ArchitectureEdgeStyle;
    }
  ) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateCanvasSettings?: (settings: Partial<CanvasAppearance>) => void;
  onResetCanvasSettings?: () => void;
  onAlignNodes?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeNodes?: (axis: 'horizontal' | 'vertical') => void;
  onBatchUpdateNodeStyle?: (nodeIds: string[], style: Partial<ArchitectureNodeStyle>) => void;
  onClose?: () => void;
}

// Canonical Architectural Palette
const APPROVED_COLORS = [
  { label: 'Deep Surface', value: '#11110F' },
  { label: 'Clean Surface', value: '#FFFFFF' },
  { label: 'Architectural Bronze', value: '#B99D73' },
  { label: 'Coral Accent', value: '#EB7844' },
  { label: 'Warm Amber Highlight', value: '#D6B887' },
  { label: 'Service Blue', value: '#3B82F6' },
  { label: 'Emerald Gateway', value: '#10B981' },
  { label: 'Storage Amber', value: '#F59E0B' },
  { label: 'Crimson Endpoint', value: '#EF4444' },
];

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  selectedNodes = [],
  selectedEdges: _selectedEdges = [],
  canvasSettings,
  isEditable,
  onUpdateNodeData,
  onDeleteNode,
  onUpdateEdgeData,
  onDeleteEdge,
  onUpdateCanvasSettings,
  onResetCanvasSettings,
  onAlignNodes,
  onDistributeNodes,
  onBatchUpdateNodeStyle,
  onClose,
}) => {
  const { resolvedTheme } = useTheme();
  const isMultiSelection = selectedNodes.length > 1;

  // 1. MULTI-SELECTION VIEW
  if (isMultiSelection) {
    return (
      <aside
        className="flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] overflow-y-auto"
        aria-label="Multi-element alignment and styling inspector"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-serif text-base font-medium text-[var(--color-text)]">
              {selectedNodes.length} Components Selected
            </h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-[#D6B887]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Alignment and styling cannot be modified.</span>
          </div>
        )}

        <div className="mt-4 space-y-5">
          {/* Alignment Tools */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-2">
              Align Components
            </label>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Horizontal and vertical alignment actions">
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('left')}
                title="Align Left"
                aria-label="Align selected components left"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <span>Left</span>
              </button>
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('center')}
                title="Align Center"
                aria-label="Align selected components center horizontally"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <AlignCenter className="h-3.5 w-3.5" />
                <span>Center</span>
              </button>
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('right')}
                title="Align Right"
                aria-label="Align selected components right"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <AlignRight className="h-3.5 w-3.5" />
                <span>Right</span>
              </button>

              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('top')}
                title="Align Top"
                aria-label="Align selected components top"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <span>Top</span>
              </button>
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('middle')}
                title="Align Middle"
                aria-label="Align selected components middle vertically"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <span>Middle</span>
              </button>
              <button
                type="button"
                disabled={!isEditable}
                onClick={() => onAlignNodes?.('bottom')}
                title="Align Bottom"
                aria-label="Align selected components bottom"
                className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
              >
                <span>Bottom</span>
              </button>
            </div>
          </div>

          {/* Distribution Tools */}
          {selectedNodes.length >= 3 && (
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-2">
                Distribute Spacing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => onDistributeNodes?.('horizontal')}
                  aria-label="Distribute components horizontally"
                  className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
                >
                  <AlignHorizontalSpaceAround className="h-3.5 w-3.5" />
                  <span>Horizontally</span>
                </button>
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => onDistributeNodes?.('vertical')}
                  aria-label="Distribute components vertically"
                  className="flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] disabled:opacity-50"
                >
                  <AlignVerticalSpaceAround className="h-3.5 w-3.5" />
                  <span>Vertically</span>
                </button>
              </div>
            </div>
          )}

          {/* Batch Styling */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-1.5">
              Batch Fill Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {APPROVED_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={!isEditable}
                  onClick={() =>
                    onBatchUpdateNodeStyle?.(
                      selectedNodes.map((n) => n.id),
                      { fillColor: c.value }
                    )
                  }
                  title={c.label}
                  aria-label={`Set fill color to ${c.label}`}
                  className="h-6 w-6 rounded border border-[var(--color-border)] shadow-xs focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-1.5">
              Batch Border Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {APPROVED_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={!isEditable}
                  onClick={() =>
                    onBatchUpdateNodeStyle?.(
                      selectedNodes.map((n) => n.id),
                      { borderColor: c.value }
                    )
                  }
                  title={c.label}
                  aria-label={`Set border color to ${c.label}`}
                  className="h-6 w-6 rounded border border-[var(--color-border)] shadow-xs focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Batch Reset */}
          <div className="pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              disabled={!isEditable}
              onClick={() =>
                onBatchUpdateNodeStyle?.(
                  selectedNodes.map((n) => n.id),
                  {
                    fillColor: undefined,
                    borderColor: undefined,
                    borderWidth: undefined,
                    textColor: undefined,
                    opacity: undefined,
                  }
                )
              }
              aria-label="Reset styles for all selected components"
              className="w-full flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Selected Styles</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 2. EDGE SELECTED VIEW (Connector Customization Inspector)
  if (selectedEdge) {
    const edgeType = (selectedEdge.data?.edgeType as EdgeType) || 'default';
    const edgeStyle = selectedEdge.data?.style;
    const isAnimated = selectedEdge.animated ?? edgeType === 'animated';
    const currentStroke = edgeStyle?.strokeColor || '#B99D73';
    const currentWidth = edgeStyle?.strokeWidth ?? 2;
    const currentOpacity = edgeStyle?.opacity ?? 1;
    const currentLineStyle: EdgeStrokeStyle =
      edgeStyle?.strokeStyle || (edgeType === 'dashed' ? 'dashed' : 'solid');
    const currentConnector: ConnectorType = edgeStyle?.connectorType || 'smoothstep';
    const currentArrowStart: ArrowheadType = edgeStyle?.arrowHeadStart || 'none';
    const currentArrowEnd: ArrowheadType = edgeStyle?.arrowHeadEnd || 'arrow';

    const updateStyle = (styleUpdates: Partial<ArchitectureEdgeStyle>) => {
      onUpdateEdgeData(selectedEdge.id, {
        style: {
          ...edgeStyle,
          ...styleUpdates,
        },
      });
    };

    const handleResetStyle = () => {
      onUpdateEdgeData(selectedEdge.id, {
        edgeType: 'default',
        animated: false,
        style: {
          strokeColor: '#B99D73',
          strokeWidth: 2,
          opacity: 1,
          strokeStyle: 'solid',
          connectorType: 'smoothstep',
          arrowHeadStart: 'none',
          arrowHeadEnd: 'arrow',
        },
      });
    };

    return (
      <aside
        className="flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] overflow-y-auto"
        aria-label="Connection styling and routing inspector"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-serif text-base font-medium text-[var(--color-text)]">Connector Inspector</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close connector inspector"
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-[#D6B887]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Edge properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4">
          {/* Source & Target summary */}
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2.5 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Source:</span>
              <span className="font-mono text-[var(--color-accent)] truncate max-w-[150px]">{selectedEdge.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Target:</span>
              <span className="font-mono text-[var(--color-accent)] truncate max-w-[150px]">{selectedEdge.target}</span>
            </div>
          </div>

          {/* Connection Label */}
          <div>
            <label htmlFor="edge-label-input" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Connection Label
            </label>
            <input
              id="edge-label-input"
              type="text"
              disabled={!isEditable}
              placeholder="e.g. HTTPS, gRPC, Pub/Sub..."
              value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { label: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
            />
          </div>

          {/* Connector Type */}
          <div>
            <label htmlFor="edge-connector-select" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Connector Route Type
            </label>
            <select
              id="edge-connector-select"
              disabled={!isEditable}
              value={currentConnector}
              onChange={(e) => updateStyle({ connectorType: e.target.value as ConnectorType })}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50 font-mono"
            >
              <option value="smoothstep">Smooth-Step (Orthogonal)</option>
              <option value="straight">Straight Line</option>
              <option value="curved">Curved (Bezier)</option>
            </select>
          </div>

          {/* Stroke Style */}
          <div>
            <label htmlFor="edge-stroke-style-select" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Line Pattern
            </label>
            <select
              id="edge-stroke-style-select"
              disabled={!isEditable}
              value={currentLineStyle}
              onChange={(e) => {
                const styleVal = e.target.value as EdgeStrokeStyle;
                updateStyle({ strokeStyle: styleVal });
                onUpdateEdgeData(selectedEdge.id, {
                  edgeType: styleVal === 'dashed' ? 'dashed' : 'default',
                });
              }}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50 font-mono"
            >
              <option value="solid">Solid Line</option>
              <option value="dashed">Dashed (5px)</option>
              <option value="dotted">Dotted (2px)</option>
            </select>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-1.5">
              Stroke Color
            </label>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Edge stroke color">
              {APPROVED_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => updateStyle({ strokeColor: c.value })}
                  title={c.label}
                  aria-label={`Set stroke color to ${c.label}`}
                  className={`h-6 w-6 rounded border shadow-xs transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center ${
                    currentStroke === c.value ? 'ring-2 ring-[var(--color-accent)] scale-110' : 'border-[var(--color-border)]'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {currentStroke === c.value && (
                    <Check className="h-3 w-3 text-white dark:text-[#11110F] drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="edge-width-range" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Stroke Width
              </label>
              <span className="text-xs font-mono text-[var(--color-accent)]">{currentWidth}px</span>
            </div>
            <input
              id="edge-width-range"
              type="range"
              min={1}
              max={6}
              step={1}
              disabled={!isEditable}
              value={currentWidth}
              onChange={(e) => updateStyle({ strokeWidth: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] disabled:opacity-50"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="edge-opacity-range" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Opacity
              </label>
              <span className="text-xs font-mono text-[var(--color-accent)]">{Math.round(currentOpacity * 100)}%</span>
            </div>
            <input
              id="edge-opacity-range"
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              disabled={!isEditable}
              value={currentOpacity}
              onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] disabled:opacity-50"
            />
          </div>

          {/* Arrowhead Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="arrow-start-select" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Start Arrow
              </label>
              <select
                id="arrow-start-select"
                disabled={!isEditable}
                value={currentArrowStart}
                onChange={(e) => updateStyle({ arrowHeadStart: e.target.value as ArrowheadType })}
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 font-mono"
              >
                <option value="none">None</option>
                <option value="arrow">Open Arrow</option>
                <option value="arrowclosed">Closed Arrow</option>
              </select>
            </div>
            <div>
              <label htmlFor="arrow-end-select" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                End Arrow
              </label>
              <select
                id="arrow-end-select"
                disabled={!isEditable}
                value={currentArrowEnd}
                onChange={(e) => updateStyle({ arrowHeadEnd: e.target.value as ArrowheadType })}
                className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 font-mono"
              >
                <option value="none">None</option>
                <option value="arrow">Open Arrow</option>
                <option value="arrowclosed">Closed Arrow</option>
              </select>
            </div>
          </div>

          {/* Animate Data Flow */}
          <div className="flex items-center justify-between pt-1">
            <label htmlFor="edge-animate-checkbox" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Animate Data Flow
            </label>
            <input
              id="edge-animate-checkbox"
              type="checkbox"
              disabled={!isEditable}
              checked={isAnimated}
              onChange={(e) => onUpdateEdgeData(selectedEdge.id, { animated: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] accent-[var(--color-accent)] disabled:opacity-50"
            />
          </div>

          {/* Reset Style */}
          {isEditable && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetStyle}
                aria-label="Reset connector to default style"
                className="w-full flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Connector Style</span>
              </button>
            </div>
          )}

          {/* Delete Edge Action */}
          {isEditable && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                aria-label="Delete connection"
                className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-500/20 transition-colors focus:ring-2 focus:ring-red-400"
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

  // 3. NODE SELECTED VIEW (Component Property + Style Inspector)
  if (selectedNode) {
    const visual = getNodeVisual(selectedNode.data.nodeType);
    const IconComponent = visual.icon;
    const nodeStyle = selectedNode.data.style;
    const currentFill = nodeStyle?.fillColor || '#141310';
    const currentBorder = nodeStyle?.borderColor || 'rgba(185, 157, 115, 0.25)';
    const currentBorderWidth = nodeStyle?.borderWidth ?? 1;
    const currentTextColor = nodeStyle?.textColor || '#F2EEE7';
    const currentOpacity = nodeStyle?.opacity ?? 1;

    const updateStyle = (styleUpdates: Partial<ArchitectureNodeStyle>) => {
      onUpdateNodeData(selectedNode.id, {
        style: {
          ...nodeStyle,
          ...styleUpdates,
        },
      });
    };

    const handleResetStyle = () => {
      onUpdateNodeData(selectedNode.id, {
        style: {
          fillColor: undefined,
          borderColor: undefined,
          borderWidth: undefined,
          textColor: undefined,
          opacity: undefined,
        },
      });
    };

    return (
      <aside
        className="flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] overflow-y-auto"
        aria-label="Component properties and style inspector"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-serif text-base font-medium text-[var(--color-text)]">Component Inspector</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close component inspector"
              className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isEditable && (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-[#D6B887]">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Read-Only mode. Component properties cannot be edited.</span>
          </div>
        )}

        <div className="mt-4 flex-1 space-y-4">
          {/* Header Card */}
          <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
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
              <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)] truncate max-w-[170px]">
                {selectedNode.id}
              </p>
            </div>
          </div>

          {/* Label Input */}
          <div>
            <label htmlFor="node-name-input" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Component Name *
            </label>
            <input
              id="node-name-input"
              type="text"
              disabled={!isEditable}
              required
              placeholder="e.g. Auth Service"
              value={selectedNode.data.label || ''}
              onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
            />
          </div>

          {/* Styling Controls Section */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              <span>Visual Appearance</span>
            </h4>

            {/* Fill Color */}
            <div>
              <label className="block text-[11px] font-mono font-medium text-[var(--color-text-muted)] mb-1">
                Fill Background
              </label>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Component fill color">
                {APPROVED_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={!isEditable}
                    onClick={() => updateStyle({ fillColor: c.value })}
                    title={c.label}
                    aria-label={`Set fill color to ${c.label}`}
                    className={`h-6 w-6 rounded border shadow-xs transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center ${
                      currentFill === c.value ? 'ring-2 ring-[var(--color-accent)] scale-110' : 'border-[var(--color-border)]'
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    {currentFill === c.value && (
                      <Check className="h-3 w-3 text-white dark:text-[#11110F] drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Color */}
            <div>
              <label className="block text-[11px] font-mono font-medium text-[var(--color-text-muted)] mb-1">
                Border Color
              </label>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Component border color">
                {APPROVED_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={!isEditable}
                    onClick={() => updateStyle({ borderColor: c.value })}
                    title={c.label}
                    aria-label={`Set border color to ${c.label}`}
                    className={`h-6 w-6 rounded border shadow-xs transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center ${
                      currentBorder === c.value ? 'ring-2 ring-[var(--color-accent)] scale-110' : 'border-[var(--color-border)]'
                    }`}
                    style={{ backgroundColor: c.value }}
                  >
                    {currentBorder === c.value && (
                      <Check className="h-3 w-3 text-white dark:text-[#11110F] drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Width */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="node-border-width-range" className="text-[11px] font-mono font-medium text-[var(--color-text-muted)]">
                  Border Width
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">{currentBorderWidth}px</span>
              </div>
              <input
                id="node-border-width-range"
                type="range"
                min={1}
                max={4}
                step={1}
                disabled={!isEditable}
                value={currentBorderWidth}
                onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
                className="w-full accent-[var(--color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-[11px] font-mono font-medium text-[var(--color-text-muted)] mb-1">
                Text Color
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => updateStyle({ textColor: resolvedTheme === 'light' ? '#18181B' : '#F2EEE7' })}
                  className={`flex-1 rounded border px-2 py-1 text-xs font-mono ${
                    currentTextColor === (resolvedTheme === 'light' ? '#18181B' : '#F2EEE7')
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-text)] font-semibold'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  Architectural Default
                </button>
                <button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => updateStyle({ textColor: '#B99D73' })}
                  className={`flex-1 rounded border px-2 py-1 text-xs font-mono ${
                    currentTextColor === '#B99D73'
                      ? 'border-[#B99D73] bg-[#B99D73]/25 text-[#B99D73] font-semibold'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  Warm Bronze
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="node-opacity-range" className="text-[11px] font-mono font-medium text-[var(--color-text-muted)]">
                  Opacity
                </label>
                <span className="text-xs font-mono text-[var(--color-accent)]">{Math.round(currentOpacity * 100)}%</span>
              </div>
              <input
                id="node-opacity-range"
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                disabled={!isEditable}
                value={currentOpacity}
                onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
                className="w-full accent-[var(--color-accent)] disabled:opacity-50"
              />
            </div>

            {/* Reset Node Style */}
            {isEditable && (
              <button
                type="button"
                onClick={handleResetStyle}
                aria-label="Reset component to default style"
                className="w-full flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Style to Default</span>
              </button>
            )}
          </div>

          {/* Technology & Category Section */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
            <div>
              <label htmlFor="node-tech-input" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Technology Stack
              </label>
              <input
                id="node-tech-input"
                type="text"
                disabled={!isEditable}
                placeholder="e.g. Node.js, PostgreSQL, Redis..."
                value={selectedNode.data.technology || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { technology: e.target.value })}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="node-category-input" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Category
              </label>
              <input
                id="node-category-input"
                type="text"
                disabled={!isEditable}
                placeholder="e.g. Core, Storage, Edge..."
                value={selectedNode.data.category || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { category: e.target.value })}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="node-desc-textarea" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
                Description
              </label>
              <textarea
                id="node-desc-textarea"
                rows={2}
                disabled={!isEditable}
                placeholder="Responsibilities, endpoints, data stores..."
                value={selectedNode.data.description || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* Delete Node Action */}
          {isEditable && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                aria-label="Delete component"
                className="w-full flex items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-500/20 transition-colors focus:ring-2 focus:ring-red-400"
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

  // 4. CANVAS APPEARANCE VIEW (When no node or edge is selected)
  const currentGridType = canvasSettings?.gridType || 'dots';
  const currentGridSpacing = canvasSettings?.gridSpacing ?? 20;
  const isGridVisible = canvasSettings?.gridVisible !== false;
  const isSnapToGrid = Boolean(canvasSettings?.snapToGrid);
  const defaultBg = resolvedTheme === 'light' ? '#F8F7F4' : '#090907';
  const currentBgColor = canvasSettings?.backgroundColor || defaultBg;

  const bgOptions =
    resolvedTheme === 'light'
      ? [
          { label: 'Ivory Studio', value: '#F8F7F4' },
          { label: 'Pure White', value: '#FFFFFF' },
          { label: 'Warm Ash', value: '#EBE8E0' },
        ]
      : [
          { label: 'Deep Architectural', value: '#090907' },
          { label: 'Surface Obsidian', value: '#11110F' },
          { label: 'Warm Charcoal', value: '#141310' },
        ];

  return (
    <aside
      className="flex h-full w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text)] overflow-y-auto"
      aria-label="Canvas appearance and grid settings inspector"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Grid className="h-4 w-4 text-[var(--color-accent)]" />
          <h3 className="font-serif text-base font-medium text-[var(--color-text)]">Canvas Appearance</h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close canvas settings"
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isEditable && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-[#D6B887]">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Read-Only mode. Canvas settings cannot be modified.</span>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {/* Canvas Background Color */}
        <div>
          <label className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] mb-1.5">
            Canvas Background
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Canvas background color">
            {bgOptions.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={!isEditable}
                onClick={() => onUpdateCanvasSettings?.({ backgroundColor: c.value })}
                title={c.label}
                aria-label={`Set canvas background to ${c.label}`}
                className={`h-7 px-3 rounded border text-xs font-mono transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                  currentBgColor === c.value
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 font-semibold text-[var(--color-text)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: c.value }} />
                <span>{c.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid Type: Dotted, Lines, Cross, None */}
        <div>
          <label htmlFor="canvas-grid-type-select" className="block text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
            Grid Style
          </label>
          <select
            id="canvas-grid-type-select"
            disabled={!isEditable}
            value={currentGridType}
            onChange={(e) =>
              onUpdateCanvasSettings?.({
                gridType: e.target.value as 'dots' | 'lines' | 'cross' | 'none',
              })
            }
            className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50 font-mono"
          >
            <option value="dots">Dotted Grid (Default)</option>
            <option value="lines">Line Grid</option>
            <option value="cross">Cross Grid</option>
            <option value="none">Plain (No Grid)</option>
          </select>
        </div>

        {/* Grid Spacing */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="canvas-grid-spacing-range" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
              Grid Spacing
            </label>
            <span className="text-xs font-mono text-[var(--color-accent)]">{currentGridSpacing}px</span>
          </div>
          <input
            id="canvas-grid-spacing-range"
            type="range"
            min={10}
            max={50}
            step={5}
            disabled={!isEditable}
            value={currentGridSpacing}
            onChange={(e) => onUpdateCanvasSettings?.({ gridSpacing: Number(e.target.value) })}
            className="w-full accent-[var(--color-accent)] disabled:opacity-50"
          />
        </div>

        {/* Grid Visibility Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label htmlFor="canvas-grid-visible-toggle" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)]">
            Show Grid Pattern
          </label>
          <input
            id="canvas-grid-visible-toggle"
            type="checkbox"
            disabled={!isEditable}
            checked={isGridVisible}
            onChange={(e) => onUpdateCanvasSettings?.({ gridVisible: e.target.checked })}
            className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] accent-[var(--color-accent)] disabled:opacity-50"
          />
        </div>

        {/* Snap to Grid Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <label htmlFor="canvas-snap-grid-toggle" className="text-xs font-mono font-semibold uppercase text-[var(--color-text-muted)] block">
              Snap to Grid
            </label>
            <span className="text-[10px] text-[var(--color-text-muted)]/70">Align node movement to grid units</span>
          </div>
          <input
            id="canvas-snap-grid-toggle"
            type="checkbox"
            disabled={!isEditable}
            checked={isSnapToGrid}
            onChange={(e) => onUpdateCanvasSettings?.({ snapToGrid: e.target.checked })}
            className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] accent-[var(--color-accent)] disabled:opacity-50"
          />
        </div>

        {/* Reset Canvas Appearance Defaults */}
        {isEditable && (
          <div className="pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onResetCanvasSettings}
              aria-label="Reset canvas appearance to defaults"
              className="w-full flex items-center justify-center gap-1.5 rounded border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Canvas Defaults</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
