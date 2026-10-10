import { Architecture } from '@archsync/shared';
import { buildArchitectureSvg, SvgExportOptions } from './svgExporter';
import { sanitizeExportFilename } from './filename';

export interface PngExportOptions extends SvgExportOptions {
  pixelRatio?: number;
}

export interface PngExportResult {
  blob: Blob;
  filename: string;
}

/**
 * Converts an SVG string into a rasterized PNG Blob using an offscreen HTML5 Canvas.
 * Bounds maximum dimensions to ensure browser memory and canvas limits are respected.
 */
export async function svgToPngBlob(
  svgString: string,
  width: number,
  height: number,
  pixelRatio: number = 2
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Check for browser DOM support
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('PNG export is only supported in browser environments.'));
      return;
    }

    let objectUrl: string | null = null;
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      objectUrl = URL.createObjectURL(svgBlob);
    } catch (err) {
      reject(new Error(`Failed to create SVG Blob for PNG conversion: ${err instanceof Error ? err.message : String(err)}`));
      return;
    }

    const img = new Image();

    // Safety timeout in case Image never fires load or error
    const timer = setTimeout(() => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('PNG rendering timed out while loading vector graphic.'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');

        // Prevent exceeding maximum browser canvas dimensions (typically 8192 or 16384)
        const maxDimension = 8192;
        const maxSourceDim = Math.max(width, height, 1);
        const scale = Math.min(pixelRatio, maxDimension / maxSourceDim);

        canvas.width = Math.max(Math.round(width * scale), 1);
        canvas.height = Math.max(Math.round(height * scale), 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to obtain canvas 2D rendering context for PNG export.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        if (objectUrl) URL.revokeObjectURL(objectUrl);

        if (typeof canvas.toBlob === 'function') {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas rasterization produced empty PNG blob.'));
              }
            },
            'image/png'
          );
        } else {
          // Fallback via data URL if toBlob is unavailable (e.g. older environments)
          const dataUrl = canvas.toDataURL('image/png');
          const byteString = atob(dataUrl.split(',')[1]);
          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          resolve(new Blob([ab], { type: mimeString }));
        }
      } catch (err) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load SVG into browser image element for rasterization.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Exports architecture as a high-resolution PNG image.
 */
export async function exportArchitectureAsPng(
  project: { name: string; description?: string },
  architecture: Architecture,
  options: PngExportOptions = {}
): Promise<PngExportResult> {
  const pixelRatio = options.pixelRatio ?? 2;
  const { svgString, width, height } = buildArchitectureSvg(architecture, {
    ...options,
    projectName: project.name,
  });

  const blob = await svgToPngBlob(svgString, width, height, pixelRatio);
  const filename = sanitizeExportFilename(project.name || 'architecture', 'png');

  return { blob, filename };
}
