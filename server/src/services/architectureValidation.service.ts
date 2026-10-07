import {
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureValidationResult,
  ValidationIssue,
} from '@archsync/shared';

export interface GraphData {
  nodes: ArchitectureNode[] | Array<Partial<ArchitectureNode> & { id: string }>;
  edges: ArchitectureEdge[] | Array<Partial<ArchitectureEdge> & { id: string; source: string; target: string }>;
}

export class ArchitectureValidationService {
  /**
   * Validates structural integrity and graph properties of an architecture diagram
   */
  public static validateGraph(graph: GraphData): ArchitectureValidationResult {
    const issues: ValidationIssue[] = [];
    let issueCounter = 1;

    const createIssueId = (): string => `issue-${issueCounter++}`;

    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    // 1. Check for Duplicate Node IDs and Empty Node Labels
    const seenNodeIds = new Set<string>();
    const nodeMap = new Map<string, (typeof nodes)[0]>();

    for (const node of nodes) {
      if (!node.id) continue;

      if (seenNodeIds.has(node.id)) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_NODE',
          severity: 'ERROR',
          message: `Duplicate node ID detected: "${node.id}"`,
          nodeIds: [node.id],
        });
      } else {
        seenNodeIds.add(node.id);
        nodeMap.set(node.id, node);
      }

      // Check empty or whitespace-only label
      const label = node.data?.label;
      if (typeof label !== 'string' || label.trim().length === 0) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_NODE',
          severity: 'ERROR',
          message: `Node "${node.id}" has an empty label`,
          nodeIds: [node.id],
        });
      }
    }

    // 2. Check for Duplicate Edge IDs and Edge Validity
    const seenEdgeIds = new Set<string>();

    for (const edge of edges) {
      if (!edge.id) continue;

      // Duplicate edge ID check
      if (seenEdgeIds.has(edge.id)) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Duplicate edge ID detected: "${edge.id}"`,
          edgeIds: [edge.id],
        });
      } else {
        seenEdgeIds.add(edge.id);
      }

      // Self-loop check (source === target)
      if (edge.source === edge.target) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Self-loop detected on edge "${edge.id}": source and target cannot be identical`,
          edgeIds: [edge.id],
          nodeIds: [edge.source],
        });
      }

      // Missing source node
      if (!seenNodeIds.has(edge.source)) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Edge "${edge.id}" references missing source node: "${edge.source}"`,
          edgeIds: [edge.id],
        });
      }

      // Missing target node
      if (!seenNodeIds.has(edge.target)) {
        issues.push({
          id: createIssueId(),
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Edge "${edge.id}" references missing target node: "${edge.target}"`,
          edgeIds: [edge.id],
        });
      }
    }

    // 3. Disconnected Node Detection (nodes with 0 incoming and 0 outgoing edges)
    // Only evaluate if there are nodes and at least one node is present
    if (nodes.length > 0) {
      const nodeDegrees = new Map<string, { inDegree: number; outDegree: number }>();
      for (const nodeId of seenNodeIds) {
        nodeDegrees.set(nodeId, { inDegree: 0, outDegree: 0 });
      }

      for (const edge of edges) {
        if (seenNodeIds.has(edge.source)) {
          const current = nodeDegrees.get(edge.source);
          if (current) current.outDegree++;
        }
        if (seenNodeIds.has(edge.target)) {
          const current = nodeDegrees.get(edge.target);
          if (current) current.inDegree++;
        }
      }

      for (const [nodeId, deg] of nodeDegrees.entries()) {
        if (deg.inDegree === 0 && deg.outDegree === 0) {
          const node = nodeMap.get(nodeId);
          const label = node?.data?.label || nodeId;
          issues.push({
            id: createIssueId(),
            code: 'DISCONNECTED_NODE',
            severity: 'WARNING',
            message: `Node "${label}" is disconnected from the architecture graph`,
            nodeIds: [nodeId],
          });
        }
      }
    }

    // 4. Circular Dependency Detection (Directed Cycle Detection using DFS)
    // Only inspect valid edges whose source and target exist
    const adjacency = new Map<string, string[]>();
    for (const nodeId of seenNodeIds) {
      adjacency.set(nodeId, []);
    }

    for (const edge of edges) {
      if (seenNodeIds.has(edge.source) && seenNodeIds.has(edge.target) && edge.source !== edge.target) {
        adjacency.get(edge.source)?.push(edge.target);
      }
    }

    // 0 = unvisited, 1 = visiting (in current recursion path), 2 = visited
    const visitState = new Map<string, number>();
    for (const nodeId of seenNodeIds) {
      visitState.set(nodeId, 0);
    }

    const detectedCycles: string[][] = [];

    const dfs = (currentNode: string, currentPath: string[]) => {
      visitState.set(currentNode, 1);
      currentPath.push(currentNode);

      const neighbors = adjacency.get(currentNode) || [];
      for (const neighbor of neighbors) {
        const neighborState = visitState.get(neighbor);
        if (neighborState === 1) {
          // Found cycle in current path
          const cycleStartIndex = currentPath.indexOf(neighbor);
          const cycle = currentPath.slice(cycleStartIndex);
          detectedCycles.push([...cycle, neighbor]);
        } else if (neighborState === 0) {
          dfs(neighbor, currentPath);
        }
      }

      currentPath.pop();
      visitState.set(currentNode, 2);
    };

    for (const nodeId of seenNodeIds) {
      if (visitState.get(nodeId) === 0) {
        dfs(nodeId, []);
      }
    }

    if (detectedCycles.length > 0) {
      for (const cycle of detectedCycles) {
        const uniqueCycleNodes = Array.from(new Set(cycle));
        issues.push({
          id: createIssueId(),
          code: 'CIRCULAR_DEPENDENCY',
          severity: 'WARNING',
          message: `Circular dependency detected along cycle: ${cycle.join(' -> ')}`,
          nodeIds: uniqueCycleNodes,
        });
      }
    }

    // Determine validity: valid is false ONLY if there is at least one issue with severity 'ERROR'
    const hasErrors = issues.some((issue) => issue.severity === 'ERROR');

    return {
      valid: !hasErrors,
      issues,
      validatedAt: new Date().toISOString(),
    };
  }
}
