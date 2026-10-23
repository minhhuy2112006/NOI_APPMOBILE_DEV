import {
    Injectable,
    OnApplicationShutdown,
  } from '@nestjs/common';
  
  import {
    ConfigService,
  } from '@nestjs/config';
  
  import {
    drizzle,
    type NodePgDatabase,
  } from 'drizzle-orm/node-postgres';
  
  import {
    sql,
  } from 'drizzle-orm';
  
  import {
    Pool,
  } from 'pg';
  
  @Injectable()
  export class DatabaseService
    implements OnApplicationShutdown
  {
    private readonly pool: Pool;
  
    readonly db: NodePgDatabase;
  
    constructor(
      private readonly config: ConfigService,
    ) {
      const connectionString =
        this.config.getOrThrow<string>(
          'DATABASE_URL',
        );
  
      this.pool = new Pool({
        connectionString,
  
        max:
          this.config.get<number>(
            'DATABASE_POOL_MAX',
          ) ?? 10,
  
        connectionTimeoutMillis:
          this.config.get<number>(
            'DATABASE_CONNECTION_TIMEOUT_MS',
          ) ?? 5000,
  
        idleTimeoutMillis:
          this.config.get<number>(
            'DATABASE_IDLE_TIMEOUT_MS',
          ) ?? 30000,
  
        keepAlive: true,
  
        application_name:
          'noi-backend',
      });
  
      this.db = drizzle({
        client: this.pool,
      });
    }
  
    async ping(): Promise<void> {
      await this.db.execute(
        sql`select 1`,
      );
    }
  
    async onApplicationShutdown():
      Promise<void> {
      await this.pool.end();
    }
  }