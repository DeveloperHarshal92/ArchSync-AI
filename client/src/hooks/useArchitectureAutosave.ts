import { useEffect, useRef, useCallback } from 'react';
import { Architecture, EdgeType } from '@archsync/shared';
import { Viewport } from '@xyflow/react';
import { AppNode, AppEdge, reactFlowToArchitecture } from '../lib/architecture/adapters';
import { useUpdateArchitectureMutation } from '../store/api/architectureApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setPersistenceDirty,
  setPersistenceSuccess,
  setPersistenceError,
  setPersistenceStatus,
  selectPersistenceStatus,
  selectCurrentVersion,
  selectHasVersionConflict,
} from '../store/slices/editorSlice';
import { parseApiError } from '../lib/apiErrors';

export interface UseArchitectureAutosaveProps {
  projectId: string;
  initialArchitecture: Architecture;
  nodes: AppNode[];
  edges: AppEdge[];
  viewport: Viewport;
  isEditable: boolean;
  debounceMs?: number;
}

/**
 * Creates a normalized signature of the architectural graph to detect meaningful changes.
 * Ignores transient drag events, active selection, panels, and hover states.
 */
export function createArchitectureHash(
  nodes: AppNode[],
  edges: AppEdge[],
  viewport?: { x: number; y: number; zoom: number }
): string {
  const simplifiedNodes = nodes
    .map((n) => ({
      id: n.id,
      type: n.data.nodeType || n.type,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
      label: n.data.label || '',
      description: n.data.description || '',
      technology: n.data.technology || '',
      category: n.data.category || '',
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const simplifiedEdges = edges
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.data?.edgeType || e.type || 'default',
      label: typeof e.label === 'string' ? e.label : '',
      animated: Boolean(e.animated),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const vp = viewport
    ? `${Math.round(viewport.x)}:${Math.round(viewport.y)}:${viewport.zoom.toFixed(2)}`
    : '0:0:1';

  return JSON.stringify({ nodes: simplifiedNodes, edges: simplifiedEdges, viewport: vp });
}

export function useArchitectureAutosave({
  projectId,
  initialArchitecture,
  nodes,
  edges,
  viewport,
  isEditable,
  debounceMs = 1000,
}: UseArchitectureAutosaveProps) {
  const dispatch = useAppDispatch();
  const persistenceStatus = useAppSelector(selectPersistenceStatus);
  const currentVersion = useAppSelector(selectCurrentVersion);
  const hasVersionConflict = useAppSelector(selectHasVersionConflict);

  const [updateArchitecture] = useUpdateArchitectureMutation();

  // Refs for tracking state without re-triggering effects
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedHashRef = useRef<string | null>(null);
  const isHydratedRef = useRef<boolean>(false);
  const currentProjectIdRef = useRef<string>(projectId);
  const saveSequenceRef = useRef<number>(0);
  const persistenceStatusRef = useRef(persistenceStatus);
  persistenceStatusRef.current = persistenceStatus;

  // Keep latest graph references for the debounce timer callback
  const latestGraphRef = useRef({ nodes, edges, viewport, currentVersion });
  latestGraphRef.current = { nodes, edges, viewport, currentVersion };

  // 1. Initial Hydration & Project Switch Synchronization
  useEffect(() => {
    currentProjectIdRef.current = projectId;
    isHydratedRef.current = false;

    // Cancel any pending timer from previous project
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    let hydrationTimer: NodeJS.Timeout | null = null;

    // Set initial baseline from server snapshot
    if (initialArchitecture) {
      const initialNodes = initialArchitecture.nodes.map((n) => ({
        id: n.id,
        type: 'architectureNode' as const,
        position: n.position,
        data: {
          label: n.data.label,
          description: n.data.description,
          technology: n.data.technology,
          category: n.data.category,
          nodeType: n.type,
        },
      }));

      const initialEdges = initialArchitecture.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        label: e.label,
        animated: Boolean(e.animated),
        data: {
          edgeType: (e.type as EdgeType) || 'data-flow',
        },
      }));

      const initialVp = initialArchitecture.viewport || { x: 0, y: 0, zoom: 1 };
      lastSavedHashRef.current = createArchitectureHash(initialNodes, initialEdges, initialVp);

      // Hydration must NOT mark the canvas dirty or fire saves
      dispatch(
        setPersistenceSuccess({
          version: initialArchitecture.version,
          savedAt: initialArchitecture.updatedAt,
        })
      );
      dispatch(setPersistenceStatus('idle'));

      // Delay hydration flag slightly to allow React Flow to complete initial state mount
      hydrationTimer = setTimeout(() => {
        isHydratedRef.current = true;
      }, 100);
    }

    return () => {
      if (hydrationTimer) {
        clearTimeout(hydrationTimer);
      }
    };
  }, [projectId, initialArchitecture, dispatch]);

  // 2. Core Persistence Execution
  const executeSave = useCallback(async () => {
    if (!isEditable) return;
    if (hasVersionConflict) return;

    const targetProjectId = currentProjectIdRef.current;
    const { nodes: currentNodes, edges: currentEdges, viewport: currentVp, currentVersion: versionToSave } =
      latestGraphRef.current;

    const currentHash = createArchitectureHash(currentNodes, currentEdges, currentVp);

    // If current graph matches last saved state, no-op
    if (lastSavedHashRef.current === currentHash) {
      dispatch(setPersistenceStatus('saved'));
      return;
    }

    const sequence = ++saveSequenceRef.current;
    dispatch(setPersistenceStatus('saving'));

    try {
      const domainArchitecture = reactFlowToArchitecture(
        targetProjectId,
        currentNodes,
        currentEdges,
        currentVp,
        versionToSave
      );

      const response = await updateArchitecture({
        projectId: targetProjectId,
        body: {
          nodes: domainArchitecture.nodes,
          edges: domainArchitecture.edges,
          viewport: domainArchitecture.viewport,
          version: versionToSave,
        },
      }).unwrap();

      // Guard: Discard if project changed or newer save sequence already started
      if (currentProjectIdRef.current !== targetProjectId || saveSequenceRef.current !== sequence) {
        return;
      }

      if (!response.success) {
        throw new Error(response.error.message || 'Failed to update architecture');
      }

      const nextVersion = response.data.architecture.version;
      lastSavedHashRef.current = currentHash;

      dispatch(
        setPersistenceSuccess({
          version: nextVersion,
          savedAt: response.data.architecture.updatedAt,
        })
      );
    } catch (err: unknown) {
      if (currentProjectIdRef.current !== targetProjectId || saveSequenceRef.current !== sequence) {
        return;
      }

      const parsedError = parseApiError(err);
      const isConflict =
        parsedError.status === 409 || parsedError.code === 'VERSION_CONFLICT';

      const userMessage = isConflict
        ? 'This architecture was changed elsewhere. Your changes could not be saved.'
        : parsedError.message || 'Unable to save architecture changes.';

      dispatch(
        setPersistenceError({
          message: userMessage,
          isConflict,
        })
      );
    }
  }, [isEditable, hasVersionConflict, updateArchitecture, dispatch]);

  // 3. Meaningful Change Detection & Debounce Window
  useEffect(() => {
    // Skip if read-only, not hydrated yet, or in version conflict
    if (!isEditable || !isHydratedRef.current || hasVersionConflict) {
      return;
    }

    const currentHash = createArchitectureHash(nodes, edges, viewport);

    // Only process if graph has meaningfully changed from last saved state
    if (lastSavedHashRef.current !== null && currentHash !== lastSavedHashRef.current) {
      dispatch(setPersistenceDirty());

      // Coalesce rapid changes into single save after debounce interval
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        executeSave();
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, edges, viewport, isEditable, hasVersionConflict, debounceMs, executeSave, dispatch]);

  // 4. Navigation & Unload Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        persistenceStatusRef.current === 'dirty' ||
        persistenceStatusRef.current === 'saving'
      ) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    saveNow: executeSave,
  };
}
