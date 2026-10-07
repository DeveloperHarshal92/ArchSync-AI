import { Architecture, ArchitectureValidationResult } from '@archsync/shared';
import { ProjectArchitectureContext } from '../types';
import { MAX_NODES_IN_CONTEXT } from '../safety/aiSafety';

/**
 * Projects raw architecture domain document into a sanitized, bounded AI context
 */
export function buildArchitectureContext(
  architecture: Architecture,
  validationResult?: ArchitectureValidationResult | null,
  userQuestion?: string
): ProjectArchitectureContext {
  const nodes = (architecture.nodes || []).slice(0, MAX_NODES_IN_CONTEXT).map((node: any) => ({
    id: String(node.id || ''),
    type: String(node.type || 'unknown'),
    label: String(node.data?.label || node.label || node.id || 'Untitled Component'),
    technology: node.data?.technology || node.technology ? String(node.data?.technology || node.technology) : undefined,
    category: node.data?.category || node.category ? String(node.data?.category || node.category) : undefined,
    description: node.data?.description || node.description ? String(node.data?.description || node.description).slice(0, 300) : undefined,
    metadata: node.data?.metadata && typeof node.data.metadata === 'object' ? { ...node.data.metadata } : undefined,
  }));

  const edges = (architecture.edges || []).slice(0, MAX_NODES_IN_CONTEXT * 2).map((edge: any) => ({
    id: String(edge.id || ''),
    source: String(edge.source || ''),
    target: String(edge.target || ''),
    type: edge.type ? String(edge.type) : undefined,
    label: edge.label ? String(edge.label) : undefined,
  }));

  const validationIssues = validationResult?.issues
    ? validationResult.issues.map((issue: any) => ({
        code: String(issue.ruleId || issue.code || ''),
        severity: String(issue.severity),
        message: String(issue.message),
        nodeIds: issue.nodeIds ? issue.nodeIds.map(String) : [],
        edgeIds: issue.edgeIds ? issue.edgeIds.map(String) : [],
      }))
    : [];

  return {
    projectId: architecture.projectId,
    nodes,
    edges,
    version: architecture.version,
    validationIssues,
    question: userQuestion,
  };
}
