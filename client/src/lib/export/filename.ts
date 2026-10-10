import { SupportedExportFormat } from '@archsync/shared';

/**
 * Normalizes project names into safe, predictable filenames for architecture export.
 * Strips path separators, control characters, filesystem reserved characters,
 * collapses hyphens, and ensures a clean, consistent file extension.
 */
export function sanitizeExportFilename(
  projectName: string,
  extension: SupportedExportFormat
): string {
  if (!projectName || typeof projectName !== 'string') {
    return `archsync-architecture.${extension}`;
  }

  // 1. Remove control characters (0x00-0x1f and 0x7f)
  let sanitized = projectName.replace(/[\x00-\x1f\x7f]/g, '');

  // 2. Remove or replace filesystem-reserved characters & dots: < > : " / \ | ? * .
  sanitized = sanitized.replace(/[<>:"/\\|?*.]/g, '-');

  // 3. Replace whitespace and underscores with hyphens
  sanitized = sanitized.replace(/[\s_]+/g, '-');

  // 4. Strip any non-alphanumeric character that isn't a hyphen
  sanitized = sanitized.replace(/[^a-zA-Z0-9-]/g, '');

  // 5. Collapse multiple consecutive hyphens into a single hyphen
  sanitized = sanitized.replace(/-+/g, '-');

  // 6. Convert to lower case and trim leading/trailing hyphens and dots
  sanitized = sanitized.toLowerCase().replace(/^[.-]+|[.-]+$/g, '');

  // 7. Fallback if the sanitized result is empty
  if (!sanitized) {
    sanitized = 'archsync-architecture';
  }

  return `${sanitized}.${extension}`;
}
