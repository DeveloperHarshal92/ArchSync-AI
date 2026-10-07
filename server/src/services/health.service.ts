import { HealthCheckData } from '@archsync/shared';
import { env } from '../config/env';
import { dbManager } from '../config/database';

/**
 * Service providing health and diagnostic metadata
 */
export class HealthService {
  public getHealthStatus(): HealthCheckData {
    return {
      status: 'healthy',
      service: 'archsync-api',
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
      environment: env.NODE_ENV,
      version: '0.1.0',
      database: dbManager.getState(),
    };
  }
}

export const healthService = new HealthService();
