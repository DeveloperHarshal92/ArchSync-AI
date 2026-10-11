import {
  Architecture,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureViewport,
  ArchitectureNodeType,
  EdgeType,
  ArchitectureNodeStyle,
  ArchitectureEdgeStyle,
  CanvasAppearance,
} from '@archsync/shared';
import { Node, Edge, Viewport, MarkerType } from '@xyflow/react';

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  technology?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  nodeType: ArchitectureNodeType;
  style?: ArchitectureNodeStyle;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomEdgeData extends Record<string, unknown> {
  edgeType: EdgeType;
  style?: ArchitectureEdgeStyle;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AppNode = Node<CustomNodeData, 'architectureNode'>;
export type AppEdge = Edge<CustomEdgeData>;

/**
 * Generates unique, stable, graph-safe node ID
 */
export const generateNodeId = (prefix = 'node'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Generates unique, stable, graph-safe edge ID
 */
export const generateEdgeId = (source: string, target: string): string => {
  const random = Math.random().toString(36).substring(2, 6);
  return `edge_${source}_${target}_${random}`;
};

/**
 * Helper to compute React Flow edge properties from domain edge style
 */
export const computeEdgeVisuals = (
  edgeType: EdgeType,
  animated?: boolean,
  style?: ArchitectureEdgeStyle
) => {
  const strokeColor = style?.strokeColor || '#ef8557';
  const strokeWidth = style?.strokeWidth ?? 2;
  const opacity = style?.opacity ?? 1;

  let strokeDasharray: string | undefined = undefined;
  if (style?.strokeStyle === 'dashed' || (!style?.strokeStyle && edgeType === 'dashed')) {
    strokeDasharray = '5,5';
  } else if (style?.strokeStyle === 'dotted') {
    strokeDasharray = '2,2';
  }

  let reactFlowType = 'default';
  if (style?.connectorType === 'straight') {
    reactFlowType = 'straight';
  } else if (style?.connectorType === 'smoothstep') {
    reactFlowType = 'smoothstep';
  } else if (style?.connectorType === 'curved') {
    reactFlowType = 'default';
  }

  const markerEnd =
    style?.arrowHeadEnd === 'arrow'
      ? { type: MarkerType.Arrow, color: strokeColor }
      : style?.arrowHeadEnd === 'arrowclosed'
      ? { type: MarkerType.ArrowClosed, color: strokeColor }
      : undefined;

  const markerStart =
    style?.arrowHeadStart === 'arrow'
      ? { type: MarkerType.Arrow, color: strokeColor }
      : style?.arrowHeadStart === 'arrowclosed'
      ? { type: MarkerType.ArrowClosed, color: strokeColor }
      : undefined;

  return {
    reactFlowType,
    isAnimated: animated ?? edgeType === 'animated',
    markerEnd,
    markerStart,
    edgeStyle: {
      strokeWidth,
      stroke: strokeColor,
      opacity,
      ...(strokeDasharray ? { strokeDasharray } : {}),
    },
  };
};

/**
 * Converts domain Architecture into React Flow nodes and edges
 */
export const architectureToReactFlow = (
  architecture: Architecture
): {
  nodes: AppNode[];
  edges: AppEdge[];
} => {
  const nodes: AppNode[] = (architecture.nodes || []).map((node) => ({
    id: node.id,
    type: 'architectureNode' as const,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
    width: node.width,
    height: node.height,
    data: {
      ...node.data,
      nodeType: node.type,
      style: node.style,
      createdBy: node.createdBy,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    },
  }));

  const edges: AppEdge[] = (architecture.edges || []).map((edge) => {
    const edgeType = edge.type || 'default';
    const visuals = computeEdgeVisuals(edgeType, edge.animated, edge.style);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: visuals.reactFlowType,
      label: edge.label,
      animated: visuals.isAnimated,
      markerEnd: visuals.markerEnd,
      markerStart: visuals.markerStart,
      style: visuals.edgeStyle,
      data: {
        edgeType,
        style: edge.style,
        metadata: edge.metadata,
        createdBy: edge.createdBy,
        createdAt: edge.createdAt,
        updatedAt: edge.updatedAt,
      },
    };
  });

  return { nodes, edges };
};

/**
 * Converts React Flow state back into domain Architecture
 */
export const reactFlowToArchitecture = (
  projectId: string,
  nodes: AppNode[],
  edges: AppEdge[],
  viewport: Viewport,
  version: number,
  canvasSettings?: CanvasAppearance
): Architecture => {
  const archNodes: ArchitectureNode[] = nodes.map((n) => {
    const { nodeType, createdBy, createdAt, updatedAt, style, ...nodeData } = n.data;
    return {
      id: n.id,
      type: nodeType || 'server',
      position: {
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
      },
      width: n.width ? Math.round(n.width) : undefined,
      height: n.height ? Math.round(n.height) : undefined,
      data: {
        label: nodeData.label || 'Component',
        description: nodeData.description,
        technology: nodeData.technology,
        category: nodeData.category,
        metadata: nodeData.metadata,
      },
      style: style ? { ...style } : undefined,
      createdBy: createdBy || '',
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
    };
  });

  const archEdges: ArchitectureEdge[] = edges.map((e) => {
    const edgeData = e.data;
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: (edgeData?.edgeType as EdgeType) || 'default',
      label: typeof e.label === 'string' ? e.label : undefined,
      animated: Boolean(e.animated),
      style: edgeData?.style ? { ...edgeData.style } : undefined,
      metadata: edgeData?.metadata,
      createdBy: edgeData?.createdBy || '',
      createdAt: edgeData?.createdAt || new Date().toISOString(),
      updatedAt: edgeData?.updatedAt || new Date().toISOString(),
    };
  });

  const archViewport: ArchitectureViewport = {
    x: Math.round(viewport.x),
    y: Math.round(viewport.y),
    zoom: Number(viewport.zoom.toFixed(2)),
  };

  return {
    projectId,
    nodes: archNodes,
    edges: archEdges,
    viewport: archViewport,
    canvasSettings,
    version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const appNodeToArchitectureNode = (node: AppNode): ArchitectureNode => {
  const { nodeType, createdBy, createdAt, updatedAt, style, ...nodeData } = node.data;
  return {
    id: node.id,
    type: nodeType || 'server',
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
    width: node.width ? Math.round(node.width) : undefined,
    height: node.height ? Math.round(node.height) : undefined,
    data: {
      label: nodeData.label || 'Component',
      description: nodeData.description,
      technology: nodeData.technology,
      category: nodeData.category,
      metadata: nodeData.metadata,
    },
    style: style ? { ...style } : undefined,
    createdBy: createdBy || '',
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString(),
  };
};

export const appEdgeToArchitectureEdge = (edge: AppEdge): ArchitectureEdge => {
  const edgeData = edge.data;
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: (edgeData?.edgeType as EdgeType) || 'default',
    label: typeof edge.label === 'string' ? edge.label : undefined,
    animated: Boolean(edge.animated),
    style: edgeData?.style ? { ...edgeData.style } : undefined,
    metadata: edgeData?.metadata,
    createdBy: edgeData?.createdBy || '',
    createdAt: edgeData?.createdAt || new Date().toISOString(),
    updatedAt: edgeData?.updatedAt || new Date().toISOString(),
  };
};
