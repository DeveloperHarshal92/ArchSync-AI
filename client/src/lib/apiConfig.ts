/**
 * Configuration helper for client-side API and Socket.IO URLs
 * Ensures seamless operation across local development (Vite proxy)
 * and production (Vercel frontend calling Render backend).
 */

/**
 * Resolves the base URL for RTK Query requests
 */
export function getApiBaseUrl(customEnvApiUrl?: string): string {
  const envUrl = customEnvApiUrl !== undefined
    ? customEnvApiUrl
    : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL).trim()
        : '');

  if (!envUrl) {
    // Default relative path for local development (relies on Vite proxy)
    return '/api/v1';
  }

  // Strip trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, '');

  // If already ends in /api/v1, preserve it; otherwise append /api/v1
  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }

  return `${cleanUrl}/api/v1`;
}

/**
 * Resolves the Socket.IO server target URL
 */
export function getSocketUrl(customSocketUrl?: string, customApiUrl?: string): string {
  if (customSocketUrl && customSocketUrl.trim().length > 0) {
    return customSocketUrl.trim().replace(/\/+$/, '');
  }

  const envSocketUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL
      ? String(import.meta.env.VITE_SOCKET_URL).trim()
      : '';

  if (envSocketUrl) {
    return envSocketUrl.replace(/\/+$/, '');
  }

  // If VITE_API_URL is configured with an absolute origin, derive socket URL from it
  const envApiUrl = customApiUrl !== undefined
    ? customApiUrl
    : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? String(import.meta.env.VITE_API_URL).trim()
        : '');

  if (envApiUrl && /^https?:\/\//i.test(envApiUrl)) {
    try {
      const parsed = new URL(envApiUrl);
      return parsed.origin;
    } catch {
      // Ignore parse failure and fall through
    }
  }

  // Fallback to window.location.origin in browser, or localhost in test/Node
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:5000';
}
