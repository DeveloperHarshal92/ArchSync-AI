import { GraphData, ValidationContext } from '../types';

/**
 * Normalizes and analyzes the architecture graph into an indexed ValidationContext in O(V + E)
 */
export function buildValidationContext(graph: GraphData): ValidationContext {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  const seenNodeIds = new Set<string>();
  const duplicateNodeIds = new Set<string>();
  const nodeMap = new Map<string, any>();
  const inDegrees = new Map<string, number>();
  const outDegrees = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    if (node && typeof node.id === 'string' && node.id.trim()) {
      if (seenNodeIds.has(node.id)) {
        duplicateNodeIds.add(node.id);
      } else {
        seenNodeIds.add(node.id);
        nodeMap.set(node.id, node);
        inDegrees.set(node.id, 0);
        outDegrees.set(node.id, 0);
        adjacency.set(node.id, []);
      }
    }
  }

  const seenEdgeIds = new Set<string>();
  const duplicateEdgeIds = new Set<string>();

  for (const edge of edges) {
    if (edge && typeof edge.id === 'string' && edge.id.trim()) {
      if (seenEdgeIds.has(edge.id)) {
        duplicateEdgeIds.add(edge.id);
      } else {
        seenEdgeIds.add(edge.id);
      }
    }

    if (edge && typeof edge.source === 'string' && typeof edge.target === 'string') {
      const sourceExists = seenNodeIds.has(edge.source);
      const targetExists = seenNodeIds.has(edge.target);

      if (sourceExists) {
        outDegrees.set(edge.source, (outDegrees.get(edge.source) || 0) + 1);
      }
      if (targetExists) {
        inDegrees.set(edge.target, (inDegrees.get(edge.target) || 0) + 1);
      }

      // Populate adjacency for cycle detection only if both nodes exist and not self-loop
      if (sourceExists && targetExists && edge.source !== edge.target) {
        const neighbors = adjacency.get(edge.source);
        if (neighbors) {
          neighbors.push(edge.target);
        }
      }
    }
  }

  return {
    nodes,
    edges,
    nodeMap,
    seenNodeIds,
    duplicateNodeIds,
    seenEdgeIds,
    duplicateEdgeIds,
    adjacency,
    inDegrees,
    outDegrees,
  };
}

/**
 * Returns a canonical key for a cycle so rotations represent the same cycle
 * e.g., ['A', 'B', 'C'] and ['B', 'C', 'A'] produce the same signature
 */
export function canonicalizeCycle(cycleNodes: string[]): string {
  if (cycleNodes.length === 0) return '';
  const n = cycleNodes.length;
  let minIndex = 0;
  for (let i = 1; i < n; i++) {
    if (cycleNodes[i].localeCompare(cycleNodes[minIndex]) < 0) {
      minIndex = i;
    }
  }

  const rotated: string[] = [];
  for (let i = 0; i < n; i++) {
    rotated.push(cycleNodes[(minIndex + i) % n]);
  }
  return rotated.join('->');
}
