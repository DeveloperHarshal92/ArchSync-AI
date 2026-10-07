import {
  ValidationIssue,
  ValidationCode,
} from '@archsync/shared';

export interface GraphData {
  nodes?: any[];
  edges?: any[];
}

export interface ValidationContext {
  nodes: any[];
  edges: any[];
  nodeMap: Map<string, any>;
  seenNodeIds: Set<string>;
  duplicateNodeIds: Set<string>;
  seenEdgeIds: Set<string>;
  duplicateEdgeIds: Set<string>;
  adjacency: Map<string, string[]>;
  inDegrees: Map<string, number>;
  outDegrees: Map<string, number>;
}

export interface ValidationRule {
  readonly code: ValidationCode;
  readonly name: string;
  evaluate(context: ValidationContext): ValidationIssue[];
}
