import { ValidationIssue } from '@archsync/shared';
import { ValidationContext, ValidationRule } from '../types';

export class InvalidEdgeRule implements ValidationRule {
  public readonly code = 'INVALID_EDGE';
  public readonly name = 'Invalid Edge Rule';

  public evaluate(context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // 1. Report duplicate node IDs (INVALID_NODE)
    for (const dupNodeId of Array.from(context.duplicateNodeIds).sort()) {
      issues.push({
        id: `issue-invalid-node-dup-${dupNodeId}`,
        code: 'INVALID_NODE',
        severity: 'ERROR',
        message: `Duplicate node ID detected: "${dupNodeId}"`,
        nodeIds: [dupNodeId],
      });
    }

    // 2. Report duplicate edge IDs (INVALID_EDGE)
    for (const dupEdgeId of Array.from(context.duplicateEdgeIds).sort()) {
      issues.push({
        id: `issue-invalid-edge-dup-${dupEdgeId}`,
        code: 'INVALID_EDGE',
        severity: 'ERROR',
        message: `Duplicate edge ID detected: "${dupEdgeId}"`,
        edgeIds: [dupEdgeId],
      });
    }

    // 3. Inspect each edge in stable order
    const edgeList = [...context.edges].sort((a, b) => (a?.id || '').localeCompare(b?.id || ''));

    for (const edge of edgeList) {
      if (!edge || !edge.id) continue;

      // Self-loop check (source === target)
      if (edge.source && edge.target && edge.source === edge.target) {
        issues.push({
          id: `issue-invalid-edge-self-${edge.id}`,
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Self-loop detected on edge "${edge.id}": source and target cannot be identical`,
          edgeIds: [edge.id],
          nodeIds: [edge.source],
        });
      }

      // Missing source node
      if (!edge.source || !context.seenNodeIds.has(edge.source)) {
        issues.push({
          id: `issue-invalid-edge-src-${edge.id}`,
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Edge "${edge.id}" references missing source node: "${edge.source || 'undefined'}"`,
          edgeIds: [edge.id],
        });
      }

      // Missing target node
      if (!edge.target || !context.seenNodeIds.has(edge.target)) {
        issues.push({
          id: `issue-invalid-edge-tgt-${edge.id}`,
          code: 'INVALID_EDGE',
          severity: 'ERROR',
          message: `Edge "${edge.id}" references missing target node: "${edge.target || 'undefined'}"`,
          edgeIds: [edge.id],
        });
      }
    }

    return issues;
  }
}

export const invalidEdgeRule = new InvalidEdgeRule();
