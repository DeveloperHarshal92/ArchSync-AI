import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { dbManager } from './config/database';

const server = http.createServer(app);
const port = env.PORT;

/**
 * Initializes database connection and starts HTTP listener
 */
async function startServer(): Promise<void> {
  // Initialize database connection if configured
  await dbManager.connect();

  server.listen(port, () => {
    console.log(`[ArchSync AI] Backend server running on port ${port} in ${env.NODE_ENV} mode`);
    console.log(`[ArchSync AI] Health check available at http://localhost:${port}/api/v1/health`);
  });
}

let isShuttingDown = false;

/**
 * Graceful shutdown lifecycle handler matching F02 requirement 13
 */
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[ArchSync AI] Received ${signal}. Starting graceful shutdown...`);

  // Force exit fallback timeout
  const forceTimeout = setTimeout(() => {
    console.error('[ArchSync AI] Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  try {
    // 1. Close HTTP server (stop accepting new connections)
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    console.log('[ArchSync AI] HTTP server closed.');

    // 2. Disconnect MongoDB connection
    await dbManager.disconnect();
    console.log('[ArchSync AI] Database connection closed.');

    console.log('[ArchSync AI] Graceful shutdown complete.');
    process.exit(0);
  } catch (error) {
    console.error('[ArchSync AI] Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer().catch((err) => {
  console.error('[ArchSync AI] Failed to start server:', err);
  process.exit(1);
});

export { server };
