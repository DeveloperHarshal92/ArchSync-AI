import { ValidationIssue } from '@archsync/shared';
import { ValidationContext, ValidationRule } from '../types';

export class DisconnectedNodeRule implements ValidationRule {
  public readonly code = 'DISCONNECTED_NODE';
  public readonly name = 'Disconnected Node Rule';

  public evaluate(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Empty architecture graph has no disconnected nodes
    if (context.nodes.length === 0) {
      return issues;
    }

    // Inspect nodes in deterministic sorted order by nodeId
    const sortedNodeIds = Array.from(context.seenNodeIds).sort();

    for (const nodeId of sortedNodeIds) {
      const inDeg = context.inDegrees.get(nodeId) || 0;
      const outDeg = context.outDegrees.get(nodeId) || 0;

      if (inDeg === 0 && outDeg === 0) {
        const node = context.nodeMap.get(nodeId);
        const label = node?.data?.label || nodeId;

        issues.push({
          id: `issue-disconnected-${nodeId}`,
          code: 'DISCONNECTED_NODE',
          severity: 'WARNING',
          message: `Node "${label}" is disconnected from the architecture graph`,
          nodeIds: [nodeId],
        });
      }
    }

    return issues;
  }
}

export const disconnectedNodeRule = new DisconnectedNodeRule();
