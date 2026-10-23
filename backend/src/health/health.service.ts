import {
    Injectable,
    ServiceUnavailableException,
  } from '@nestjs/common';
  
  import {
    DatabaseService,
  } from '../database/database.service';
  
  export type HealthResponse = {
    status: 'ok';
  
    database: 'up';
  
    timestamp: string;
  };
  
  @Injectable()
  export class HealthService {
    constructor(
      private readonly database:
        DatabaseService,
    ) {}
  
    async check():
      Promise<HealthResponse> {
      try {
        await this.database.ping();
  
        return {
          status: 'ok',
  
          database: 'up',
  
          timestamp:
            new Date().toISOString(),
        };
      } catch {
        throw new ServiceUnavailableException({
          status: 'error',
  
          database: 'down',
  
          timestamp:
            new Date().toISOString(),
        });
      }
    }
  }