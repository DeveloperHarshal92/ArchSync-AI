import { useEffect, useRef, useCallback } from 'react';
import {
  ArchitectureNode,
  ArchitectureEdge,
  ProjectStateEvent,
  SocketErrorPayload,
} from '@archsync/shared';
import { getSocket, TypedSocket } from '../lib/socket/socketClient';
import { useAppDispatch } from '../store/hooks';
import {
  setConnectionState,
  setCollaborators,
  addOrUpdateCollaborator,
  removeCollaboratorByUserId,
  updateCollaboratorSelectionState,
  updateRemoteCursorState,
  setCollaborationError,
  resetCollaborationState,
} from '../store/slices/collaborationSlice';

export interface UseProjectCollaborationProps {
  projectId: string;
  isEditable: boolean;
  currentVersion?: number;
  onRemoteNodeCreate?: (node: ArchitectureNode) => void;
  onRemoteNodeUpdate?: (node: ArchitectureNode) => void;
  onRemoteNodeDelete?: (nodeId: string) => void;
  onRemoteEdgeCreate?: (edge: ArchitectureEdge) => void;
  onRemoteEdgeUpdate?: (edge: ArchitectureEdge) => void;
  onRemoteEdgeDelete?: (edgeId: string) => void;
  onRemoteProjectState?: (state: ProjectStateEvent) => void;
}

export function useProjectCollaboration({
  projectId,
  isEditable,
  currentVersion = 1,
  onRemoteNodeCreate,
  onRemoteNodeUpdate,
  onRemoteNodeDelete,
  onRemoteEdgeCreate,
  onRemoteEdgeUpdate,
  onRemoteEdgeDelete,
  onRemoteProjectState,
}: UseProjectCollaborationProps) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<TypedSocket | null>(null);
  const lastCursorEmitRef = useRef<number>(0);
  const activeProjectIdRef = useRef<string>(projectId);
  activeProjectIdRef.current = projectId;

  // Keep latest callbacks in refs to avoid re-binding socket listeners
  const callbacksRef = useRef({
    onRemoteNodeCreate,
    onRemoteNodeUpdate,
    onRemoteNodeDelete,
    onRemoteEdgeCreate,
    onRemoteEdgeUpdate,
    onRemoteEdgeDelete,
    onRemoteProjectState,
  });
  callbacksRef.current = {
    onRemoteNodeCreate,
    onRemoteNodeUpdate,
    onRemoteNodeDelete,
    onRemoteEdgeCreate,
    onRemoteEdgeUpdate,
    onRemoteEdgeDelete,
    onRemoteProjectState,
  };

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Connect socket if disconnected
    if (!socket.connected) {
      dispatch(setConnectionState('connecting'));
      socket.connect();
    } else {
      dispatch(setConnectionState('connected'));
      // Already connected: join current project room
      socket.emit('project:join', { projectId });
    }

    const handleConnect = () => {
      dispatch(setConnectionState('connected'));
      dispatch(setCollaborationError(null));
      socket.emit('project:join', { projectId: activeProjectIdRef.current });
    };

    const handleDisconnect = () => {
      dispatch(setConnectionState('disconnected'));
    };

    const handleConnectError = (err: Error) => {
      dispatch(setConnectionState('error'));
      dispatch(
        setCollaborationError({
          code: 'CONNECTION_ERROR',
          message: err.message || 'Failed to connect to collaboration server',
        })
      );
    };

    const handleReconnectAttempt = () => {
      dispatch(setConnectionState('reconnecting'));
    };

    const handleReconnect = () => {
      dispatch(setConnectionState('connected'));
      dispatch(setCollaborationError(null));
      // Upon reconnect, rejoin room to receive authoritative project state
      socket.emit('project:join', { projectId: activeProjectIdRef.current });
    };

    const handleError = (payload: SocketErrorPayload) => {
      dispatch(setCollaborationError(payload));
    };

    // Presence listeners
    const handlePresenceState = (payload: { projectId: string; presences: any[] }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        dispatch(setCollaborators(payload.presences));
      }
    };

    const handlePresenceJoin = (payload: any) => {
      dispatch(addOrUpdateCollaborator(payload));
    };

    const handlePresenceLeave = (payload: { projectId: string; userId: string }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        dispatch(removeCollaboratorByUserId(payload.userId));
      }
    };

    const handlePresenceUpdate = (payload: { projectId: string; userId: string; selectedNodeId?: string | null }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        dispatch(
          updateCollaboratorSelectionState({
            userId: payload.userId,
            selectedNodeId: payload.selectedNodeId,
          })
        );
      }
    };

    const handleCursorUpdate = (payload: { projectId: string; userId: string; x: number; y: number }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        dispatch(
          updateRemoteCursorState({
            userId: payload.userId,
            cursor: { x: payload.x, y: payload.y },
          })
        );
      }
    };

    // Architecture listeners
    const handleProjectState = (payload: ProjectStateEvent) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteProjectState?.(payload);
      }
    };

    const handleNodeCreate = (payload: { projectId: string; node: ArchitectureNode }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteNodeCreate?.(payload.node);
      }
    };

    const handleNodeUpdate = (payload: { projectId: string; node: ArchitectureNode }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteNodeUpdate?.(payload.node);
      }
    };

    const handleNodeDelete = (payload: { projectId: string; nodeId: string }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteNodeDelete?.(payload.nodeId);
      }
    };

    const handleEdgeCreate = (payload: { projectId: string; edge: ArchitectureEdge }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteEdgeCreate?.(payload.edge);
      }
    };

    const handleEdgeUpdate = (payload: { projectId: string; edge: ArchitectureEdge }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteEdgeUpdate?.(payload.edge);
      }
    };

    const handleEdgeDelete = (payload: { projectId: string; edgeId: string }) => {
      if (payload.projectId === activeProjectIdRef.current) {
        callbacksRef.current.onRemoteEdgeDelete?.(payload.edgeId);
      }
    };

    // Attach all listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.io.on('reconnect_attempt', handleReconnectAttempt);
    socket.io.on('reconnect', handleReconnect);
    socket.on('error', handleError);

    socket.on('presence:state', handlePresenceState);
    socket.on('presence:join', handlePresenceJoin);
    socket.on('presence:leave', handlePresenceLeave);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('cursor:update', handleCursorUpdate);

    socket.on('project:state', handleProjectState);
    socket.on('node:create', handleNodeCreate);
    socket.on('node:update', handleNodeUpdate);
    socket.on('node:delete', handleNodeDelete);
    socket.on('edge:create', handleEdgeCreate);
    socket.on('edge:update', handleEdgeUpdate);
    socket.on('edge:delete', handleEdgeDelete);

    return () => {
      // Leave room and clean up listeners
      socket.emit('project:leave', { projectId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.io.off('reconnect_attempt', handleReconnectAttempt);
      socket.io.off('reconnect', handleReconnect);
      socket.off('error', handleError);

      socket.off('presence:state', handlePresenceState);
      socket.off('presence:join', handlePresenceJoin);
      socket.off('presence:leave', handlePresenceLeave);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('cursor:update', handleCursorUpdate);

      socket.off('project:state', handleProjectState);
      socket.off('node:create', handleNodeCreate);
      socket.off('node:update', handleNodeUpdate);
      socket.off('node:delete', handleNodeDelete);
      socket.off('edge:create', handleEdgeCreate);
      socket.off('edge:update', handleEdgeUpdate);
      socket.off('edge:delete', handleEdgeDelete);

      dispatch(resetCollaborationState());
    };
  }, [projectId, dispatch]);

  // Outgoing Collaboration Action Emitters (guarded by isEditable for mutations)
  const emitNodeCreate = useCallback(
    (node: ArchitectureNode) => {
      if (!isEditable) return;
      socketRef.current?.emit('node:create', {
        projectId: activeProjectIdRef.current,
        node,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  const emitNodeUpdate = useCallback(
    (node: ArchitectureNode) => {
      if (!isEditable) return;
      socketRef.current?.emit('node:update', {
        projectId: activeProjectIdRef.current,
        node,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  const emitNodeDelete = useCallback(
    (nodeId: string) => {
      if (!isEditable) return;
      socketRef.current?.emit('node:delete', {
        projectId: activeProjectIdRef.current,
        nodeId,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  const emitEdgeCreate = useCallback(
    (edge: ArchitectureEdge) => {
      if (!isEditable) return;
      socketRef.current?.emit('edge:create', {
        projectId: activeProjectIdRef.current,
        edge,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  const emitEdgeUpdate = useCallback(
    (edge: ArchitectureEdge) => {
      if (!isEditable) return;
      socketRef.current?.emit('edge:update', {
        projectId: activeProjectIdRef.current,
        edge,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  const emitEdgeDelete = useCallback(
    (edgeId: string) => {
      if (!isEditable) return;
      socketRef.current?.emit('edge:delete', {
        projectId: activeProjectIdRef.current,
        edgeId,
        version: currentVersion,
      });
    },
    [isEditable, currentVersion]
  );

  // High-frequency cursor updates: strictly throttled (10-20 times/sec, e.g. >= 60ms between emits)
  const emitCursorUpdate = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorEmitRef.current < 60) {
      return;
    }
    lastCursorEmitRef.current = now;
    socketRef.current?.emit('cursor:update', {
      projectId: activeProjectIdRef.current,
      x,
      y,
    });
  }, []);

  const emitSelectionUpdate = useCallback((selectedNodeId?: string | null) => {
    socketRef.current?.emit('presence:update', {
      projectId: activeProjectIdRef.current,
      selectedNodeId: selectedNodeId || null,
    });
  }, []);

  return {
    emitNodeCreate,
    emitNodeUpdate,
    emitNodeDelete,
    emitEdgeCreate,
    emitEdgeUpdate,
    emitEdgeDelete,
    emitCursorUpdate,
    emitSelectionUpdate,
  };
}
