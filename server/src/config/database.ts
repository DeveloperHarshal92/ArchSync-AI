import mongoose from 'mongoose';
import { env } from './env';

export type DatabaseConnectionState = 'connected' | 'connecting' | 'disconnected' | 'unconfigured';

/**
 * MongoDB connection lifecycle manager matching RULES.md Section 2 & F02 requirements
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnecting = false;

  private constructor() {
    mongoose.connection.on('connected', () => {
      console.log('[ArchSync AI] MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[ArchSync AI] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[ArchSync AI] MongoDB connection closed');
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Returns the current connection state
   */
  public getState(): DatabaseConnectionState {
    if (!env.MONGODB_URI) {
      return 'unconfigured';
    }
    switch (mongoose.connection.readyState) {
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }

  /**
   * Attempts connection to MongoDB. Gracefully degrades if unavailable.
   */
  public async connect(): Promise<boolean> {
    if (!env.MONGODB_URI) {
      console.log('[ArchSync AI] MONGODB_URI not provided. Skipping database connection for development.');
      return false;
    }

    if (this.getState() === 'connected' || this.isConnecting) {
      return true;
    }

    this.isConnecting = true;
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      this.isConnecting = false;
      return true;
    } catch (error) {
      this.isConnecting = false;
      console.warn(
        '[ArchSync AI] Warning: Unable to connect to MongoDB. Continuing startup for local development without DB:',
        error instanceof Error ? error.message : error
      );
      return false;
    }
  }

  /**
   * Closes active database connection during graceful shutdown
   */
  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

export const dbManager = DatabaseManager.getInstance();
