import {
  ArchitectureValidationResult,
  ArchitectureNode,
  ArchitectureEdge,
} from '@archsync/shared';
import { validateArchitecture, GraphData as ValidationGraphData } from '../validation';

export interface GraphData {
  nodes: ArchitectureNode[] | Array<Partial<ArchitectureNode> & { id: string }>;
  edges: ArchitectureEdge[] | Array<Partial<ArchitectureEdge> & { id: string; source: string; target: string }>;
}

export class ArchitectureValidationService {
  /**
   * Validates structural integrity and graph properties of an architecture diagram
   * Delegates to modular rules engine in server/src/validation
   */
  public static validateGraph(graph: GraphData | ValidationGraphData): ArchitectureValidationResult {
    return validateArchitecture(graph);
  }
}
