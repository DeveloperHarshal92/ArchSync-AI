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
  reactFlowToArchitecture,
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
import { AIAssistantPanel } from './AIAssistantPanel';
import { ExportMenu } from './ExportMenu';
import { getNodeVisual } from '../../lib/architecture/nodeIcons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectSelectedNodeId,
  selectSelectedEdgeId,
  selectCurrentVersion,
  selectPersistenceStatus,
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
  selectAiPanelOpen,
  setAiPanelOpen,
} from '../../store/slices/uiSlice';
import { Link } from 'react-router-dom';
import { useArchitectureAutosave } from '../../hooks/useArchitectureAutosave';
import { useProjectCollaboration } from '../../hooks/useProjectCollaboration';
import { useValidateArchitectureMutation } from '../../store/api/architectureApi';
import { ArchitectureValidationResult } from '@archsync/shared';
import {
  Sliders,
  ShieldCheck,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  X,
  ArrowLeft,
  Edit2,
  Users,
} from 'lucide-react';

export interface ArchitectureCanvasProps {
  initialArchitecture: Architecture;
  initialValidation?: ArchitectureValidationResult;
  projectName?: string;
  projectDescription?: string;
  isEditable: boolean;
  currentUserRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
  membersCount?: number;
  onOpenMembersModal?: () => void;
  onRenameProject?: (newName: string) => Promise<void> | void;
  onArchitectureChange?: (nodes: AppNode[], edges: AppEdge[]) => void;
  onReload?: () => void;
}

const nodeTypes: NodeTypes = {
  architectureNode: ArchitectureNodeComponent as unknown as React.ComponentType<any>,
};

const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  initialArchitecture,
  initialValidation,
  projectName,
  projectDescription,
  isEditable,
  currentUserRole,
  membersCount,
  onOpenMembersModal,
  onRenameProject,
  onArchitectureChange,
  onReload,
}) => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const selectedEdgeId = useAppSelector(selectSelectedEdgeId);
  const currentVersion = useAppSelector(selectCurrentVersion);
  const persistenceStatus = useAppSelector(selectPersistenceStatus);
  const detailsPanelOpen = useAppSelector(selectDetailsPanelOpen);
  const validationPanelOpen = useAppSelector(selectValidationPanelOpen);
  const aiPanelOpen = useAppSelector(selectAiPanelOpen);

  const isAutosavePending = persistenceStatus === 'dirty' || persistenceStatus === 'saving';

  // F14: Mobile panel drawer state
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const mobilePanelId = 'canvas-mobile-panel';

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const isRemoteChangeRef = useRef<boolean>(false);

  // Studio project title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(projectName || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(projectName || '');
  }, [projectName]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== projectName && onRenameProject) {
      await onRenameProject(trimmed);
    } else {
      setTitleDraft(projectName || '');
    }
  };

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
          stroke: '#ef8557',
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
                stroke: '#ef8557',
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

  // F14 & Phase 2B: Keyboard placement of focused component onto canvas center
  const handleAddNodeFromKeyboard = useCallback(
    (type: ArchitectureNodeType) => {
      if (!isEditable) return;
      const catalogDef = NODE_CATALOG[type];
      if (!catalogDef) return;

      const canvasRect = canvasContainerRef.current?.getBoundingClientRect();
      const centerX = canvasRect ? canvasRect.left + canvasRect.width / 2 : window.innerWidth / 2;
      const centerY = canvasRect ? canvasRect.top + canvasRect.height / 2 : window.innerHeight / 2;

      const flowPosition = screenToFlowPosition({
        x: centerX,
        y: centerY,
      });

      const newNodeId = generateNodeId(type);

      const newNode: AppNode = {
        id: newNodeId,
        type: 'architectureNode',
        position: {
          x: Math.round(flowPosition.x - 110),
          y: Math.round(flowPosition.y - 50),
        },
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
      dispatch(setDetailsPanelOpen(true));
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
          stroke: '#ef8557',
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
                stroke: '#ef8557',
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
    dispatch(setDetailsPanelOpen(false));
    dispatch(setAiPanelOpen(false));
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

  // F13: Obtains the live, unsaved in-memory architecture state directly from React Flow
  const getCurrentArchitecture = useCallback((): Architecture => {
    return reactFlowToArchitecture(
      initialArchitecture.projectId,
      nodes,
      edges,
      currentViewport,
      currentVersion
    );
  }, [initialArchitecture.projectId, nodes, edges, currentViewport, currentVersion]);

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden bg-[#eae6ed] select-none text-[#226192]"
      role="region"
      aria-label="Architecture canvas workspace"
    >
      {/* 1. Unified Studio Top Bar (48px / h-12) */}
      <header
        className="flex h-12 w-full shrink-0 items-center justify-between border-b border-[#226192]/15 bg-[#eae6ed]/95 px-3 backdrop-blur-md z-30 select-none text-[#226192]"
        role="banner"
        aria-label="ArchSync AI studio header"
      >
        {/* Left Zone: Back to Projects, Divider, Project Name (editable), Version badge, Role badge */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-[#226192]/70 hover:bg-[#226192]/5 hover:text-[#226192] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
            title="Back to All Projects"
            aria-label="Back to All Projects"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Projects</span>
          </Link>

          <div className="h-4 w-px bg-[#226192]/20 mx-0.5" aria-hidden="true" />

          {/* Project Name & Inline Editing */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                ref={titleInputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setTitleDraft(projectName || 'Untitled Architecture');
                  }
                }}
                onBlur={handleTitleSubmit}
                className="rounded border border-[#ef8557] bg-[#eae6ed] px-2 py-0.5 text-xs font-semibold text-[#226192] focus:outline-none focus:ring-1 focus:ring-[#ef8557]"
                aria-label="Edit project name"
              />
            </form>
          ) : (
            <div className="flex items-center gap-1.5 truncate">
              <h1
                className="font-serif text-sm sm:text-base font-semibold text-[#226192] tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]"
                title={projectName || 'Untitled Architecture'}
              >
                {projectName || 'Untitled Architecture'}
              </h1>
              {isEditable && onRenameProject && (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="rounded p-1 text-[#226192]/70 hover:bg-[#226192]/5 hover:text-[#226192] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
                  title="Rename project"
                  aria-label="Rename project"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Version badge */}
          <span
            className="hidden md:inline-flex items-center gap-1 rounded bg-[#eae6ed] border border-[#226192]/20 px-1.5 py-0.5 text-[10px] font-mono text-[#ef8557]"
            title={`Architecture Version ${currentVersion}`}
          >
            v{currentVersion}
          </span>

          {/* Access Role Badge */}
          {currentUserRole && (
            <span
              className={`hidden lg:inline-flex items-center gap-1 rounded border px-2 py-0.2 text-[10px] font-mono font-semibold uppercase ${
                currentUserRole === 'OWNER'
                  ? 'border-[#ef8557]/40 bg-[#ef8557]/15 text-[#ef8557]'
                  : currentUserRole === 'EDITOR'
                  ? 'border-[#226192]/40 bg-[#226192]/10 text-[#226192]'
                  : 'border-[#226192]/20 bg-[#eae6ed] text-[#226192]/70'
              }`}
            >
              <ShieldCheck className="h-2.5 w-2.5" />
              <span>{currentUserRole}</span>
            </span>
          )}
        </div>

        {/* Center Zone: Persistence Indicator + Team Members Trigger */}
        <div className="hidden sm:flex items-center gap-2">
          <PersistenceIndicator onRetry={saveNow} onReload={onReload} />

          {onOpenMembersModal && (
            <button
              type="button"
              onClick={onOpenMembersModal}
              aria-label={`Project members: ${membersCount ?? 0} collaborators`}
              className="flex items-center gap-1.5 rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2.5 py-1 text-xs text-[#226192] hover:border-[#226192]/40 hover:bg-[#226192]/5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
              title="Manage project members and access"
            >
              <Users className="h-3.5 w-3.5 text-[#ef8557]" aria-hidden="true" />
              <span className="font-medium">Team</span>
              {membersCount !== undefined && (
                <span className="rounded bg-[#226192]/10 border border-[#226192]/20 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-[#226192]">
                  {membersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Zone: Collaboration Indicator, Validate, AI Assistant, Export Menu, Properties toggle, Mobile toggle */}
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="toolbar"
          aria-label="Canvas action toolbar"
        >
          <CollaborationIndicator />

          <div className="hidden sm:block h-4 w-px bg-[#226192]/20" aria-hidden="true" />

          {/* Validate Button */}
          <button
            type="button"
            onClick={handleValidate}
            data-testid="canvas-validate-btn"
            aria-label={`Validate architecture${validationResult && validationResult.issues.length > 0 ? ` — ${validationResult.issues.length} issue${validationResult.issues.length > 1 ? 's' : ''} found` : ''}`}
            aria-busy={isValidating}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557] ${
              validationPanelOpen
                ? 'border-[#ef8557] bg-[#226192] text-[#eae6ed]'
                : 'border-[#226192]/20 bg-[#eae6ed] text-[#226192] hover:bg-[#226192]/5'
            }`}
          >
            <ShieldCheck
              className={`h-3.5 w-3.5 ${
                isValidating
                  ? 'animate-spin text-[#ef8557]'
                  : validationResult && !validationResult.valid
                  ? 'text-[#ef8557]'
                  : validationResult && validationResult.issues.length > 0
                  ? 'text-[#ef8557]'
                  : 'text-[#226192]'
              }`}
              aria-hidden="true"
            />
            <span className="hidden md:inline">Validate</span>
            {validationResult && validationResult.issues.length > 0 && (
              <span
                aria-hidden="true"
                className="rounded px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#ef8557]/20 text-[#ef8557]"
              >
                {validationResult.issues.length}
              </span>
            )}
          </button>

          {/* AI Assistant Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (aiPanelOpen) {
                dispatch(setAiPanelOpen(false));
              } else {
                dispatch(setValidationPanelOpen(false));
                dispatch(setDetailsPanelOpen(false));
                dispatch(setAiPanelOpen(true));
              }
            }}
            data-testid="canvas-ai-assistant-btn"
            aria-label={aiPanelOpen ? 'Close AI Architecture Assistant panel' : 'Open AI Architecture Assistant panel'}
            aria-expanded={aiPanelOpen}
            aria-controls="canvas-ai-panel"
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557] ${
              aiPanelOpen
                ? 'border-[#ef8557] bg-[#ef8557]/15 text-[#226192]'
                : 'border-[#226192]/20 bg-[#eae6ed] text-[#226192] hover:bg-[#226192]/5'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ef8557]" aria-hidden="true" />
            <span className="hidden md:inline">AI Co-Pilot</span>
          </button>

          {/* Export Menu */}
          <ExportMenu
            getCurrentArchitecture={getCurrentArchitecture}
            projectName={projectName}
            projectDescription={projectDescription}
            isAutosavePending={isAutosavePending}
          />

          {/* Properties Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (detailsPanelOpen) {
                dispatch(setDetailsPanelOpen(false));
              } else {
                dispatch(setValidationPanelOpen(false));
                dispatch(setAiPanelOpen(false));
                dispatch(setDetailsPanelOpen(true));
              }
            }}
            aria-label={detailsPanelOpen ? 'Close properties panel' : 'Open node properties panel'}
            aria-expanded={detailsPanelOpen}
            aria-controls="canvas-details-panel"
            className={`hidden md:flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557] ${
              detailsPanelOpen
                ? 'border-[#ef8557] bg-[#226192] text-[#eae6ed]'
                : 'border-[#226192]/20 bg-[#eae6ed] text-[#226192] hover:bg-[#226192]/5'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-[#ef8557]" aria-hidden="true" />
            <span className="hidden lg:inline">Properties</span>
          </button>

          {/* Mobile panel toggle — visible only on small screens */}
          <button
            type="button"
            onClick={() => setMobilePanelOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-[#226192]/20 bg-[#eae6ed] px-2 py-1 text-xs font-medium text-[#226192] hover:bg-[#226192]/5 md:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ef8557]"
            aria-label={mobilePanelOpen ? 'Close side panel' : 'Open side panel'}
            aria-expanded={mobilePanelOpen}
            aria-controls={mobilePanelId}
          >
            {mobilePanelOpen ? (
              <PanelRightClose className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">{mobilePanelOpen ? 'Close panel' : 'Open panel'}</span>
          </button>
        </div>
      </header>

      {/* 2. Studio Body (Palette + Canvas + Unified Context Drawer) */}
      <div className="flex-1 min-h-0 flex w-full relative overflow-hidden">
        {/* Left: Categorized Component Palette (240px wide) */}
        <div className="hidden lg:block w-60 shrink-0 h-full z-20" aria-label="Component palette">
          <ComponentPalette
            isEditable={isEditable}
            onSelectComponent={handleAddNodeFromKeyboard}
          />
        </div>

        {/* Center: Interactive Canvas */}
        <div
          ref={canvasContainerRef}
          onMouseMove={handleCanvasMouseMove}
          className="relative flex-1 h-full w-full bg-[#eae6ed] min-w-0"
        >
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
              color="rgba(34, 97, 146, 0.15)"
            />

            <Controls
              showInteractive={isEditable}
              className="!rounded-lg !border !border-[#226192]/20 !bg-[#eae6ed]/95 !fill-[#226192] text-[#226192] shadow-sm"
            />

            <MiniMap
              zoomable
              pannable
              nodeColor={(n) => {
                const type = (n.data as unknown as CustomNodeData)?.nodeType;
                return type ? getNodeVisual(type).accentColor : '#226192';
              }}
              maskColor="rgba(34, 97, 146, 0.15)"
              className="!rounded-lg !border !border-[#226192]/20 !bg-[#eae6ed]/95 shadow-sm"
            />
          </ReactFlow>
        </div>

        {/* Right: Unified Context Drawer Container (mutually exclusive) */}
        {aiPanelOpen ? (
          <aside
            id="canvas-ai-panel"
            className="hidden md:block w-96 shrink-0 h-full border-l border-[#226192]/15 bg-[#eae6ed] z-20"
            aria-label="AI Architecture Assistant panel"
          >
            <AIAssistantPanel
              projectId={initialArchitecture.projectId}
              onClose={() => dispatch(setAiPanelOpen(false))}
              onSelectNode={handleSelectNodeFromValidation}
            />
          </aside>
        ) : validationPanelOpen ? (
          <aside
            className="hidden md:block w-84 shrink-0 h-full border-l border-[#226192]/15 bg-[#eae6ed] z-20"
            aria-label="Architecture validation results panel"
          >
            <ValidationPanel
              validationResult={validationResult ?? undefined}
              isValidating={isValidating}
              onValidate={handleValidate}
              onClose={() => dispatch(setValidationPanelOpen(false))}
              onSelectNode={handleSelectNodeFromValidation}
              onSelectEdge={handleSelectEdgeFromValidation}
            />
          </aside>
        ) : detailsPanelOpen ? (
          <aside
            id="canvas-details-panel"
            className="hidden md:block w-80 shrink-0 h-full border-l border-[#226192]/15 bg-[#eae6ed] z-20"
            aria-label="Node and edge properties panel"
          >
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
          </aside>
        ) : null}

        {/* Mobile Off-Canvas Drawer */}
        {mobilePanelOpen && (
          <>
            <div
              className="panel-drawer-backdrop md:hidden"
              aria-hidden="true"
              onClick={() => setMobilePanelOpen(false)}
            />
            <div
              id={mobilePanelId}
              className="absolute inset-y-0 right-0 z-50 w-80 max-w-[90vw] h-full border-l border-[#226192]/15 bg-[#eae6ed] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Canvas side panel"
            >
              <button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="absolute top-3 right-3 z-10 rounded-md p-1.5 text-[#226192]/70 hover:bg-[#226192]/5 hover:text-[#226192]"
                aria-label="Close side panel"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              {aiPanelOpen ? (
                <AIAssistantPanel
                  projectId={initialArchitecture.projectId}
                  onClose={() => { dispatch(setAiPanelOpen(false)); setMobilePanelOpen(false); }}
                  onSelectNode={handleSelectNodeFromValidation}
                />
              ) : validationPanelOpen ? (
                <ValidationPanel
                  validationResult={validationResult ?? undefined}
                  isValidating={isValidating}
                  onValidate={handleValidate}
                  onClose={() => { dispatch(setValidationPanelOpen(false)); setMobilePanelOpen(false); }}
                  onSelectNode={handleSelectNodeFromValidation}
                  onSelectEdge={handleSelectEdgeFromValidation}
                />
              ) : (
                <NodeDetailsPanel
                  selectedNode={selectedNode}
                  selectedEdge={selectedEdge}
                  isEditable={isEditable}
                  onUpdateNodeData={handleUpdateNodeData}
                  onDeleteNode={handleDeleteNode}
                  onUpdateEdgeData={handleUpdateEdgeData}
                  onDeleteEdge={handleDeleteEdge}
                  onClose={() => { dispatch(setDetailsPanelOpen(false)); setMobilePanelOpen(false); }}
                />
              )}
            </div>
          </>
        )}
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
