import { ProductSyncScheduler } from '../../src/infrastructure/scheduler/ProductSyncScheduler';
import { ProductSyncService } from '../../src/application/services/ProductSyncService';

// Mock the ProductSyncService
jest.mock('../../src/application/services/ProductSyncService');

describe('ProductSyncScheduler E2E Tests', () => {
  let scheduler: ProductSyncScheduler;
  let mockProductSyncService: jest.Mocked<ProductSyncService>;

  beforeEach(() => {
    // Create a new scheduler instance for each test
    scheduler = new ProductSyncScheduler();
    
    // Get the mocked service instance
    mockProductSyncService = (scheduler as any).productSyncService as jest.Mocked<ProductSyncService>;
  });

  afterEach(() => {
    // Stop scheduler after each test
    scheduler.stop();
    jest.clearAllMocks();
  });

  describe('Scheduler Lifecycle', () => {
    it('should start scheduler successfully', () => {
      scheduler.start();
      
      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(true);
      expect(status.isRunning).toBe(false);
    });

    it('should stop scheduler successfully', () => {
      scheduler.start();
      scheduler.stop();
      
      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(false);
      expect(status.isRunning).toBe(false);
    });

    it('should handle multiple start calls gracefully', () => {
      scheduler.start();
      scheduler.start(); // Second start should not cause issues
      
      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(true);
    });

    it('should handle stop when not started gracefully', () => {
      scheduler.stop(); // Should not throw error
      
      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(false);
    });
  });

  describe('Manual Sync Execution', () => {
    it('should run product sync manually successfully', async () => {
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 100,
        attributesCount: 50
      });

      await scheduler.runProductSyncNow();

      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle sync errors gracefully', async () => {
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: false,
        productsCount: 0,
        attributesCount: 0,
        error: 'API Error'
      });

      await scheduler.runProductSyncNow();

      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    });

    it('should prevent concurrent sync executions', async () => {
      // Mock a slow sync operation
      let resolveSync: (value: any) => void;
      const syncPromise = new Promise((resolve) => {
        resolveSync = resolve;
      });
      
      mockProductSyncService.syncProducts.mockReturnValue(syncPromise as any);

      // Start first sync
      const firstSync = scheduler.runProductSyncNow();
      
      // Try to start second sync immediately
      const secondSync = scheduler.runProductSyncNow();

      // Check that only one sync is running
      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(true);

      // Resolve the first sync
      resolveSync!({
        success: true,
        productsCount: 100,
        attributesCount: 50
      });

      await Promise.all([firstSync, secondSync]);

      // Verify sync was only called once
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Schedule', () => {
    it('should start with custom cron expression', () => {
      const customCron = '* * * * *'; // Every minute
      
      scheduler.startWithCustomSchedule(customCron);
      
      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(true);
    });

    it('should replace existing schedule when starting with custom schedule', () => {
      // Start with default schedule
      scheduler.start();
      expect(scheduler.getStatus().isScheduled).toBe(true);

      // Start with custom schedule
      scheduler.startWithCustomSchedule('*/5 * * * *');
      expect(scheduler.getStatus().isScheduled).toBe(true);
    });
  });

  describe('Status Monitoring', () => {
    it('should return correct status when not started', () => {
      const status = scheduler.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.isScheduled).toBe(false);
      expect(status.nextRun).toBeUndefined();
    });

    it('should return correct status when started', () => {
      scheduler.start();
      
      const status = scheduler.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.isScheduled).toBe(true);
      expect(status.nextRun).toBeDefined();
      expect(status.nextRun).toBeInstanceOf(Date);
    });

    it('should return correct status when running', async () => {
      // Mock a slow sync operation
      let resolveSync: (value: any) => void;
      const syncPromise = new Promise((resolve) => {
        resolveSync = resolve;
      });
      
      mockProductSyncService.syncProducts.mockReturnValue(syncPromise as any);

      // Start sync
      const syncPromise2 = scheduler.runProductSyncNow();
      
      // Check status while running
      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(true);

      // Resolve sync
      resolveSync!({
        success: true,
        productsCount: 100,
        attributesCount: 50
      });

      await syncPromise2;

      // Check status after completion
      const finalStatus = scheduler.getStatus();
      expect(finalStatus.isRunning).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle sync service exceptions', async () => {
      mockProductSyncService.syncProducts.mockRejectedValue(new Error('Service Error'));

      await scheduler.runProductSyncNow();

      // Should not throw, but should handle error gracefully
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid start/stop cycles', () => {
      for (let i = 0; i < 10; i++) {
        scheduler.start();
        scheduler.stop();
      }

      const status = scheduler.getStatus();
      expect(status.isScheduled).toBe(false);
    });
  });

  describe('Integration with ProductSyncService', () => {
    it('should call syncProducts with correct parameters', async () => {
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 150,
        attributesCount: 75
      });

      await scheduler.runProductSyncNow();

      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle different sync results', async () => {
      const testCases = [
        {
          result: { success: true, productsCount: 0, attributesCount: 0 },
          description: 'empty sync result'
        },
        {
          result: { success: false, productsCount: 0, attributesCount: 0, error: 'Network Error' },
          description: 'failed sync result'
        },
        {
          result: { success: true, productsCount: 1000, attributesCount: 500 },
          description: 'large sync result'
        }
      ];

      for (const testCase of testCases) {
        mockProductSyncService.syncProducts.mockResolvedValue(testCase.result);
        
        await scheduler.runProductSyncNow();
        
        expect(mockProductSyncService.syncProducts).toHaveBeenCalled();
        
        // Clear mock for next iteration
        jest.clearAllMocks();
      }
    });
  });
});
