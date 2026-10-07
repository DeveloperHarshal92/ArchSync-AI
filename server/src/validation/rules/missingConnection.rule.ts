import { ValidationIssue } from '@archsync/shared';
import { ValidationContext, ValidationRule } from '../types';

/**
 * MissingConnectionRule
 * Evaluates explicit connection constraints declared in component metadata.
 * To avoid false positives on user-defined architecture diagrams, does not impose
 * arbitrary implicit requirements (e.g. "every API must connect to database") unless
 * explicitly declared on the component.
 */
export class MissingConnectionRule implements ValidationRule {
  public readonly code = 'MISSING_CONNECTION';
  public readonly name = 'Missing Connection Rule';

  public evaluate(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const sortedNodeIds = Array.from(context.seenNodeIds).sort();

    for (const nodeId of sortedNodeIds) {
      const node = context.nodeMap.get(nodeId);
      if (!node) continue;

      const metadata = node.data?.metadata;
      if (!metadata || typeof metadata !== 'object') continue;

      const inDeg = context.inDegrees.get(nodeId) || 0;
      const outDeg = context.outDegrees.get(nodeId) || 0;
      const label = node.data?.label || nodeId;

      // Check requiresConnection (at least 1 connected edge)
      if (metadata.requiresConnection === true && inDeg === 0 && outDeg === 0) {
        issues.push({
          id: `issue-missing-conn-${nodeId}`,
          code: 'MISSING_CONNECTION',
          severity: 'WARNING',
          message: `Component "${label}" requires an active connection but has none`,
          nodeIds: [nodeId],
        });
      }

      // Check requiresOutgoing (at least 1 outgoing edge)
      if (metadata.requiresOutgoing === true && outDeg === 0) {
        issues.push({
          id: `issue-missing-conn-out-${nodeId}`,
          code: 'MISSING_CONNECTION',
          severity: 'WARNING',
          message: `Component "${label}" requires at least one outgoing connection`,
          nodeIds: [nodeId],
        });
      }

      // Check requiresIncoming (at least 1 incoming edge)
      if (metadata.requiresIncoming === true && inDeg === 0) {
        issues.push({
          id: `issue-missing-conn-in-${nodeId}`,
          code: 'MISSING_CONNECTION',
          severity: 'WARNING',
          message: `Component "${label}" requires at least one incoming connection`,
          nodeIds: [nodeId],
        });
      }
    }

    return issues;
  }
}

export const missingConnectionRule = new MissingConnectionRule();
