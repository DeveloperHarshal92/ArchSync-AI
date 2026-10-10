import { describe, it, expect } from 'vitest';
import { getApiBaseUrl, getSocketUrl } from '../lib/apiConfig';

describe('ArchSync AI — F15 Client API & Socket URL Configuration', () => {
  describe('getApiBaseUrl()', () => {
    it('returns default /api/v1 when VITE_API_URL is unset', () => {
      const url = getApiBaseUrl('');
      expect(url).toBe('/api/v1');
    });

    it('appends /api/v1 to absolute backend URL without trailing slash', () => {
      const url = getApiBaseUrl('https://archsync-api.onrender.com');
      expect(url).toBe('https://archsync-api.onrender.com/api/v1');
    });

    it('strips trailing slashes before appending /api/v1', () => {
      const url = getApiBaseUrl('https://archsync-api.onrender.com///');
      expect(url).toBe('https://archsync-api.onrender.com/api/v1');
    });

    it('preserves /api/v1 when already explicitly included in VITE_API_URL', () => {
      const url = getApiBaseUrl('https://archsync-api.onrender.com/api/v1');
      expect(url).toBe('https://archsync-api.onrender.com/api/v1');
    });

    it('preserves /api/v1 with trailing slash cleanly', () => {
      const url = getApiBaseUrl('https://archsync-api.onrender.com/api/v1/');
      expect(url).toBe('https://archsync-api.onrender.com/api/v1');
    });
  });

  describe('getSocketUrl()', () => {
    it('prefers customUrl when provided', () => {
      const url = getSocketUrl('https://custom-socket.example.com');
      expect(url).toBe('https://custom-socket.example.com');
    });

    it('derives socket origin from absolute VITE_API_URL when VITE_SOCKET_URL is unset', () => {
      const url = getSocketUrl('', 'https://archsync-api.onrender.com/api/v1');
      expect(url).toBe('https://archsync-api.onrender.com');
    });

    it('falls back to localhost:5000 in test environment when no URLs configured', () => {
      const url = getSocketUrl('', '');
      expect(url).toBe('http://localhost:5000');
    });
  });
});
