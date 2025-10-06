import { ProductSyncScheduler } from '../../src/infrastructure/scheduler/ProductSyncScheduler';
import { ProductSyncService } from '../../src/application/services/ProductSyncService';

// Mock the ProductSyncService
jest.mock('../../src/application/services/ProductSyncService');

describe('Product Sync Performance Tests', () => {
  let scheduler: ProductSyncScheduler;
  let mockProductSyncService: jest.Mocked<ProductSyncService>;

  beforeEach(() => {
    scheduler = new ProductSyncScheduler();
    mockProductSyncService = (scheduler as any).productSyncService as jest.Mocked<ProductSyncService>;
  });

  afterEach(() => {
    scheduler.stop();
    jest.clearAllMocks();
  });

  describe('Sync Performance', () => {
    it('should complete sync within acceptable time for small dataset', async () => {
      const startTime = Date.now();
      
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 100,
        attributesCount: 50
      });

      await scheduler.runProductSyncNow();

      const duration = Date.now() - startTime;
      
      // Should complete within 5 seconds for small dataset
      expect(duration).toBeLessThan(5000);
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should complete sync within acceptable time for large dataset', async () => {
      const startTime = Date.now();
      
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 10000,
        attributesCount: 5000
      });

      await scheduler.runProductSyncNow();

      const duration = Date.now() - startTime;
      
      // Should complete within 30 seconds for large dataset
      expect(duration).toBeLessThan(30000);
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    }, 35000);

    it('should handle concurrent sync requests efficiently', async () => {
      const startTime = Date.now();
      
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 1000,
        attributesCount: 500
      });

      // Start multiple sync operations concurrently
      const promises = [
        scheduler.runProductSyncNow(),
        scheduler.runProductSyncNow(),
        scheduler.runProductSyncNow()
      ];

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds even with concurrent requests
      expect(duration).toBeLessThan(10000);
      
      // Only one sync should actually run due to concurrency protection
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    }, 15000);

    it('should handle sync failures gracefully without performance impact', async () => {
      const startTime = Date.now();
      
      mockProductSyncService.syncProducts.mockRejectedValue(new Error('Sync failed'));

      await scheduler.runProductSyncNow();

      const duration = Date.now() - startTime;
      
      // Should fail quickly without hanging
      expect(duration).toBeLessThan(5000);
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks during multiple sync operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run multiple sync operations
      for (let i = 0; i < 10; i++) {
        mockProductSyncService.syncProducts.mockResolvedValue({
          success: true,
          productsCount: 1000,
          attributesCount: 500
        });

        await scheduler.runProductSyncNow();
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, 30000);

    it('should handle large product datasets without memory issues', async () => {
      const startTime = Date.now();
      const initialMemory = process.memoryUsage().heapUsed;
      
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 50000, // Large dataset
        attributesCount: 25000
      });

      await scheduler.runProductSyncNow();

      const duration = Date.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(60000);
      
      // Memory increase should be reasonable even for large datasets
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB
    }, 70000);
  });

  describe('Scheduler Performance', () => {
    it('should start and stop scheduler quickly', () => {
      const startTime = Date.now();
      
      scheduler.start();
      const startDuration = Date.now() - startTime;
      
      expect(startDuration).toBeLessThan(1000); // Should start within 1 second
      expect(scheduler.getStatus().isScheduled).toBe(true);
      
      const stopStartTime = Date.now();
      scheduler.stop();
      const stopDuration = Date.now() - stopStartTime;
      
      expect(stopDuration).toBeLessThan(1000); // Should stop within 1 second
      expect(scheduler.getStatus().isScheduled).toBe(false);
    });

    it('should handle rapid start/stop cycles efficiently', () => {
      const startTime = Date.now();
      
      // Perform multiple start/stop cycles
      for (let i = 0; i < 100; i++) {
        scheduler.start();
        scheduler.stop();
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete 100 cycles within 5 seconds
      expect(duration).toBeLessThan(5000);
      expect(scheduler.getStatus().isScheduled).toBe(false);
    });

    it('should handle custom schedule changes efficiently', () => {
      const startTime = Date.now();
      
      // Test different cron expressions
      const cronExpressions = [
        '* * * * *', // Every minute
        '*/5 * * * *', // Every 5 minutes
        '0 */2 * * *', // Every 2 hours
        '0 0 * * *', // Daily
        '0 0 * * 0' // Weekly
      ];
      
      cronExpressions.forEach(cron => {
        scheduler.startWithCustomSchedule(cron);
        expect(scheduler.getStatus().isScheduled).toBe(true);
      });
      
      const duration = Date.now() - startTime;
      
      // Should handle all schedule changes within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover quickly from temporary failures', async () => {
      const startTime = Date.now();
      
      // First call fails, second succeeds
      mockProductSyncService.syncProducts
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          success: true,
          productsCount: 1000,
          attributesCount: 500
        });

      // First attempt should fail quickly
      await scheduler.runProductSyncNow();
      const firstDuration = Date.now() - startTime;
      expect(firstDuration).toBeLessThan(5000);
      
      // Second attempt should succeed quickly
      const secondStartTime = Date.now();
      await scheduler.runProductSyncNow();
      const secondDuration = Date.now() - secondStartTime;
      expect(secondDuration).toBeLessThan(5000);
      
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should handle network timeout scenarios efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate network timeout
      mockProductSyncService.syncProducts.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 1000)
        )
      );

      await scheduler.runProductSyncNow();

      const duration = Date.now() - startTime;
      
      // Should timeout and fail within 2 seconds
      expect(duration).toBeLessThan(2000);
      expect(mockProductSyncService.syncProducts).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  describe('Load Testing', () => {
    it('should handle high-frequency status checks', async () => {
      const startTime = Date.now();
      
      scheduler.start();
      
      // Perform 1000 status checks rapidly
      const statusChecks = Array.from({ length: 1000 }, () => scheduler.getStatus());
      const results = await Promise.all(statusChecks);
      
      const duration = Date.now() - startTime;
      
      // Should complete 1000 status checks within 1 second
      expect(duration).toBeLessThan(1000);
      
      // All status checks should return consistent results
      results.forEach(status => {
        expect(status).toHaveProperty('isRunning');
        expect(status).toHaveProperty('isScheduled');
        expect(typeof status.isRunning).toBe('boolean');
        expect(typeof status.isScheduled).toBe('boolean');
      });
    });

    it('should maintain performance under sustained load', async () => {
      const startTime = Date.now();
      
      mockProductSyncService.syncProducts.mockResolvedValue({
        success: true,
        productsCount: 1000,
        attributesCount: 500
      });

      // Run sync operations every 100ms for 5 seconds
      const operations = [];
      const endTime = startTime + 5000;
      
      while (Date.now() < endTime) {
        operations.push(scheduler.runProductSyncNow());
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Wait for all operations to complete
      await Promise.all(operations);
      
      const totalDuration = Date.now() - startTime;
      
      // Should complete within 6 seconds (5 seconds + 1 second buffer)
      expect(totalDuration).toBeLessThan(6000);
      
      // Should have run multiple sync operations
      expect(mockProductSyncService.syncProducts).toHaveBeenCalled();
    }, 10000);
  });
});
