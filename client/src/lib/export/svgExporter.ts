import {
  Architecture,
  ArchitectureNode,
  ArchitectureNodeType,
} from '@archsync/shared';
import { sanitizeExportFilename } from './filename';

export interface SvgExportOptions {
  projectName?: string;
  padding?: number;
}

export interface SvgExportResult {
  svgString: string;
  width: number;
  height: number;
  blob: Blob;
  filename: string;
}

/**
 * Strict Brand Palette: Warm Ivory (#eae6ed), Deep Editorial Blue (#226192), Coral Orange (#ef8557).
 */
const NODE_COLORS: Record<ArchitectureNodeType, { accent: string; bg: string }> = {
  client: { accent: '#226192', bg: '#eae6ed' },
  'web-app': { accent: '#ef8557', bg: '#eae6ed' },
  'mobile-app': { accent: '#226192', bg: '#eae6ed' },
  'api-gateway': { accent: '#ef8557', bg: '#eae6ed' },
  server: { accent: '#226192', bg: '#eae6ed' },
  microservice: { accent: '#226192', bg: '#eae6ed' },
  database: { accent: '#ef8557', bg: '#eae6ed' },
  cache: { accent: '#ef8557', bg: '#eae6ed' },
  queue: { accent: '#226192', bg: '#eae6ed' },
  'external-api': { accent: '#ef8557', bg: '#eae6ed' },
  'cloud-service': { accent: '#226192', bg: '#eae6ed' },
};

const DEFAULT_COLOR = { accent: '#226192', bg: '#eae6ed' };
const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 110;

/**
 * Encodes special XML characters to prevent SVG injection and rendering breakage.
 */
export function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncates text safely for SVG text rendering with ellipsis.
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/**
 * Generates an SVG path for an edge between two node bounding boxes.
 */
function routeEdge(
  source: { x: number; y: number; w: number; h: number },
  target: { x: number; y: number; w: number; h: number }
): { pathData: string; midX: number; midY: number } {
  const scx = source.x + source.w / 2;
  const scy = source.y + source.h / 2;
  const tcx = target.x + target.w / 2;
  const tcy = target.y + target.h / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  let sx: number, sy: number, tx: number, ty: number;
  let c1x: number, c1y: number, c2x: number, c2y: number;

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal dominant
    if (dx >= 0) {
      sx = source.x + source.w;
      sy = scy;
      tx = target.x;
      ty = tcy;
      const offset = Math.max(Math.abs(dx) * 0.45, 30);
      c1x = sx + offset;
      c1y = sy;
      c2x = tx - offset;
      c2y = ty;
    } else {
      sx = source.x;
      sy = scy;
      tx = target.x + target.w;
      ty = tcy;
      const offset = Math.max(Math.abs(dx) * 0.45, 30);
      c1x = sx - offset;
      c1y = sy;
      c2x = tx + offset;
      c2y = ty;
    }
  } else {
    // Vertical dominant
    if (dy >= 0) {
      sx = scx;
      sy = source.y + source.h;
      tx = tcx;
      ty = target.y;
      const offset = Math.max(Math.abs(dy) * 0.45, 30);
      c1x = sx;
      c1y = sy + offset;
      c2x = tx;
      c2y = ty - offset;
    } else {
      sx = scx;
      sy = source.y;
      tx = tcx;
      ty = target.y + target.h;
      const offset = Math.max(Math.abs(dy) * 0.45, 30);
      c1x = sx;
      c1y = sy - offset;
      c2x = tx;
      c2y = ty + offset;
    }
  }

  // Calculate midpoint for edge label
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  const pathData = `M ${Math.round(sx)} ${Math.round(sy)} C ${Math.round(c1x)} ${Math.round(c1y)}, ${Math.round(c2x)} ${Math.round(c2y)}, ${Math.round(tx)} ${Math.round(ty)}`;
  return { pathData, midX, midY };
}

/**
 * Builds a standalone, sanitized SVG string representing the architecture diagram.
 */
export function buildArchitectureSvg(
  architecture: Architecture,
  options: SvgExportOptions = {}
): { svgString: string; width: number; height: number } {
  const nodes = architecture.nodes || [];
  const edges = architecture.edges || [];
  const padding = options.padding ?? 60;
  const projectName = options.projectName || 'Architecture Diagram';

  // 1. Handle Empty Diagram Gracefully
  if (nodes.length === 0) {
    const width = 800;
    const height = 500;
    const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #226192; font-family: Montserrat, system-ui, sans-serif;">
  <defs>
    <pattern id="empty-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#eae6ed" opacity="0.2" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="#226192" />
  <rect width="${width}" height="${height}" fill="url(#empty-grid-dots)" />
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="20" fill="#226192" stroke="#eae6ed" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6,6" />
  <circle cx="${width / 2}" cy="${height / 2 - 30}" r="32" fill="#eae6ed" fill-opacity="0.1" />
  <text x="${width / 2}" y="${height / 2 - 24}" fill="#ef8557" font-size="20" font-weight="700" text-anchor="middle">∅</text>
  <text x="${width / 2}" y="${height / 2 + 25}" fill="#eae6ed" font-size="16" font-weight="700" text-anchor="middle">${escapeXml(projectName)}</text>
  <text x="${width / 2}" y="${height / 2 + 50}" fill="#eae6ed" fill-opacity="0.7" font-size="12" text-anchor="middle">Empty Diagram — No components or connections added yet</text>
</svg>`;

    return { svgString, width, height };
  }

  // 2. Compute Bounding Box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const nodeMap = new Map<string, { x: number; y: number; w: number; h: number; node: ArchitectureNode }>();

  for (const node of nodes) {
    const x = Number.isFinite(node.position?.x) ? Math.round(node.position.x) : 0;
    const y = Number.isFinite(node.position?.y) ? Math.round(node.position.y) : 0;
    const w = typeof node.width === 'number' && Number.isFinite(node.width) ? Math.round(node.width) : DEFAULT_NODE_WIDTH;
    const h = typeof node.height === 'number' && Number.isFinite(node.height) ? Math.round(node.height) : DEFAULT_NODE_HEIGHT;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);

    nodeMap.set(node.id, { x, y, w, h, node });
  }

  const boxX = minX - padding;
  const boxY = minY - padding;
  const width = Math.max(maxX - minX + padding * 2, 400);
  const height = Math.max(maxY - minY + padding * 2, 300);

  // 3. Render SVG Elements
  const parts: string[] = [];

  // XML & Root SVG tag
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${boxX} ${boxY} ${width} ${height}" width="${width}" height="${height}" style="background-color: #eae6ed; font-family: Montserrat, system-ui, sans-serif;">`
  );

  // Defs: Marker Arrow & Grid Pattern
  parts.push(`  <defs>`);
  parts.push(`    <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`);
  parts.push(`      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef8557" />`);
  parts.push(`    </marker>`);
  parts.push(`    <pattern id="arch-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">`);
  parts.push(`      <circle cx="2" cy="2" r="1" fill="#226192" opacity="0.15" />`);
  parts.push(`    </pattern>`);
  parts.push(`  </defs>`);

  // Background rects
  parts.push(`  <rect x="${boxX}" y="${boxY}" width="${width}" height="${height}" fill="#eae6ed" />`);
  parts.push(`  <rect x="${boxX}" y="${boxY}" width="${width}" height="${height}" fill="url(#arch-grid-dots)" />`);

  // 4. Render Edges (rendered beneath nodes)
  parts.push(`  <g id="architecture-edges">`);
  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;

    const { pathData, midX, midY } = routeEdge(source, target);
    const isDashed = edge.type === 'dashed' || edge.animated;
    const strokeDash = isDashed ? ` stroke-dasharray="6,4"` : '';

    parts.push(`    <g id="edge-${escapeXml(edge.id)}">`);
    parts.push(
      `      <path d="${pathData}" fill="none" stroke="#226192" stroke-width="2"${strokeDash} marker-end="url(#arch-arrow)" opacity="0.85" />`
    );

    // Optional Edge Label
    if (edge.label && edge.label.trim()) {
      const labelText = escapeXml(truncateText(edge.label.trim(), 28));
      const labelWidth = Math.max(labelText.length * 7 + 16, 40);
      parts.push(
        `      <rect x="${Math.round(midX - labelWidth / 2)}" y="${Math.round(midY - 10)}" width="${labelWidth}" height="20" rx="4" fill="#eae6ed" stroke="#226192" stroke-opacity="0.3" stroke-width="1" />`
      );
      parts.push(
        `      <text x="${Math.round(midX)}" y="${Math.round(midY + 4)}" fill="#226192" font-size="10" font-weight="500" text-anchor="middle">${labelText}</text>`
      );
    }
    parts.push(`    </g>`);
  }
  parts.push(`  </g>`);

  // 5. Render Nodes
  parts.push(`  <g id="architecture-nodes">`);
  for (const [, { x, y, w, h, node }] of nodeMap.entries()) {
    const visual = NODE_COLORS[node.type] || DEFAULT_COLOR;
    const label = escapeXml(truncateText(node.data?.label || 'Component', 24));
    const typeLabel = escapeXml((node.type || 'server').toUpperCase());
    const category = escapeXml(truncateText(node.data?.category || '', 14));
    const description = node.data?.description ? escapeXml(truncateText(node.data.description, 32)) : '';
    const technology = node.data?.technology ? escapeXml(truncateText(node.data.technology, 18)) : '';

    parts.push(`    <g id="node-${escapeXml(node.id)}">`);
    // Node Card Rectangle
    parts.push(
      `      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#eae6ed" stroke="#226192" stroke-opacity="0.25" stroke-width="1.5" />`
    );

    // Header Pill for Type
    const typeBadgeWidth = Math.max(typeLabel.length * 6 + 14, 50);
    parts.push(
      `      <rect x="${x + 10}" y="${y + 10}" width="${typeBadgeWidth}" height="18" rx="4" fill="${visual.accent}" fill-opacity="0.12" stroke="${visual.accent}" stroke-opacity="0.35" stroke-width="1" />`
    );
    parts.push(
      `      <text x="${x + 10 + typeBadgeWidth / 2}" y="${y + 22}" fill="${visual.accent}" font-size="9" font-weight="700" text-anchor="middle">${typeLabel}</text>`
    );

    // Category on the right side of header
    if (category) {
      parts.push(
        `      <text x="${x + w - 12}" y="${y + 22}" fill="#226192" fill-opacity="0.6" font-size="9" font-weight="500" text-anchor="end">${category}</text>`
      );
    }

    // Divider Line
    parts.push(
      `      <line x1="${x}" y1="${y + 34}" x2="${x + w}" y2="${y + 34}" stroke="#226192" stroke-opacity="0.15" stroke-width="1" />`
    );

    // Node Title / Label
    parts.push(
      `      <text x="${x + 12}" y="${y + 54}" fill="#226192" font-size="13" font-weight="600">${label}</text>`
    );

    // Optional Description
    if (description) {
      parts.push(
        `      <text x="${x + 12}" y="${y + 72}" fill="#226192" fill-opacity="0.7" font-size="11">${description}</text>`
      );
    }

    // Optional Technology Badge
    if (technology) {
      const techY = description ? y + 82 : y + 66;
      const techWidth = Math.max(technology.length * 6 + 12, 40);
      parts.push(
        `      <rect x="${x + 12}" y="${techY}" width="${techWidth}" height="18" rx="4" fill="#226192" fill-opacity="0.08" stroke="#226192" stroke-opacity="0.25" stroke-width="1" />`
      );
      parts.push(
        `      <text x="${x + 12 + techWidth / 2}" y="${techY + 12}" fill="#226192" font-size="9" font-weight="500" text-anchor="middle">${technology}</text>`
      );
    }

    parts.push(`    </g>`);
  }
  parts.push(`  </g>`);

  parts.push(`</svg>`);

  const svgString = parts.join('\n');
  return { svgString, width, height };
}

/**
 * Exports the architecture as a standalone SVG file result bundle.
 */
export function exportArchitectureAsSvg(
  project: { name: string; description?: string },
  architecture: Architecture,
  options: SvgExportOptions = {}
): SvgExportResult {
  const { svgString, width, height } = buildArchitectureSvg(architecture, {
    ...options,
    projectName: project.name,
  });

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const filename = sanitizeExportFilename(project.name || 'architecture', 'svg');

  return {
    svgString,
    width,
    height,
    blob,
    filename,
  };
}
