import { HealthCheckData } from '@archsync/shared';
import { env } from '../config/env';
import { dbManager } from '../config/database';

export interface LivenessData {
  status: 'alive';
  service: string;
  timestamp: string;
  uptime: number;
}

export interface ReadinessData {
  ready: boolean;
  status: 'ready' | 'not_ready';
  service: string;
  database: string;
  timestamp: string;
}

/**
 * Service providing health, liveness, and readiness diagnostics
 */
export class HealthService {
  public getHealthStatus(): HealthCheckData {
    const dbState = dbManager.getState();

    return {
      status: 'healthy',
      service: 'archsync-api',
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
      environment: env.NODE_ENV,
      version: '0.1.0',
      database: dbState,
    };
  }

  public getLivenessStatus(): LivenessData {
    return {
      status: 'alive',
      service: 'archsync-api',
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    };
  }

  public getReadinessStatus(): ReadinessData {
    const dbState = dbManager.getState();
    const isReady = dbState === 'connected';

    return {
      ready: isReady,
      status: isReady ? 'ready' : 'not_ready',
      service: 'archsync-api',
      database: dbState,
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();

