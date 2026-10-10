import {
  Architecture,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureExport,
} from '@archsync/shared';
import { sanitizeExportFilename } from './filename';

export interface JsonExportProjectMeta {
  id?: string;
  name: string;
  description?: string;
}

export interface JsonExportResult {
  data: ArchitectureExport;
  jsonString: string;
  blob: Blob;
  filename: string;
}

/**
 * Sanitizes an architecture node for portable JSON export,
 * stripping internal database fields, private Mongoose metadata,
 * or extraneous internal attributes.
 */
function sanitizeNode(node: ArchitectureNode): ArchitectureNode {
  return {
    id: node.id,
    type: node.type,
    position: {
      x: Number.isFinite(node.position?.x) ? Math.round(node.position.x) : 0,
      y: Number.isFinite(node.position?.y) ? Math.round(node.position.y) : 0,
    },
    width: typeof node.width === 'number' && Number.isFinite(node.width) ? Math.round(node.width) : undefined,
    height: typeof node.height === 'number' && Number.isFinite(node.height) ? Math.round(node.height) : undefined,
    data: {
      label: node.data?.label || 'Component',
      description: node.data?.description,
      technology: node.data?.technology,
      category: node.data?.category,
      metadata: node.data?.metadata ? { ...node.data.metadata } : undefined,
    },
    createdBy: node.createdBy || '',
    createdAt: node.createdAt || new Date().toISOString(),
    updatedAt: node.updatedAt || new Date().toISOString(),
  };
}

/**
 * Sanitizes an architecture edge for portable JSON export.
 */
function sanitizeEdge(edge: ArchitectureEdge): ArchitectureEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'default',
    label: edge.label,
    animated: Boolean(edge.animated),
    metadata: edge.metadata ? { ...edge.metadata } : undefined,
    createdBy: edge.createdBy || '',
    createdAt: edge.createdAt || new Date().toISOString(),
    updatedAt: edge.updatedAt || new Date().toISOString(),
  };
}

/**
 * Constructs the canonical, privacy-safe ArchitectureExport document.
 */
export function buildArchitectureJsonExport(
  project: JsonExportProjectMeta,
  architecture: Architecture,
  overrideTimestamp?: string
): ArchitectureExport {
  // Sort nodes and edges by id for deterministic serialization
  const sortedNodes = [...(architecture.nodes || [])]
    .map(sanitizeNode)
    .sort((a, b) => a.id.localeCompare(b.id));

  const sortedEdges = [...(architecture.edges || [])]
    .map(sanitizeEdge)
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    format: 'archsync-architecture',
    formatVersion: 1,
    exportedAt: overrideTimestamp || new Date().toISOString(),
    project: {
      name: project.name || 'Untitled Architecture',
      description: project.description,
    },
    architecture: {
      version: architecture.version ?? 1,
      nodes: sortedNodes,
      edges: sortedEdges,
      viewport: architecture.viewport || { x: 0, y: 0, zoom: 1 },
    },
  };
}

/**
 * Generates the complete JSON export bundle with serialized string, Blob, and filename.
 */
export function exportArchitectureAsJson(
  project: JsonExportProjectMeta,
  architecture: Architecture,
  overrideTimestamp?: string
): JsonExportResult {
  const exportData = buildArchitectureJsonExport(project, architecture, overrideTimestamp);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const filename = sanitizeExportFilename(project.name || 'architecture', 'json');

  return {
    data: exportData,
    jsonString,
    blob,
    filename,
  };
}
