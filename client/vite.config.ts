import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function createProxyErrorFilter() {
  return (proxy: any) => {
    const originalOn = proxy.on.bind(proxy);
    proxy.on = function (event: string, listener: (...args: any[]) => void) {
      if (event === 'error') {
        const wrappedListener = (err: any, req: any, res: any) => {
          const code = err?.code;
          if (code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'EPIPE') {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server is not reachable.' }));
            } else if (res && typeof res.end === 'function') {
              res.end();
            }
            return;
          }
          return listener(err, req, res);
        };
        return originalOn(event, wrappedListener);
      }
      return originalOn(event, listener);
    };
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: createProxyErrorFilter(),
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
        configure: createProxyErrorFilter(),
      },
    },
  },
});

