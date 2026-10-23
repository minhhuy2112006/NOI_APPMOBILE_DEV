import {
    describe,
    expect,
    it,
    jest,
  } from '@jest/globals';
  import { ServiceUnavailableException } from '@nestjs/common';
  
  import type { DatabaseService } from '../database/database.service';
  import { HealthService } from './health.service';
  
  describe('HealthService', () => {
    it('returns OK when database is reachable', async () => {
      const databaseService = {
        ping: jest.fn(async (): Promise<void> => undefined),
      } as unknown as DatabaseService;
  
      const service = new HealthService(databaseService);
  
      const result = await service.check();
  
      expect(result.status).toBe('ok');
      expect(result.database).toBe('up');
      expect(result.timestamp).toBeDefined();
    });
  
    it('throws 503 when database is unavailable', async () => {
      const databaseService = {
        ping: jest.fn(async (): Promise<void> => {
          throw new Error('Database unavailable');
        }),
      } as unknown as DatabaseService;
  
      const service = new HealthService(databaseService);
  
      await expect(
        service.check(),
      ).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });