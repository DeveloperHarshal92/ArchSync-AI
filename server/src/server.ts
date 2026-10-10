import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { dbManager } from './config/database';
import { initSocketServer, closeSocketServer } from './sockets';

const server = http.createServer(app);
const port = env.PORT;

// Initialize Socket.IO real-time collaboration engine
initSocketServer(server);

/**
 * Initializes database connection and starts HTTP listener
 */
async function startServer(): Promise<void> {
  // Initialize database connection if configured
  const connected = await dbManager.connect();
  if (!connected && env.NODE_ENV === 'production') {
    console.error('[ArchSync AI] FATAL: Server startup aborted because database is not connected in production mode');
    process.exit(1);
  }


  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ArchSync AI] Port ${port} is already in use by another running process.`);
      console.error(`[ArchSync AI] An instance of the backend server is already active on port ${port}.`);
      process.exit(1);
    } else {
      console.error('[ArchSync AI] Server encountered an error:', err);
      process.exit(1);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[ArchSync AI] Backend server running on port ${port} in ${env.NODE_ENV} mode`);
    console.log(`[ArchSync AI] Health check available at http://localhost:${port}/api/v1/health`);
    console.log(`[ArchSync AI] Socket.IO collaboration engine initialized`);
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
    // 1. Close Socket.IO server
    await closeSocketServer();
    console.log('[ArchSync AI] Socket.IO server closed.');

    // 2. Close HTTP server (stop accepting new connections)
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    console.log('[ArchSync AI] HTTP server closed.');

    // 3. Disconnect MongoDB connection
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

process.on('unhandledRejection', (reason: unknown) => {
  console.error(
    '[ArchSync AI] FATAL: Unhandled Promise Rejection:',
    reason instanceof Error ? reason.message : reason
  );
  shutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error: Error) => {
  console.error('[ArchSync AI] FATAL: Uncaught Exception:', error.message);
  shutdown('UNCAUGHT_EXCEPTION');
});

startServer().catch((err) => {
  console.error('[ArchSync AI] Failed to start server:', err);
  process.exit(1);
});

export { server, shutdown };

