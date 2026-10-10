/**
 * Triggers a user browser download for a Blob payload and guarantees
 * memory cleanup by revoking the temporary Object URL.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Create temporary object URL
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Allow browser time to initiate download before revoking URL
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
