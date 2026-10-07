import { ValidationIssue } from '@archsync/shared';
import { ValidationContext, ValidationRule } from '../types';

export class MissingConfigurationRule implements ValidationRule {
  public readonly code = 'MISSING_CONFIGURATION';
  public readonly name = 'Missing Configuration Rule';

  public evaluate(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Deterministic inspection in sorted order of node ID
    const sortedNodeIds = Array.from(context.seenNodeIds).sort();

    for (const nodeId of sortedNodeIds) {
      const node = context.nodeMap.get(nodeId);
      if (!node) continue;

      const label = node.data?.label;

      // 1. Core contract: Every architecture node must have a non-empty label
      if (typeof label !== 'string' || label.trim().length === 0) {
        // Also report INVALID_NODE for backward compatibility with F06 expectations
        issues.push({
          id: `issue-missing-config-label-${nodeId}`,
          code: 'MISSING_CONFIGURATION',
          severity: 'ERROR',
          message: `Node "${nodeId}" has an empty or missing label`,
          nodeIds: [nodeId],
        });
        issues.push({
          id: `issue-invalid-node-label-${nodeId}`,
          code: 'INVALID_NODE',
          severity: 'ERROR',
          message: `Node "${nodeId}" has an empty label`,
          nodeIds: [nodeId],
        });
      }

      // 2. Component metadata contract: Component declaring requiresTechnology must specify technology
      const metadata = node.data?.metadata;
      if (metadata && typeof metadata === 'object') {
        if (metadata.requiresTechnology === true) {
          const tech = node.data?.technology;
          if (typeof tech !== 'string' || tech.trim().length === 0) {
            issues.push({
              id: `issue-missing-config-tech-${nodeId}`,
              code: 'MISSING_CONFIGURATION',
              severity: 'WARNING',
              message: `Node "${label || nodeId}" is missing required technology specification`,
              nodeIds: [nodeId],
            });
          }
        }
      }
    }

    return issues;
  }
}

export const missingConfigurationRule = new MissingConfigurationRule();
