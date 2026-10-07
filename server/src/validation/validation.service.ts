import {
  ArchitectureValidationResult,
  ValidationIssue,
  ValidationCode,
  ValidationSeverity,
} from '@archsync/shared';
import { GraphData, ValidationRule } from './types';
import { buildValidationContext } from './utils/graph';
import { invalidEdgeRule } from './rules/invalidEdge.rule';
import { disconnectedNodeRule } from './rules/disconnectedNode.rule';
import { circularDependencyRule } from './rules/circularDependency.rule';
import { missingConfigurationRule } from './rules/missingConfiguration.rule';
import { missingConnectionRule } from './rules/missingConnection.rule';

const CODE_PRECEDENCE: Record<ValidationCode, number> = {
  INVALID_EDGE: 10,
  INVALID_NODE: 15,
  MISSING_CONNECTION: 20,
  DISCONNECTED_NODE: 30,
  CIRCULAR_DEPENDENCY: 40,
  MISSING_CONFIGURATION: 50,
};

const SEVERITY_PRECEDENCE: Record<ValidationSeverity, number> = {
  ERROR: 1,
  WARNING: 2,
  INFO: 3,
};

export class ArchitectureValidationRulesEngine {
  private readonly rules: ValidationRule[] = [
    invalidEdgeRule,
    missingConnectionRule,
    disconnectedNodeRule,
    circularDependencyRule,
    missingConfigurationRule,
  ];

  /**
   * Evaluates the graph against all registered validation rules deterministically
   */
  public validate(graph: GraphData): ArchitectureValidationResult {
    // 1. Build immutable indexed graph context in O(V + E)
    const context = buildValidationContext(graph);

    // 2. Evaluate all rules
    const rawIssues: ValidationIssue[] = [];
    for (const rule of this.rules) {
      const ruleIssues = rule.evaluate(context);
      rawIssues.push(...ruleIssues);
    }

    // 3. Normalize affected node and edge arrays deterministically
    for (const issue of rawIssues) {
      if (issue.nodeIds) {
        issue.nodeIds = [...new Set(issue.nodeIds)].sort();
      }
      if (issue.edgeIds) {
        issue.edgeIds = [...new Set(issue.edgeIds)].sort();
      }
    }

    // 4. Deduplicate issues
    const seenIssueKeys = new Set<string>();
    const deduplicatedIssues: ValidationIssue[] = [];

    for (const issue of rawIssues) {
      const key = [
        issue.code,
        issue.severity,
        (issue.edgeIds || []).join(','),
        (issue.nodeIds || []).join(','),
        issue.message,
      ].join('::');

      if (!seenIssueKeys.has(key)) {
        seenIssueKeys.add(key);
        deduplicatedIssues.push(issue);
      }
    }

    // 5. Deterministic sorting:
    // Primary: Severity (ERROR -> WARNING -> INFO)
    // Secondary: Code precedence (INVALID_EDGE -> MISSING_CONNECTION -> DISCONNECTED_NODE -> CIRCULAR_DEPENDENCY -> MISSING_CONFIGURATION)
    // Tertiary: Message
    deduplicatedIssues.sort((a, b) => {
      const sevA = SEVERITY_PRECEDENCE[a.severity] ?? 99;
      const sevB = SEVERITY_PRECEDENCE[b.severity] ?? 99;
      if (sevA !== sevB) return sevA - sevB;

      const codeA = CODE_PRECEDENCE[a.code] ?? 99;
      const codeB = CODE_PRECEDENCE[b.code] ?? 99;
      if (codeA !== codeB) return codeA - codeB;

      return a.message.localeCompare(b.message);
    });

    // 6. Assign sequential, clean deterministic IDs matching F06 contracts
    let issueIndex = 1;
    const finalIssues = deduplicatedIssues.map((issue) => ({
      ...issue,
      id: `issue-${issueIndex++}`,
    }));

    // 7. Graph is valid if and only if there are ZERO ERROR-severity issues
    const hasErrors = finalIssues.some((issue) => issue.severity === 'ERROR');

    return {
      valid: !hasErrors,
      issues: finalIssues,
      validatedAt: new Date().toISOString(),
    };
  }
}

export const validationRulesEngine = new ArchitectureValidationRulesEngine();

/**
 * Pure function entry point for validating architecture diagrams
 */
export function validateArchitecture(graph: GraphData): ArchitectureValidationResult {
  return validationRulesEngine.validate(graph);
}
