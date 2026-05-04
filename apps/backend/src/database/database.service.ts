import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool(this.createPoolConfig());
  }

  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  private createPoolConfig(): PoolConfig {
    if (process.env.DATABASE_URL) {
      return {
        connectionString: process.env.DATABASE_URL,
      };
    }

    return {
      host: process.env.DB_HOST ?? 'localhost',
      port: this.parsePort(process.env.DB_PORT, 5433),
      user: process.env.DB_USER ?? 'proy2',
      password: process.env.DB_PASSWORD ?? 'secret',
      database: process.env.DB_NAME ?? 'retrosound',
    };
  }

  private parsePort(value: string | undefined, fallback: number): number {
    if (!value) return fallback;

    const port = Number(value);
    return Number.isInteger(port) && port > 0 ? port : fallback;
  }
}
