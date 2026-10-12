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
import {
  Architecture,
  ArchitectureNodeType,
  NODE_CATALOG,
  EdgeType,
  ArchitectureNode,
  ArchitectureEdge,
  CanvasAppearance,
  ArchitectureNodeStyle,
  ArchitectureEdgeStyle,
} from '@archsync/shared';
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
  computeEdgeVisuals,
} from '../../lib/architecture/adapters';
import {
  AlignmentGuide,
  calculateSnapAndGuides,
  alignSelectedNodes,
  distributeSelectedNodes,
} from '../../lib/architecture/alignment';
import { AlignmentGuidesOverlay } from './AlignmentGuidesOverlay';
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
import { CommandPalette, CommandPaletteAction } from './CommandPalette';
import { PanelResizeHandle } from './PanelResizeHandle';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
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
  Command,
  Copy,
  Trash2,
  LayoutGrid,
  Eye,
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
  const { resolvedTheme } = useTheme();

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

  const [canvasSettings, setCanvasSettings] = useState<CanvasAppearance>(
    initialArchitecture.canvasSettings || {
      backgroundColor: '#090907',
      gridType: 'dots',
      gridSpacing: 20,
      gridVisible: true,
      snapToGrid: false,
    }
  );

  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<AppNode[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<AppEdge[]>([]);
  const loadedProjectIdRef = useRef<string | null>(null);

  const PANEL_WIDTHS_KEY = 'archsync_studio_panel_widths';
  const DEFAULT_LEFT_WIDTH = 256;
  const DEFAULT_RIGHT_WIDTH = 340;

  const [panelWidths, setPanelWidths] = useState<{ left: number; right: number }>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(PANEL_WIDTHS_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.left === 'number' && typeof parsed.right === 'number') {
          return {
            left: Math.max(200, Math.min(380, parsed.left)),
            right: Math.max(280, Math.min(520, parsed.right)),
          };
        }
      }
    } catch {
      // ignore
    }
    return { left: DEFAULT_LEFT_WIDTH, right: DEFAULT_RIGHT_WIDTH };
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const clipboardNodesRef = useRef<AppNode[]>([]);

  const handleResizeLeft = useCallback((w: number) => {
    setPanelWidths((prev) => {
      const maxAllowed = typeof window !== 'undefined' ? Math.max(200, window.innerWidth - prev.right - 320) : 380;
      const clamped = Math.max(200, Math.min(Math.min(380, maxAllowed), w));
      const next = { ...prev, left: clamped };
      try { localStorage.setItem(PANEL_WIDTHS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleResizeRight = useCallback((w: number) => {
    setPanelWidths((prev) => {
      const maxAllowed = typeof window !== 'undefined' ? Math.max(280, window.innerWidth - prev.left - 320) : 520;
      const clamped = Math.max(280, Math.min(Math.min(520, maxAllowed), w));
      const next = { ...prev, right: clamped };
      try { localStorage.setItem(PANEL_WIDTHS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const handleWindowResize = () => {
      setPanelWidths((prev) => {
        const available = window.innerWidth;
        const maxLeft = Math.max(200, available - prev.right - 320);
        const clampedLeft = Math.max(200, Math.min(Math.min(380, maxLeft), prev.left));
        const maxRight = Math.max(280, available - clampedLeft - 320);
        const clampedRight = Math.max(280, Math.min(Math.min(520, maxRight), prev.right));
        if (clampedLeft !== prev.left || clampedRight !== prev.right) {
          return { left: clampedLeft, right: clampedRight };
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

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
          style: remoteNode.style,
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
                style: remoteNode.style,
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
      const edgeType = (remoteEdge.type as EdgeType) || 'data-flow';
      const visuals = computeEdgeVisuals(edgeType, remoteEdge.animated, remoteEdge.style);

      const appEdge: AppEdge = {
        id: remoteEdge.id,
        source: remoteEdge.source,
        target: remoteEdge.target,
        type: visuals.reactFlowType,
        label: remoteEdge.label,
        animated: visuals.isAnimated,
        markerEnd: visuals.markerEnd,
        markerStart: visuals.markerStart,
        style: visuals.edgeStyle,
        data: {
          edgeType,
          style: remoteEdge.style,
        },
      };
      setEdges((eds) => [...eds.filter((e) => e.id !== remoteEdge.id), appEdge]);
    },
    onRemoteEdgeUpdate: (remoteEdge) => {
      isRemoteChangeRef.current = true;
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === remoteEdge.id) {
            const edgeType = (remoteEdge.type as EdgeType) || 'data-flow';
            const visuals = computeEdgeVisuals(edgeType, remoteEdge.animated, remoteEdge.style);

            return {
              ...e,
              type: visuals.reactFlowType,
              label: remoteEdge.label,
              animated: visuals.isAnimated,
              markerEnd: visuals.markerEnd,
              markerStart: visuals.markerStart,
              style: visuals.edgeStyle,
              data: {
                ...e.data,
                edgeType,
                style: remoteEdge.style,
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

  // Sync ONLY when project changes or initially mounting, to prevent overwriting local edits on save completion
  useEffect(() => {
    if (loadedProjectIdRef.current !== initialArchitecture.projectId) {
      loadedProjectIdRef.current = initialArchitecture.projectId;
      const converted = architectureToReactFlow(initialArchitecture);
      setNodes(converted.nodes);
      setEdges(converted.edges);

      if (initialArchitecture.viewport) {
        setViewport(initialArchitecture.viewport);
        setCurrentViewport(initialArchitecture.viewport);
      }
      if (initialArchitecture.canvasSettings) {
        setCanvasSettings(initialArchitecture.canvasSettings);
      }
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

  // F09: Debounced autosave controller with persistent styling and canvas settings
  const { saveNow } = useArchitectureAutosave({
    projectId: initialArchitecture.projectId,
    initialArchitecture,
    nodes,
    edges,
    viewport: currentViewport,
    canvasSettings,
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

  // Selection Tracking coordinated via Redux editorSlice & multi-selection state
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams<AppNode, AppEdge>) => {
      setSelectedNodes(params.nodes);
      setSelectedEdges(params.edges);

      const node = params.nodes[0];
      const edge = params.edges[0];

      if (params.nodes.length === 1) {
        dispatch(setSelectedNodeId(node.id));
        emitSelectionUpdate(node.id);
      } else if (params.nodes.length === 0 && params.edges.length === 1) {
        dispatch(setSelectedEdgeId(edge.id));
        emitSelectionUpdate(null);
      } else if (params.nodes.length > 1) {
        dispatch(setSelectedNodeId(null));
        dispatch(setSelectedEdgeId(null));
        emitSelectionUpdate(null);
      } else {
        dispatch(clearSelection());
        emitSelectionUpdate(null);
      }
    },
    [dispatch, emitSelectionUpdate]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
    dispatch(clearSelection());
    emitSelectionUpdate(null);
  }, [dispatch, emitSelectionUpdate]);

  // Node Dragging with Dynamic Alignment Guides
  const onNodeDrag = useCallback(
    (_event: unknown, node: AppNode) => {
      if (!isEditable) return;
      const snapResult = calculateSnapAndGuides(node, nodes, 6);
      setGuides(snapResult.guides);
    },
    [isEditable, nodes]
  );

  // Node Drag Stop - Clear temporary guides and emit authoritative node position
  const onNodeDragStop = useCallback(
    (_event: unknown, node: AppNode) => {
      setGuides([]);
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

  // Edge Property Updates with full persistent styling
  const handleUpdateEdgeData = useCallback(
    (
      edgeId: string,
      updates: {
        label?: string;
        edgeType?: EdgeType;
        animated?: boolean;
        style?: ArchitectureEdgeStyle;
      }
    ) => {
      if (!isEditable) return;

      let updatedDomainEdge: ArchitectureEdge | null = null;

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const newType = updates.edgeType ?? e.data?.edgeType ?? 'default';
            const isAnimated = updates.animated ?? e.animated ?? newType === 'animated';
            const newStyle = updates.style ?? e.data?.style;
            const visuals = computeEdgeVisuals(newType, isAnimated, newStyle);

            const merged: AppEdge = {
              ...e,
              label: updates.label !== undefined ? updates.label : e.label,
              type: visuals.reactFlowType,
              animated: visuals.isAnimated,
              markerEnd: visuals.markerEnd,
              markerStart: visuals.markerStart,
              style: visuals.edgeStyle,
              data: {
                ...e.data,
                edgeType: newType,
                style: newStyle,
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

  // Multi-node Batch Styling
  const handleBatchUpdateNodeStyle = useCallback(
    (nodeIds: string[], styleUpdates: Partial<ArchitectureNodeStyle>) => {
      if (!isEditable) return;
      setNodes((nds) =>
        nds.map((n) => {
          if (nodeIds.includes(n.id)) {
            const mergedStyle: ArchitectureNodeStyle = {
              ...n.data.style,
              ...styleUpdates,
            };
            const merged: AppNode = {
              ...n,
              data: {
                ...n.data,
                style: mergedStyle,
              },
            };
            emitNodeUpdate(appNodeToArchitectureNode(merged));
            return merged;
          }
          return n;
        })
      );
    },
    [isEditable, setNodes, emitNodeUpdate]
  );

  // Smart Alignment Handlers
  const handleAlignNodes = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (!isEditable) return;
      const targetIds = selectedNodes.map((n) => n.id);
      setNodes((nds) => {
        const aligned = alignSelectedNodes(nds, targetIds, alignment);
        aligned
          .filter((n) => targetIds.includes(n.id))
          .forEach((n) => emitNodeUpdate(appNodeToArchitectureNode(n)));
        return aligned;
      });
    },
    [isEditable, selectedNodes, setNodes, emitNodeUpdate]
  );

  const handleDistributeNodes = useCallback(
    (axis: 'horizontal' | 'vertical') => {
      if (!isEditable) return;
      const targetIds = selectedNodes.map((n) => n.id);
      setNodes((nds) => {
        const distributed = distributeSelectedNodes(nds, targetIds, axis);
        distributed
          .filter((n) => targetIds.includes(n.id))
          .forEach((n) => emitNodeUpdate(appNodeToArchitectureNode(n)));
        return distributed;
      });
    },
    [isEditable, selectedNodes, setNodes, emitNodeUpdate]
  );

  // Canvas Settings Handlers
  const handleUpdateCanvasSettings = useCallback(
    (updates: Partial<CanvasAppearance>) => {
      if (!isEditable) return;
      setCanvasSettings((prev) => ({ ...prev, ...updates }));
    },
    [isEditable]
  );

  const handleResetCanvasSettings = useCallback(() => {
    if (!isEditable) return;
    setCanvasSettings({
      backgroundColor: '#eae6ed',
      gridType: 'dots',
      gridSpacing: 20,
      gridVisible: true,
      snapToGrid: false,
    });
  }, [isEditable]);

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

  // Duplicate Selected Node(s)
  const handleDuplicateSelected = useCallback(() => {
    if (!isEditable) return;
    const nodesToDuplicate =
      selectedNodes.length > 0 ? selectedNodes : selectedNode ? [selectedNode] : [];

    if (nodesToDuplicate.length === 0) return;

    const newNodes: AppNode[] = [];
    const newDomainNodes: ArchitectureNode[] = [];

    for (const node of nodesToDuplicate) {
      const nodeType = (node.data.nodeType || node.type || 'server') as ArchitectureNodeType;
      const newId = generateNodeId(nodeType);
      const duplicatedNode: AppNode = {
        id: newId,
        type: 'architectureNode',
        position: {
          x: node.position.x + 30,
          y: node.position.y + 30,
        },
        data: {
          label: `${node.data.label} (Copy)`,
          description: node.data.description,
          technology: node.data.technology,
          category: node.data.category,
          nodeType: node.data.nodeType,
          style: node.data.style ? { ...node.data.style } : undefined,
        },
      };

      const domainNode = appNodeToArchitectureNode(duplicatedNode);
      newNodes.push(duplicatedNode);
      newDomainNodes.push(domainNode);
    }

    setNodes((nds) => [...nds, ...newNodes]);
    if (newNodes.length === 1) {
      dispatch(setSelectedNodeId(newNodes[0].id));
    } else {
      setSelectedNodes(newNodes);
    }

    for (const domainNode of newDomainNodes) {
      emitNodeCreate(domainNode);
    }
  }, [isEditable, selectedNodes, selectedNode, setNodes, dispatch, emitNodeCreate]);

  // Copy Selected Node(s)
  const handleCopySelected = useCallback(() => {
    const nodesToCopy =
      selectedNodes.length > 0 ? selectedNodes : selectedNode ? [selectedNode] : [];

    if (nodesToCopy.length === 0) return;
    clipboardNodesRef.current = nodesToCopy.map((n) => ({ ...n, data: { ...n.data } }));
  }, [selectedNodes, selectedNode]);

  // Paste Copied Node(s)
  const handlePasteCopied = useCallback(() => {
    if (!isEditable || clipboardNodesRef.current.length === 0) return;

    const pastedNodes: AppNode[] = [];
    const pastedDomainNodes: ArchitectureNode[] = [];

    for (const node of clipboardNodesRef.current) {
      const nodeType = (node.data.nodeType || node.type || 'server') as ArchitectureNodeType;
      const newId = generateNodeId(nodeType);
      const newNode: AppNode = {
        id: newId,
        type: 'architectureNode',
        position: {
          x: node.position.x + 30,
          y: node.position.y + 30,
        },
        data: {
          label: node.data.label,
          description: node.data.description,
          technology: node.data.technology,
          category: node.data.category,
          nodeType: node.data.nodeType,
          style: node.data.style ? { ...node.data.style } : undefined,
        },
      };

      const domainNode = appNodeToArchitectureNode(newNode);
      pastedNodes.push(newNode);
      pastedDomainNodes.push(domainNode);
    }

    clipboardNodesRef.current = clipboardNodesRef.current.map((n) => ({
      ...n,
      position: { x: n.position.x + 30, y: n.position.y + 30 },
    }));

    setNodes((nds) => [...nds, ...pastedNodes]);
    if (pastedNodes.length === 1) {
      dispatch(setSelectedNodeId(pastedNodes[0].id));
    } else {
      setSelectedNodes(pastedNodes);
    }

    for (const domainNode of pastedDomainNodes) {
      emitNodeCreate(domainNode);
    }
  }, [isEditable, setNodes, dispatch, emitNodeCreate]);

  // Delete Selected Node(s) or Edge(s)
  const handleDeleteSelected = useCallback(() => {
    if (!isEditable) return;
    if (selectedNodes.length > 0) {
      const idsToDelete = selectedNodes.map((n) => n.id);
      setNodes((nds) => nds.filter((n) => !idsToDelete.includes(n.id)));
      setEdges((eds) =>
        eds.filter((e) => !idsToDelete.includes(e.source) && !idsToDelete.includes(e.target))
      );
      dispatch(clearSelection());
      setSelectedNodes([]);
      idsToDelete.forEach((id) => emitNodeDelete(id));
    } else if (selectedNodeId) {
      handleDeleteNode(selectedNodeId);
    } else if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map((e) => e.id);
      setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id)));
      dispatch(clearSelection());
      setSelectedEdges([]);
      edgeIds.forEach((id) => emitEdgeDelete(id));
    } else if (selectedEdgeId) {
      handleDeleteEdge(selectedEdgeId);
    }
  }, [
    isEditable,
    selectedNodes,
    selectedNodeId,
    selectedEdges,
    selectedEdgeId,
    handleDeleteNode,
    handleDeleteEdge,
    emitNodeDelete,
    emitEdgeDelete,
    dispatch,
  ]);

  // Global Keyboard Shortcuts (Duplicate, Copy, Paste, Delete, Esc, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          if (e.key === 'Escape') {
            (activeEl as HTMLElement).blur();
          }
          return;
        }
        if (activeEl.getAttribute('contenteditable') === 'true') {
          return;
        }
        if (activeEl.closest('[data-testid="ai-assistant-panel"]')) {
          return;
        }
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Command Palette (Ctrl/Cmd + K)
      if (isCtrlOrMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Duplicate (Ctrl/Cmd + D)
      if (isCtrlOrMeta && e.key.toLowerCase() === 'd') {
        const hasSelected = selectedNodes.length > 0 || Boolean(selectedNodeId);
        if (hasSelected && isEditable) {
          e.preventDefault();
          handleDuplicateSelected();
          return;
        }
      }

      // Copy (Ctrl/Cmd + C)
      if (isCtrlOrMeta && e.key.toLowerCase() === 'c') {
        const hasSelected = selectedNodes.length > 0 || Boolean(selectedNodeId);
        if (hasSelected && !window.getSelection()?.toString()) {
          e.preventDefault();
          handleCopySelected();
          return;
        }
      }

      // Paste (Ctrl/Cmd + V)
      if (isCtrlOrMeta && e.key.toLowerCase() === 'v') {
        if (clipboardNodesRef.current.length > 0 && isEditable) {
          e.preventDefault();
          handlePasteCopied();
          return;
        }
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSelection =
          selectedNodes.length > 0 ||
          Boolean(selectedNodeId) ||
          selectedEdges.length > 0 ||
          Boolean(selectedEdgeId);
        if (hasSelection && isEditable) {
          e.preventDefault();
          handleDeleteSelected();
          return;
        }
      }

      // Escape (Clear selection or dismiss palette)
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        setSelectedNodes([]);
        setSelectedEdges([]);
        dispatch(clearSelection());
        emitSelectionUpdate(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isEditable,
    selectedNodes,
    selectedNodeId,
    selectedEdges,
    selectedEdgeId,
    commandPaletteOpen,
    handleDuplicateSelected,
    handleCopySelected,
    handlePasteCopied,
    handleDeleteSelected,
    dispatch,
    emitSelectionUpdate,
  ]);

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
      currentVersion,
      canvasSettings
    );
  }, [initialArchitecture.projectId, nodes, edges, currentViewport, currentVersion, canvasSettings]);

  // Command Palette Actions Definition
  const commandActions = useMemo<CommandPaletteAction[]>(() => {
    const actions: CommandPaletteAction[] = [];

    // Edit actions
    const hasSelectedNodes = selectedNodes.length > 0 || Boolean(selectedNode);
    const hasSelection =
      hasSelectedNodes || selectedEdges.length > 0 || Boolean(selectedEdge);

    actions.push({
      id: 'duplicate-selected',
      label: 'Duplicate Selected Component',
      description: 'Create an offset clone preserving configuration and styling (Ctrl+D)',
      category: 'edit',
      shortcut: 'Ctrl+D',
      icon: <Copy className="h-4 w-4" />,
      disabled: !isEditable || !hasSelectedNodes,
      onExecute: handleDuplicateSelected,
    });

    actions.push({
      id: 'copy-selected',
      label: 'Copy Selected Component',
      description: 'Copy selected component to clipboard (Ctrl+C)',
      category: 'edit',
      shortcut: 'Ctrl+C',
      icon: <Copy className="h-4 w-4" />,
      disabled: !hasSelectedNodes,
      onExecute: handleCopySelected,
    });

    actions.push({
      id: 'paste-copied',
      label: 'Paste Component',
      description: 'Paste copied component from clipboard (Ctrl+V)',
      category: 'edit',
      shortcut: 'Ctrl+V',
      icon: <Copy className="h-4 w-4" />,
      disabled: !isEditable || clipboardNodesRef.current.length === 0,
      onExecute: handlePasteCopied,
    });

    actions.push({
      id: 'delete-selected',
      label: 'Delete Selected Element',
      description: 'Remove selected nodes and connected edges from canvas (Del)',
      category: 'edit',
      shortcut: 'Del',
      icon: <Trash2 className="h-4 w-4" />,
      disabled: !isEditable || !hasSelection,
      onExecute: handleDeleteSelected,
    });

    actions.push({
      id: 'clear-selection',
      label: 'Clear Selection',
      description: 'Deselect all components and connections (Esc)',
      category: 'edit',
      shortcut: 'Esc',
      disabled: !hasSelection,
      onExecute: () => {
        setSelectedNodes([]);
        setSelectedEdges([]);
        dispatch(clearSelection());
        emitSelectionUpdate(null);
      },
    });

    // Alignment actions (for 2+ selected nodes)
    const canAlign = isEditable && selectedNodes.length >= 2;
    const canDistribute = isEditable && selectedNodes.length >= 3;

    actions.push({
      id: 'align-left',
      label: 'Align Left',
      description: 'Align selected nodes to leftmost edge',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('left'),
    });

    actions.push({
      id: 'align-center',
      label: 'Align Center (Horizontal)',
      description: 'Align selected nodes to horizontal midpoint',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('center'),
    });

    actions.push({
      id: 'align-right',
      label: 'Align Right',
      description: 'Align selected nodes to rightmost edge',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('right'),
    });

    actions.push({
      id: 'align-top',
      label: 'Align Top',
      description: 'Align selected nodes to topmost edge',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('top'),
    });

    actions.push({
      id: 'align-middle',
      label: 'Align Middle (Vertical)',
      description: 'Align selected nodes to vertical midpoint',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('middle'),
    });

    actions.push({
      id: 'align-bottom',
      label: 'Align Bottom',
      description: 'Align selected nodes to bottommost edge',
      category: 'align',
      disabled: !canAlign,
      onExecute: () => handleAlignNodes('bottom'),
    });

    actions.push({
      id: 'distribute-h',
      label: 'Distribute Horizontally',
      description: 'Distribute 3+ nodes evenly along horizontal axis',
      category: 'align',
      disabled: !canDistribute,
      onExecute: () => handleDistributeNodes('horizontal'),
    });

    actions.push({
      id: 'distribute-v',
      label: 'Distribute Vertically',
      description: 'Distribute 3+ nodes evenly along vertical axis',
      category: 'align',
      disabled: !canDistribute,
      onExecute: () => handleDistributeNodes('vertical'),
    });

    // Canvas appearance actions
    actions.push({
      id: 'toggle-snap-to-grid',
      label: canvasSettings.snapToGrid ? 'Disable Snap to Grid' : 'Enable Snap to Grid',
      description: 'Toggle automatic snapping when dragging nodes',
      category: 'canvas',
      icon: <LayoutGrid className="h-4 w-4" />,
      disabled: !isEditable,
      onExecute: () => handleUpdateCanvasSettings({ snapToGrid: !canvasSettings.snapToGrid }),
    });

    actions.push({
      id: 'toggle-grid-visibility',
      label: canvasSettings.gridVisible === false ? 'Show Canvas Grid' : 'Hide Canvas Grid',
      description: 'Toggle background grid rendering on diagram canvas',
      category: 'canvas',
      icon: <Eye className="h-4 w-4" />,
      disabled: !isEditable,
      onExecute: () =>
        handleUpdateCanvasSettings({ gridVisible: canvasSettings.gridVisible === false }),
    });

    // Component catalog additions
    (Object.keys(NODE_CATALOG) as ArchitectureNodeType[]).forEach((type) => {
      const def = NODE_CATALOG[type];
      actions.push({
        id: `add-component-${type}`,
        label: `Add ${def.label}`,
        description: def.description,
        category: 'components',
        disabled: !isEditable,
        onExecute: () => handleAddNodeFromKeyboard(type),
      });
    });

    // Tools & Panels
    actions.push({
      id: 'open-ai-assistant',
      label: 'Open AI Architecture Assistant',
      description: 'Analyze single points of failure, scalability, and security',
      category: 'tools',
      icon: <Sparkles className="h-4 w-4" />,
      onExecute: () => {
        dispatch(setValidationPanelOpen(false));
        dispatch(setDetailsPanelOpen(false));
        dispatch(setAiPanelOpen(true));
      },
    });

    actions.push({
      id: 'open-validation',
      label: 'Validate Architecture',
      description: 'Run architectural rule checks and inspect disconnected nodes',
      category: 'tools',
      icon: <ShieldCheck className="h-4 w-4" />,
      onExecute: () => {
        handleValidate();
        dispatch(setAiPanelOpen(false));
        dispatch(setDetailsPanelOpen(false));
        dispatch(setValidationPanelOpen(true));
      },
    });

    return actions;
  }, [
    isEditable,
    selectedNodes,
    selectedNode,
    selectedEdges,
    selectedEdge,
    canvasSettings,
    handleDuplicateSelected,
    handleCopySelected,
    handlePasteCopied,
    handleDeleteSelected,
    handleAlignNodes,
    handleDistributeNodes,
    handleUpdateCanvasSettings,
    handleAddNodeFromKeyboard,
    handleValidate,
    dispatch,
    emitSelectionUpdate,
  ]);

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden bg-[var(--color-bg)] select-none text-[var(--color-text)] transition-colors duration-200"
      role="region"
      aria-label="Architecture canvas workspace"
    >
      {/* 1. Unified Studio Top Bar (48px / h-12) */}
      <header
        className="flex h-12 w-full shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 backdrop-blur-md z-30 select-none text-[var(--color-text)] transition-colors"
        role="banner"
        aria-label="ArchSync AI studio header"
      >
        {/* Left Zone: Back to Projects, Divider, Project Name (editable), Version badge, Role badge */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
            title="Back to All Projects"
            aria-label="Back to All Projects"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Projects</span>
          </Link>

          <div className="h-4 w-px bg-[var(--color-border)] mx-0.5" aria-hidden="true" />

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
                className="rounded border border-[var(--color-accent)] bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus)]"
                aria-label="Edit project name"
              />
            </form>
          ) : (
            <div className="flex items-center gap-1.5 truncate">
              <h1
                className="font-serif text-sm sm:text-base font-semibold text-[var(--color-text)] tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]"
                title={projectName || 'Untitled Architecture'}
              >
                {projectName || 'Untitled Architecture'}
              </h1>
              {isEditable && onRenameProject && (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
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
            className="hidden md:inline-flex items-center gap-1 rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-accent)] font-semibold"
            title={`Architecture Version ${currentVersion}`}
          >
            v{currentVersion}
          </span>

          {/* Access Role Badge */}
          {currentUserRole && (
            <span
              className={`hidden lg:inline-flex items-center gap-1 rounded border px-2 py-0.2 text-[10px] font-mono font-semibold uppercase ${
                currentUserRole === 'OWNER'
                  ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : currentUserRole === 'EDITOR'
                  ? 'border-status-success/40 bg-status-success/10 text-status-success'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
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
              className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)] shadow-sm"
              title="Manage project members and access"
            >
              <Users className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
              <span className="font-medium">Team</span>
              {membersCount !== undefined && (
                <span className="rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1.5 py-0.2 text-[10px] font-mono font-semibold text-[var(--color-accent)]">
                  {membersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Zone: Collaboration Indicator, Validate, AI Assistant, Export Menu, Theme Toggle, Command Palette, Properties, Mobile */}
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="toolbar"
          aria-label="Canvas action toolbar"
        >
          <CollaborationIndicator />

          <div className="hidden sm:block h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {/* Validate Button */}
          <button
            type="button"
            onClick={handleValidate}
            data-testid="canvas-validate-btn"
            aria-label={`Validate architecture${validationResult && validationResult.issues.length > 0 ? ` — ${validationResult.issues.length} issue${validationResult.issues.length > 1 ? 's' : ''} found` : ''}`}
            aria-busy={isValidating}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)] ${
              validationPanelOpen
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)]'
            }`}
          >
            <ShieldCheck
              className={`h-3.5 w-3.5 ${
                isValidating
                  ? 'animate-spin text-[var(--color-accent)]'
                  : validationResult && !validationResult.valid
                  ? 'text-status-danger'
                  : validationResult && validationResult.issues.length > 0
                  ? 'text-status-warning'
                  : 'text-status-success'
              }`}
              aria-hidden="true"
            />
            <span className="hidden md:inline">Validate</span>
            {validationResult && validationResult.issues.length > 0 && (
              <span
                aria-hidden="true"
                className="rounded px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
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
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)] ${
              aiPanelOpen
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="hidden md:inline">AI Co-Pilot</span>
          </button>

          {/* Export Menu */}
          <ExportMenu
            getCurrentArchitecture={getCurrentArchitecture}
            projectName={projectName}
            projectDescription={projectDescription}
            isAutosavePending={isAutosavePending}
          />

          {/* Theme Toggle (Light / Dark / System) */}
          <ThemeToggle variant="compact" />

          {/* Command Palette Button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            data-testid="canvas-command-palette-btn"
            aria-label="Open command palette (Ctrl+K)"
            className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)] shadow-sm"
          >
            <Command className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="hidden lg:inline text-[10px] bg-[var(--color-surface-raised)] px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-[var(--color-text-muted)]">
              Ctrl+K
            </kbd>
          </button>

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
            className={`hidden md:flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)] shadow-sm ${
              detailsPanelOpen
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="hidden lg:inline">Properties</span>
          </button>

          {/* Mobile panel toggle — visible only on small screens */}
          <button
            type="button"
            onClick={() => setMobilePanelOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] md:hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
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
        {/* Left: Categorized Component Palette (Resizable) */}
        <div
          style={{ width: `${panelWidths.left}px` }}
          className="hidden lg:block shrink-0 h-full z-20"
          aria-label="Component palette"
        >
          <ComponentPalette
            isEditable={isEditable}
            onSelectComponent={handleAddNodeFromKeyboard}
          />
        </div>

        <div className="hidden lg:flex h-full items-stretch">
          <PanelResizeHandle
            side="left"
            width={panelWidths.left}
            minWidth={200}
            maxWidth={380}
            onResize={handleResizeLeft}
            label="Resize component palette"
          />
        </div>

        {/* Center: Interactive Canvas */}
        <div
          ref={canvasContainerRef}
          onMouseMove={handleCanvasMouseMove}
          className="relative flex-1 h-full w-full bg-[var(--color-canvas-bg)] min-w-0"
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
            onNodeDrag={isEditable ? onNodeDrag : undefined}
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
            snapToGrid={Boolean(canvasSettings.snapToGrid)}
            snapGrid={[canvasSettings.gridSpacing || 20, canvasSettings.gridSpacing || 20]}
            deleteKeyCode={isEditable ? ['Backspace', 'Delete'] : null}
            fitView
            minZoom={0.1}
            maxZoom={4}
            proOptions={{ hideAttribution: true }}
            className="archsync-canvas"
            style={{ backgroundColor: canvasSettings.backgroundColor || 'var(--color-canvas-bg)' }}
          >
            {/* Visual alignment guides overlay */}
            <AlignmentGuidesOverlay guides={guides} />

            {canvasSettings.gridVisible !== false && canvasSettings.gridType !== 'none' && (
              <Background
                variant={
                  canvasSettings.gridType === 'lines'
                    ? BackgroundVariant.Lines
                    : canvasSettings.gridType === 'cross'
                    ? BackgroundVariant.Cross
                    : BackgroundVariant.Dots
                }
                gap={canvasSettings.gridSpacing || 20}
                size={canvasSettings.gridType === 'lines' ? 1 : 1.2}
                color={resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(185, 157, 115, 0.15)'}
              />
            )}

            <Controls
              showInteractive={isEditable}
              className="!rounded-lg !border !border-[var(--color-border)] !bg-[var(--color-surface)]/95 !fill-[var(--color-accent)] text-[var(--color-text)] shadow-sm"
            />

            <MiniMap
              zoomable
              pannable
              nodeColor={(n) => {
                const type = (n.data as unknown as CustomNodeData)?.nodeType;
                return type ? getNodeVisual(type).accentColor : 'var(--color-accent)';
              }}
              maskColor={resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(185, 157, 115, 0.12)'}
              className="!rounded-lg !border !border-[var(--color-border)] !bg-[var(--color-surface)]/95 shadow-sm"
            />
          </ReactFlow>
        </div>

        {/* Right: Unified Context Drawer Container (mutually exclusive) */}
        {(aiPanelOpen || validationPanelOpen || detailsPanelOpen) && (
          <div className="hidden md:flex h-full items-stretch">
            <PanelResizeHandle
              side="right"
              width={panelWidths.right}
              minWidth={280}
              maxWidth={520}
              onResize={handleResizeRight}
              label="Resize contextual inspector"
            />
          </div>
        )}

        {aiPanelOpen ? (
          <aside
            id="canvas-ai-panel"
            style={{ width: `${panelWidths.right}px` }}
            className="hidden md:block shrink-0 h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] z-20 transition-colors"
            aria-label="AI Architecture Assistant panel"
          >
            <AIAssistantPanel
              projectId={initialArchitecture.projectId}
              onClose={() => dispatch(setAiPanelOpen(false))}
              onSelectNode={handleSelectNodeFromValidation}
              onSelectEdge={handleSelectEdgeFromValidation}
            />
          </aside>
        ) : validationPanelOpen ? (
          <aside
            style={{ width: `${panelWidths.right}px` }}
            className="hidden md:block shrink-0 h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] z-20 transition-colors"
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
            style={{ width: `${panelWidths.right}px` }}
            className="hidden md:block shrink-0 h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] z-20 transition-colors"
            aria-label="Node and edge properties panel"
          >
            <NodeDetailsPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              selectedNodes={selectedNodes}
              selectedEdges={selectedEdges}
              canvasSettings={canvasSettings}
              isEditable={isEditable}
              onUpdateNodeData={handleUpdateNodeData}
              onDeleteNode={handleDeleteNode}
              onUpdateEdgeData={handleUpdateEdgeData}
              onDeleteEdge={handleDeleteEdge}
              onUpdateCanvasSettings={handleUpdateCanvasSettings}
              onResetCanvasSettings={handleResetCanvasSettings}
              onAlignNodes={handleAlignNodes}
              onDistributeNodes={handleDistributeNodes}
              onBatchUpdateNodeStyle={handleBatchUpdateNodeStyle}
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
              className="absolute inset-y-0 right-0 z-50 w-80 max-w-[90vw] h-full border-l border-[var(--color-border)] bg-[var(--color-surface)] md:hidden transition-colors"
              role="dialog"
              aria-modal="true"
              aria-label="Canvas side panel"
            >
              <button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="absolute top-3 right-3 z-10 rounded-md p-1.5 text-[#B9B1A5] hover:bg-[#141310] hover:text-[#F2EEE7]"
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
                  selectedNodes={selectedNodes}
                  selectedEdges={selectedEdges}
                  canvasSettings={canvasSettings}
                  isEditable={isEditable}
                  onUpdateNodeData={handleUpdateNodeData}
                  onDeleteNode={handleDeleteNode}
                  onUpdateEdgeData={handleUpdateEdgeData}
                  onDeleteEdge={handleDeleteEdge}
                  onUpdateCanvasSettings={handleUpdateCanvasSettings}
                  onResetCanvasSettings={handleResetCanvasSettings}
                  onAlignNodes={handleAlignNodes}
                  onDistributeNodes={handleDistributeNodes}
                  onBatchUpdateNodeStyle={handleBatchUpdateNodeStyle}
                  onClose={() => { dispatch(setDetailsPanelOpen(false)); setMobilePanelOpen(false); }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        actions={commandActions}
      />
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
