import { ValidationIssue } from '@archsync/shared';
import { ValidationContext, ValidationRule } from '../types';
import { canonicalizeCycle } from '../utils/graph';

export class CircularDependencyRule implements ValidationRule {
  public readonly code = 'CIRCULAR_DEPENDENCY';
  public readonly name = 'Circular Dependency Rule';

  public evaluate(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (context.nodes.length === 0) {
      return issues;
    }

    // 0 = unvisited, 1 = visiting (in active recursion stack), 2 = visited
    const visitState = new Map<string, number>();
    for (const nodeId of context.seenNodeIds) {
      visitState.set(nodeId, 0);
    }

    const seenCycleSignatures = new Set<string>();
    const sortedNodeIds = Array.from(context.seenNodeIds).sort();

    const dfs = (currentNode: string, currentPath: string[]) => {
      visitState.set(currentNode, 1);
      currentPath.push(currentNode);

      const neighbors = (context.adjacency.get(currentNode) || []).slice().sort();
      for (const neighbor of neighbors) {
        const neighborState = visitState.get(neighbor) || 0;
        if (neighborState === 1) {
          // Detected cycle in active recursion stack
          const cycleStartIndex = currentPath.indexOf(neighbor);
          if (cycleStartIndex !== -1) {
            const cyclePath = currentPath.slice(cycleStartIndex); // e.g. ['A', 'B', 'C']
            const cycleSignature = canonicalizeCycle(cyclePath);

            if (!seenCycleSignatures.has(cycleSignature)) {
              seenCycleSignatures.add(cycleSignature);
              const uniqueCycleNodes = Array.from(new Set(cyclePath)).sort();
              const fullCycleDisplay = [...cyclePath, neighbor];

              issues.push({
                id: `issue-circular-dep-${cycleSignature.replace(/->/g, '-')}`,
                code: 'CIRCULAR_DEPENDENCY',
                severity: 'WARNING',
                message: `Circular dependency detected along cycle: ${fullCycleDisplay.join(' -> ')}`,
                nodeIds: uniqueCycleNodes,
              });
            }
          }
        } else if (neighborState === 0) {
          dfs(neighbor, currentPath);
        }
      }

      currentPath.pop();
      visitState.set(currentNode, 2);
    };

    for (const nodeId of sortedNodeIds) {
      if ((visitState.get(nodeId) || 0) === 0) {
        dfs(nodeId, []);
      }
    }

    // Sort issues deterministically by message
    return issues.sort((a, b) => a.message.localeCompare(b.message));
  }
}

export const circularDependencyRule = new CircularDependencyRule();
