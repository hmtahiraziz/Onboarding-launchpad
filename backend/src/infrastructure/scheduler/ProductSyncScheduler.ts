import * as cron from 'node-cron';
import { ProductSyncService } from '@/application/services/ProductSyncService';
import { logger } from '../../shared/utils/logger';

export class ProductSyncScheduler {
  private productSyncService: ProductSyncService;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.productSyncService = new ProductSyncService();
  }

  /**
   * Start the daily product sync cron job
   * Runs every day at 2:00 AM
   */
  start(): void {
    if (this.cronJob) {
      logger.warn('Product sync scheduler is already running');
      return;
    }

    // Schedule to run daily at 2:00 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.runProductSync();
    }, {
      scheduled: false, // Don't start immediately
      timezone: 'Australia/Sydney' // Use Australian timezone
    });

    this.cronJob.start();
    logger.info('Product sync scheduler started - will run daily at 2:00 AM (Australia/Sydney)');
  }

  /**
   * Stop the cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Product sync scheduler stopped');
    }
  }

  /**
   * Run product sync immediately (for testing or manual execution)
   */
  async runProductSyncNow(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Product sync is already running, skipping this execution');
      return;
    }

    await this.runProductSync();
  }

  /**
   * Get the status of the scheduler
   */
  getStatus(): {
    isRunning: boolean;
    isScheduled: boolean;
    nextRun?: Date;
  } {
    return {
      isRunning: this.isRunning,
      isScheduled: this.cronJob !== null,
      nextRun: this.cronJob ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined // Approximate next run
    };
  }

  /**
   * Internal method to run the product sync
   */
  private async runProductSync(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Product sync is already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting scheduled product sync...');
      
      const result = await this.productSyncService.syncProducts();
      
      const duration = Date.now() - startTime;
      
      if (result.success) {
        logger.info(`Scheduled product sync completed successfully in ${duration}ms. Products: ${result.productsCount}, Attributes: ${result.attributesCount}`);
      } else {
        logger.error(`Scheduled product sync failed after ${duration}ms: ${result.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Scheduled product sync failed after ${duration}ms:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run product sync with custom schedule (for testing)
   * @param cronExpression - Cron expression (e.g., '* * * * *' for every minute)
   */
  startWithCustomSchedule(cronExpression: string): void {
    if (this.cronJob) {
      this.stop();
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.runProductSync();
    }, {
      scheduled: false,
      timezone: 'Australia/Sydney'
    });

    this.cronJob.start();
    logger.info(`Product sync scheduler started with custom schedule: ${cronExpression}`);
  }
}
