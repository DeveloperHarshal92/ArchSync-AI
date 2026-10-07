import { Types } from 'mongoose';
import {
  Architecture,
  ArchitectureValidationResult,
  UpdateArchitectureRequest,
} from '@archsync/shared';
import { ArchitectureModel } from '../models/architecture.model';
import { permissionService } from './permission.service';
import { ArchitectureValidationService } from './architectureValidation.service';
import { ConflictError, ValidationError } from '../utils/errors';

export class ArchitectureService {
  /**
   * Retrieves current project architecture or returns a default empty architecture (version 1)
   */
  public async getArchitecture(
    userId: string,
    projectId: string
  ): Promise<{ architecture: Architecture; validation: ArchitectureValidationResult }> {
    // 1. Authorize project access (OWNER, EDITOR, VIEWER)
    await permissionService.requireProjectAccess(userId, projectId);

    // 2. Fetch architecture document from MongoDB
    const doc = await ArchitectureModel.findOne({
      projectId: new Types.ObjectId(projectId),
    });

    let architecture: Architecture;

    if (doc) {
      architecture = doc.toSafeObject();
    } else {
      // If no architecture document exists yet, return valid empty architecture with version 1
      architecture = {
        projectId,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const validation = ArchitectureValidationService.validateGraph(architecture);

    return { architecture, validation };
  }

  /**
   * Replaces project architecture with optimistic concurrency control
   */
  public async replaceArchitecture(
    userId: string,
    projectId: string,
    payload: UpdateArchitectureRequest
  ): Promise<{ architecture: Architecture; validation: ArchitectureValidationResult }> {
    // 1. Authorize role (OWNER and EDITOR allowed; VIEWER gets 403 Forbidden)
    await permissionService.requireProjectRole(userId, projectId, ['OWNER', 'EDITOR']);

    // 2. Validate structural graph integrity
    const validation = ArchitectureValidationService.validateGraph({
      nodes: payload.nodes,
      edges: payload.edges,
    });

    if (!validation.valid) {
      const errorDetails = validation.issues.filter((i) => i.severity === 'ERROR');
      throw new ValidationError(
        `Architecture graph integrity validation failed: ${errorDetails[0]?.message || 'Invalid graph'}`,
        validation.issues
      );
    }

    // 3. Find current document to verify optimistic concurrency version
    const existingDoc = await ArchitectureModel.findOne({
      projectId: new Types.ObjectId(projectId),
    });

    let savedArchitecture: Architecture;

    if (existingDoc) {
      // Verify submitted version matches current server version
      if (payload.version !== existingDoc.version) {
        throw new ConflictError(
          `Architecture version conflict. Expected version ${existingDoc.version}, received ${payload.version}`,
          'VERSION_CONFLICT',
          {
            expectedVersion: existingDoc.version,
            submittedVersion: payload.version,
          }
        );
      }

      // Increment version
      const nextVersion = existingDoc.version + 1;

      existingDoc.nodes = payload.nodes.map((node) => ({
        ...node,
        createdBy: node.createdBy || userId,
        createdAt: node.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      existingDoc.edges = payload.edges.map((edge) => ({
        ...edge,
        createdBy: edge.createdBy || userId,
        createdAt: edge.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      existingDoc.viewport = payload.viewport;
      existingDoc.version = nextVersion;

      const updated = await existingDoc.save();
      savedArchitecture = updated.toSafeObject();
    } else {
      // First persistence: initial version submitted must be 1
      if (payload.version !== 1) {
        throw new ConflictError(
          `Initial architecture version must be 1, received ${payload.version}`,
          'VERSION_CONFLICT',
          {
            expectedVersion: 1,
            submittedVersion: payload.version,
          }
        );
      }

      const created = await ArchitectureModel.create({
        projectId: new Types.ObjectId(projectId),
        nodes: payload.nodes.map((node) => ({
          ...node,
          createdBy: node.createdBy || userId,
          createdAt: node.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        edges: payload.edges.map((edge) => ({
          ...edge,
          createdBy: edge.createdBy || userId,
          createdAt: edge.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        viewport: payload.viewport,
        version: 2, // Incremented after first save
      });

      savedArchitecture = created.toSafeObject();
    }

    return { architecture: savedArchitecture, validation };
  }

  /**
   * Directly validates an architecture graph structure
   */
  public validateArchitectureGraph(graph: {
    nodes: any[];
    edges: any[];
  }): ArchitectureValidationResult {
    return ArchitectureValidationService.validateGraph(graph);
  }
}

export const architectureService = new ArchitectureService();
