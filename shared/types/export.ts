/**
 * Architecture export domain contracts matching RULES.md Section 4 & Epic F13
 */

import { ArchitectureNode, ArchitectureEdge, ArchitectureViewport } from './architecture';

export type ExportFormatIdentifier = 'archsync-architecture';

export interface ArchitectureExportProjectMetadata {
  id?: string;
  name: string;
  description?: string;
}

export interface ArchitectureExportPayload {
  version: number;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  viewport: ArchitectureViewport;
}

export interface ArchitectureExport {
  format: ExportFormatIdentifier;
  formatVersion: number;
  exportedAt: string;
  project: ArchitectureExportProjectMetadata;
  architecture: ArchitectureExportPayload;
}

export type SupportedExportFormat = 'png' | 'svg' | 'json';
