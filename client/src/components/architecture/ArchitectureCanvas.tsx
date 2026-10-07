import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  NodeTypes,
  OnSelectionChangeParams,
  Viewport,
} from '@xyflow/react';
import { Architecture, ArchitectureNodeType, NODE_CATALOG, EdgeType, ArchitectureNode, ArchitectureEdge } from '@archsync/shared';
import {
  CustomNodeData,
  AppNode,
  AppEdge,
  architectureToReactFlow,
  appNodeToArchitectureNode,
  appEdgeToArchitectureEdge,
  generateNodeId,
  generateEdgeId,
} from '../../lib/architecture/adapters';
import { ArchitectureNodeComponent } from './ArchitectureNode';
import { ComponentPalette } from './ComponentPalette';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { ArchitectureEmptyState } from './ArchitectureEmptyState';
import { PersistenceIndicator } from './PersistenceIndicator';
import { CollaborationIndicator } from './CollaborationIndicator';
import { RemoteCursorsOverlay } from './RemoteCursorsOverlay';
import { ValidationPanel } from './ValidationPanel';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectSelectedNodeId,
  selectSelectedEdgeId,
  selectCurrentVersion,
  setSelectedNodeId,
  setSelectedEdgeId,
  clearSelection,
  setCurrentVersion,
} from '../../store/slices/editorSlice';
import {
  selectDetailsPanelOpen,
  setDetailsPanelOpen,
  selectValidationPanelOpen,
  setValidationPanelOpen,
} from '../../store/slices/uiSlice';
import { useArchitectureAutosave } from '../../hooks/useArchitectureAutosave';
import { useProjectCollaboration } from '../../hooks/useProjectCollaboration';
import { useValidateArchitectureMutation } from '../../store/api/architectureApi';
import { ArchitectureValidationResult } from '@archsync/shared';
import { Sliders, ShieldCheck } from 'lucide-react';

interface ArchitectureCanvasProps {
  initialArchitecture: Architecture;
  initialValidation?: ArchitectureValidationResult;
  isEditable: boolean;
  onArchitectureChange?: (nodes: AppNode[], edges: AppEdge[]) => void;
  onReload?: () => void;
}

const nodeTypes: NodeTypes = {
  architectureNode: ArchitectureNodeComponent as unknown as React.ComponentType<any>,
};

const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  initialArchitecture,
  initialValidation,
  isEditable,
  onArchitectureChange,
  onReload,
}) => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const selectedEdgeId = useAppSelector(selectSelectedEdgeId);
  const currentVersion = useAppSelector(selectCurrentVersion);
  const detailsPanelOpen = useAppSelector(selectDetailsPanelOpen);
  const validationPanelOpen = useAppSelector(selectValidationPanelOpen);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const isRemoteChangeRef = useRef<boolean>(false);

  const { screenToFlowPosition, setViewport, setCenter } = useReactFlow();

  // F11: Architecture validation state & mutation
  const [validateMutation, { isLoading: isValidating }] = useValidateArchitectureMutation();
  const [validationResult, setValidationResult] = useState<ArchitectureValidationResult | null>(
    initialValidation || null
  );

  useEffect(() => {
    if (initialValidation) {
      setValidationResult(initialValidation);
    }
  }, [initialValidation]);

  // Convert domain architecture to React Flow nodes/edges
  const initialFlowData = useMemo(
    () => architectureToReactFlow(initialArchitecture),
    [initialArchitecture]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialFlowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialFlowData.edges);

  const [currentViewport, setCurrentViewport] = useState<Viewport>(
    initialArchitecture.viewport || { x: 0, y: 0, zoom: 1 }
  );

  // F10: Real-time multi-user collaboration engine
  const {
    emitNodeCreate,
    emitNodeUpdate,
    emitNodeDelete,
    emitEdgeCreate,
    emitEdgeUpdate,
    emitEdgeDelete,
    emitCursorUpdate,
    emitSelectionUpdate,
  } = useProjectCollaboration({
    projectId: initialArchitecture.projectId,
    isEditable,
    currentVersion,
    onRemoteNodeCreate: (remoteNode) => {
      isRemoteChangeRef.current = true;
      const appNode: AppNode = {
        id: remoteNode.id,
        type: 'architectureNode',
        position: remoteNode.position,
        data: {
          label: remoteNode.data.label,
          description: remoteNode.data.description,
          technology: remoteNode.data.technology,
          category: remoteNode.data.category,
          nodeType: remoteNode.type,
        },
      };
      setNodes((nds) => [...nds.filter((n) => n.id !== remoteNode.id), appNode]);
    },
    onRemoteNodeUpdate: (remoteNode) => {
      isRemoteChangeRef.current = true;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === remoteNode.id) {
            return {
              ...n,
              position: remoteNode.position,
              data: {
                ...n.data,
                label: remoteNode.data.label,
                description: remoteNode.data.description,
                technology: remoteNode.data.technology,
                category: remoteNode.data.category,
                nodeType: remoteNode.type,
              },
            };
          }
          return n;
        })
      );
    },
    onRemoteNodeDelete: (nodeId) => {
      isRemoteChangeRef.current = true;
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    onRemoteEdgeCreate: (remoteEdge) => {
      isRemoteChangeRef.current = true;
      const isDashed = remoteEdge.type === 'dashed';
      const appEdge: AppEdge = {
        id: remoteEdge.id,
        source: remoteEdge.source,
        target: remoteEdge.target,
        type: 'default',
        label: remoteEdge.label,
        animated: Boolean(remoteEdge.animated),
        style: {
          strokeWidth: 2,
          stroke: '#06b6d4',
          ...(isDashed ? { strokeDasharray: '5,5' } : {}),
        },
        data: {
          edgeType: (remoteEdge.type as EdgeType) || 'data-flow',
        },
      };
      setEdges((eds) => [...eds.filter((e) => e.id !== remoteEdge.id), appEdge]);
    },
    onRemoteEdgeUpdate: (remoteEdge) => {
      isRemoteChangeRef.current = true;
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === remoteEdge.id) {
            const isDashed = remoteEdge.type === 'dashed';
            return {
              ...e,
              label: remoteEdge.label,
              animated: Boolean(remoteEdge.animated),
              style: {
                ...e.style,
                strokeWidth: 2,
                stroke: '#06b6d4',
                ...(isDashed ? { strokeDasharray: '5,5' } : { strokeDasharray: undefined }),
              },
              data: {
                ...e.data,
                edgeType: (remoteEdge.type as EdgeType) || 'data-flow',
              },
            };
          }
          return e;
        })
      );
    },
    onRemoteEdgeDelete: (edgeId) => {
      isRemoteChangeRef.current = true;
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    onRemoteProjectState: (state) => {
      isRemoteChangeRef.current = true;
      const converted = architectureToReactFlow(state as any);
      setNodes(converted.nodes);
      setEdges(converted.edges);
      if (state.viewport) {
        setViewport(state.viewport);
        setCurrentViewport(state.viewport);
      }
      dispatch(setCurrentVersion(state.version));
    },
  });

  // Sync when initialArchitecture changes from server hydration
  useEffect(() => {
    const converted = architectureToReactFlow(initialArchitecture);
    setNodes(converted.nodes);
    setEdges(converted.edges);

    if (initialArchitecture.viewport) {
      setViewport(initialArchitecture.viewport);
      setCurrentViewport(initialArchitecture.viewport);
    }
  }, [initialArchitecture, setNodes, setEdges, setViewport]);

  // Clean up canvas selection upon unmount
  useEffect(() => {
    return () => {
      dispatch(clearSelection());
    };
  }, [dispatch]);

  // Notify parent of state changes
  useEffect(() => {
    onArchitectureChange?.(nodes, edges);
  }, [nodes, edges, onArchitectureChange]);

  // Track viewport movements when pan/zoom stabilizes
  const onMoveEnd = useCallback((_event: unknown, vp: Viewport) => {
    setCurrentViewport(vp);
  }, []);

  // F09: Debounced autosave controller
  const { saveNow } = useArchitectureAutosave({
    projectId: initialArchitecture.projectId,
    initialArchitecture,
    nodes,
    edges,
    viewport: currentViewport,
    isEditable,
    debounceMs: 1000,
    isRemoteChangeRef,
  });

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  // Handle Drag Over Canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle Dropping Component from Palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!isEditable) return;

      const type = event.dataTransfer.getData('application/reactflow') as ArchitectureNodeType;
      if (!type || !NODE_CATALOG[type]) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const catalogDef = NODE_CATALOG[type];
      const newNodeId = generateNodeId(type);

      const newNode: AppNode = {
        id: newNodeId,
        type: 'architectureNode',
        position,
        data: {
          label: catalogDef.label,
          description: catalogDef.description,
          category: catalogDef.category,
          nodeType: type,
        },
      };

      const domainNode = appNodeToArchitectureNode(newNode);

      setNodes((nds) => [...nds, newNode]);
      dispatch(setSelectedNodeId(newNodeId));
      emitNodeCreate(domainNode);
    },
    [isEditable, screenToFlowPosition, setNodes, dispatch, emitNodeCreate]
  );

  // Handle Connecting Two Nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isEditable) return;

      // Reject self-loops (source === target)
      if (connection.source === connection.target) {
        return;
      }

      if (!connection.source || !connection.target) {
        return;
      }

      const edgeId = generateEdgeId(connection.source, connection.target);

      const newEdge: AppEdge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'default',
        style: {
          strokeWidth: 2,
          stroke: '#06b6d4',
        },
        data: {
          edgeType: 'default',
        },
      };

      const domainEdge = appEdgeToArchitectureEdge(newEdge);

      setEdges((eds) => addEdge(newEdge, eds));
      emitEdgeCreate(domainEdge);
    },
    [isEditable, setEdges, emitEdgeCreate]
  );

  // Selection Tracking coordinated via Redux editorSlice
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams<AppNode, AppEdge>) => {
      const node = params.nodes[0];
      const edge = params.edges[0];

      if (node) {
        dispatch(setSelectedNodeId(node.id));
        emitSelectionUpdate(node.id);
      } else if (edge) {
        dispatch(setSelectedEdgeId(edge.id));
        emitSelectionUpdate(null);
      } else {
        dispatch(clearSelection());
        emitSelectionUpdate(null);
      }
    },
    [dispatch, emitSelectionUpdate]
  );

  const onPaneClick = useCallback(() => {
    dispatch(clearSelection());
    emitSelectionUpdate(null);
  }, [dispatch, emitSelectionUpdate]);

  // Node Drag Stop - Emit authoritative node position after user drag
  const onNodeDragStop = useCallback(
    (_event: unknown, node: AppNode) => {
      if (!isEditable) return;
      const domainNode = appNodeToArchitectureNode(node);
      emitNodeUpdate(domainNode);
    },
    [isEditable, emitNodeUpdate]
  );

  // Node Property Updates
  const handleUpdateNodeData = useCallback(
    (nodeId: string, updates: Partial<CustomNodeData>) => {
      if (!isEditable) return;

      let updatedDomainNode: ArchitectureNode | null = null;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            const merged: AppNode = {
              ...n,
              data: {
                ...n.data,
                ...updates,
              },
            };

            updatedDomainNode = appNodeToArchitectureNode(merged);
            return merged;
          }
          return n;
        })
      );

      if (updatedDomainNode) {
        emitNodeUpdate(updatedDomainNode);
      }
    },
    [isEditable, setNodes, emitNodeUpdate]
  );

  // Node Deletion (and all connected edges)
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!isEditable) return;

      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      dispatch(clearSelection());
      emitNodeDelete(nodeId);
    },
    [isEditable, setNodes, setEdges, dispatch, emitNodeDelete]
  );

  // Edge Property Updates
  const handleUpdateEdgeData = useCallback(
    (edgeId: string, updates: { label?: string; edgeType?: EdgeType; animated?: boolean }) => {
      if (!isEditable) return;

      let updatedDomainEdge: ArchitectureEdge | null = null;

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const newType = updates.edgeType ?? e.data?.edgeType ?? 'default';
            const isAnimated = updates.animated ?? e.animated ?? newType === 'animated';
            const isDashed = newType === 'dashed';

            const merged: AppEdge = {
              ...e,
              label: updates.label !== undefined ? updates.label : e.label,
              animated: isAnimated,
              style: {
                ...e.style,
                strokeWidth: 2,
                stroke: '#06b6d4',
                ...(isDashed ? { strokeDasharray: '5,5' } : { strokeDasharray: undefined }),
              },
              data: {
                ...e.data,
                edgeType: newType,
              },
            };

            updatedDomainEdge = appEdgeToArchitectureEdge(merged);
            return merged;
          }
          return e;
        })
      );

      if (updatedDomainEdge) {
        emitEdgeUpdate(updatedDomainEdge);
      }
    },
    [isEditable, setEdges, emitEdgeUpdate]
  );

  // Edge Deletion
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (!isEditable) return;

      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      dispatch(clearSelection());
      emitEdgeDelete(edgeId);
    },
    [isEditable, setEdges, dispatch, emitEdgeDelete]
  );

  // F11: Handle validation invocation
  const handleValidate = useCallback(async () => {
    dispatch(setValidationPanelOpen(true));
    try {
      const draftNodes = nodes.map(appNodeToArchitectureNode);
      const draftEdges = edges.map(appEdgeToArchitectureEdge);

      const res = await validateMutation({
        projectId: initialArchitecture.projectId,
        graph: {
          nodes: draftNodes,
          edges: draftEdges,
        },
      }).unwrap();

      if (res && res.success && res.data) {
        setValidationResult(res.data);
      }
    } catch {
      // Handled cleanly
    }
  }, [dispatch, validateMutation, initialArchitecture.projectId, nodes, edges]);

  // F11: Focus on node when clicked from validation panel
  const handleSelectNodeFromValidation = useCallback(
    (nodeId: string) => {
      dispatch(setSelectedNodeId(nodeId));
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setCenter(targetNode.position.x + 100, targetNode.position.y + 40, { zoom: 1.2, duration: 400 });
      }
    },
    [dispatch, nodes, setCenter]
  );

  // F11: Select edge when clicked from validation panel
  const handleSelectEdgeFromValidation = useCallback(
    (edgeId: string) => {
      dispatch(setSelectedEdgeId(edgeId));
    },
    [dispatch]
  );

  // High-frequency canvas pointer movement emitting throttled cursor coordinates
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      emitCursorUpdate(e.clientX - rect.left, e.clientY - rect.top);
    },
    [emitCursorUpdate]
  );

  return (
    <div className="relative flex h-[720px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 1. Component Palette (Left Panel) */}
      <div className="hidden lg:block w-72 shrink-0 h-full">
        <ComponentPalette isEditable={isEditable} />
      </div>

      {/* 2. Interactive Canvas (Center Area) */}
      <div
        ref={canvasContainerRef}
        onMouseMove={handleCanvasMouseMove}
        className="relative flex-1 h-full w-full bg-[#0a0f1d]"
      >
        {/* Persistence Status Indicator in Top Left */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto">
          <PersistenceIndicator onRetry={saveNow} onReload={onReload} />
        </div>

        {/* Top-Right Control Toolbar: Collaboration Indicator + Validate Button + Properties Toggle Button */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
          <CollaborationIndicator />

          <button
            onClick={handleValidate}
            data-testid="canvas-validate-btn"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-md hover:bg-slate-800 hover:text-white transition-colors"
            title="Validate Architecture"
          >
            <ShieldCheck
              className={`h-3.5 w-3.5 ${
                isValidating
                  ? 'animate-spin text-cyan-400'
                  : validationResult && !validationResult.valid
                  ? 'text-rose-400'
                  : validationResult && validationResult.issues.length > 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            />
            <span>Validate</span>
            {validationResult && validationResult.issues.length > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  validationResult.valid === false
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {validationResult.issues.length}
              </span>
            )}
          </button>

          {!detailsPanelOpen && (
            <button
              onClick={() => {
                dispatch(setValidationPanelOpen(false));
                dispatch(setDetailsPanelOpen(true));
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-md hover:bg-slate-800 hover:text-white"
              title="Open Properties Panel"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Properties</span>
            </button>
          )}
        </div>

        {/* Ephemeral Collaborator Remote Cursors Overlay */}
        <RemoteCursorsOverlay />

        {nodes.length === 0 && <ArchitectureEmptyState isEditable={isEditable} />}

        <ReactFlow<AppNode, AppEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={isEditable ? onNodesChange : undefined}
          onEdgesChange={isEditable ? onEdgesChange : undefined}
          onNodeDragStop={isEditable ? onNodeDragStop : undefined}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
          onMoveEnd={onMoveEnd}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          elementsSelectable={true}
          deleteKeyCode={isEditable ? ['Backspace', 'Delete'] : null}
          fitView
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
          className="archsync-canvas"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color="#334155"
          />

          <Controls
            showInteractive={isEditable}
            className="!rounded-xl !border !border-slate-800 !bg-slate-900/90 !fill-slate-300 shadow-xl"
          />

          <MiniMap
            zoomable
            pannable
            nodeColor={(n) => {
              const type = (n.data as unknown as CustomNodeData)?.nodeType;
              return type ? getNodeVisual(type).accentColor : '#94a3b8';
            }}
            maskColor="rgba(10, 15, 29, 0.75)"
            className="!rounded-xl !border !border-slate-800 !bg-slate-950/90 shadow-xl"
          />
        </ReactFlow>
      </div>

      {/* 3. Right Side Panel Area (Validation Panel or Node Details Panel) */}
      {validationPanelOpen ? (
        <div className="hidden md:block w-84 shrink-0 h-full border-l border-slate-800/80">
          <ValidationPanel
            validationResult={validationResult}
            isValidating={isValidating}
            onValidate={handleValidate}
            onClose={() => dispatch(setValidationPanelOpen(false))}
            onSelectNode={handleSelectNodeFromValidation}
            onSelectEdge={handleSelectEdgeFromValidation}
          />
        </div>
      ) : detailsPanelOpen ? (
        <div className="hidden md:block w-80 shrink-0 h-full border-l border-slate-800/80">
          <NodeDetailsPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            isEditable={isEditable}
            onUpdateNodeData={handleUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onUpdateEdgeData={handleUpdateEdgeData}
            onDeleteEdge={handleDeleteEdge}
            onClose={() => dispatch(setDetailsPanelOpen(false))}
          />
        </div>
      ) : null}
    </div>
  );
};

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InnerArchitectureCanvas {...props} />
    </ReactFlowProvider>
  );
};
