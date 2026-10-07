import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@xyflow/react';
import { Architecture, ArchitectureNodeType, NODE_CATALOG, EdgeType } from '@archsync/shared';
import {
  CustomNodeData,
  AppNode,
  AppEdge,
  architectureToReactFlow,
  generateNodeId,
  generateEdgeId,
} from '../../lib/architecture/adapters';
import { ArchitectureNodeComponent } from './ArchitectureNode';
import { ComponentPalette } from './ComponentPalette';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { ArchitectureEmptyState } from './ArchitectureEmptyState';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';

interface ArchitectureCanvasProps {
  initialArchitecture: Architecture;
  isEditable: boolean;
  onArchitectureChange?: (nodes: AppNode[], edges: AppEdge[]) => void;
}

const nodeTypes: NodeTypes = {
  architectureNode: ArchitectureNodeComponent as unknown as React.ComponentType<any>,
};

const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  initialArchitecture,
  isEditable,
  onArchitectureChange,
}) => {
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Convert domain architecture to React Flow nodes/edges
  const initialFlowData = useMemo(
    () => architectureToReactFlow(initialArchitecture),
    [initialArchitecture]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialFlowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>(initialFlowData.edges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Sync when initialArchitecture changes from server hydration
  useEffect(() => {
    const converted = architectureToReactFlow(initialArchitecture);
    setNodes(converted.nodes);
    setEdges(converted.edges);

    if (initialArchitecture.viewport) {
      setViewport(initialArchitecture.viewport);
    }
  }, [initialArchitecture, setNodes, setEdges, setViewport]);

  // Notify parent of state changes
  useEffect(() => {
    onArchitectureChange?.(nodes, edges);
  }, [nodes, edges, onArchitectureChange]);

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

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNodeId);
      setSelectedEdgeId(null);
    },
    [isEditable, screenToFlowPosition, setNodes]
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

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [isEditable, setEdges]
  );

  // Selection Tracking
  const onSelectionChange = useCallback((params: OnSelectionChangeParams<AppNode, AppEdge>) => {
    const node = params.nodes[0];
    const edge = params.edges[0];

    if (node) {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    } else if (edge) {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // Node Property Updates
  const handleUpdateNodeData = useCallback(
    (nodeId: string, updates: Partial<CustomNodeData>) => {
      if (!isEditable) return;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updates,
              },
            };
          }
          return n;
        })
      );
    },
    [isEditable, setNodes]
  );

  // Node Deletion (and all connected edges)
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!isEditable) return;

      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [isEditable, setNodes, setEdges]
  );

  // Edge Property Updates
  const handleUpdateEdgeData = useCallback(
    (edgeId: string, updates: { label?: string; edgeType?: EdgeType; animated?: boolean }) => {
      if (!isEditable) return;

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const newType = updates.edgeType ?? e.data?.edgeType ?? 'default';
            const isAnimated = updates.animated ?? e.animated ?? newType === 'animated';
            const isDashed = newType === 'dashed';

            return {
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
          }
          return e;
        })
      );
    },
    [isEditable, setEdges]
  );

  // Edge Deletion
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      if (!isEditable) return;

      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setSelectedEdgeId(null);
    },
    [isEditable, setEdges]
  );

  return (
    <div className="flex h-[720px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 1. Component Palette (Left Panel) */}
      <div className="hidden lg:block w-72 shrink-0 h-full">
        <ComponentPalette isEditable={isEditable} />
      </div>

      {/* 2. Interactive Canvas (Center Area) */}
      <div className="relative flex-1 h-full w-full bg-[#0a0f1d]">
        {nodes.length === 0 && <ArchitectureEmptyState isEditable={isEditable} />}

        <ReactFlow<AppNode, AppEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={isEditable ? onNodesChange : undefined}
          onEdgesChange={isEditable ? onEdgesChange : undefined}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onSelectionChange={onSelectionChange}
          onPaneClick={onPaneClick}
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

      {/* 3. Details Panel (Right Panel) */}
      <div className="hidden md:block w-80 shrink-0 h-full">
        <NodeDetailsPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          isEditable={isEditable}
          onUpdateNodeData={handleUpdateNodeData}
          onDeleteNode={handleDeleteNode}
          onUpdateEdgeData={handleUpdateEdgeData}
          onDeleteEdge={handleDeleteEdge}
        />
      </div>
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
