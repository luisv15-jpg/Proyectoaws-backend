import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Signer } from '@aws-sdk/rds-signer';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnApplicationShutdown {
  private pool: Pool | null = null;
  private db: NodePgDatabase<typeof schema> | null = null;
  private connectionPromise: Promise<void> | null = null;
  private readonly logger = new Logger(DrizzleService.name);

  constructor() {
    this.connectionPromise = this.initializeConnection();
  }

  private async generateToken(): Promise<string> {
    // Si estamos en desarrollo local, usar contraseña normal
    if (process.env.NODE_ENV !== 'production') {
      return process.env.DB_PASSWORD || '';
    }

    // En producción, usar IAM token
    const signer = new Signer({
      region: process.env.AWS_REGION || 'us-east-1',
      hostname: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME!,
    });
    return await signer.getAuthToken();
  }

  private async initializeConnection() {
    try {
      const token = await this.generateToken();
      const isProduction = process.env.NODE_ENV === 'production';

      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: token,
        database: process.env.DB_DATABASE,
        ssl: isProduction ? {
          rejectUnauthorized: true,
        } : {
          rejectUnauthorized: false,
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      this.pool.on('error', (err) => {
        this.logger.error('Error en pool de conexiones:', err);
      });

      this.db = drizzle(this.pool, { schema });

      // Probar conexión
      const result = await this.pool.query('SELECT NOW()');
      this.logger.log(`✅ Conexión a RDS establecida - ${result.rows[0].now}`);

    } catch (error) {
      this.logger.error('Error al conectar a RDS:', error);
      throw error;
    }
  }

  async getDb(): Promise<NodePgDatabase<typeof schema>> {
    if (this.connectionPromise) {
      await this.connectionPromise;
      this.connectionPromise = null;
    }
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }
    return this.db;
  }

  async query(sql: string, params?: any[]) {
    if (!this.pool) {
      throw new Error('Pool no inicializado');
    }
    return this.pool.query(sql, params);
  }

  async getTables() {
    const result = await this.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    return result.rows;
  }

  async onApplicationShutdown(signal: string) {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('🔌 Conexión a RDS cerrada');
    }
  }
}