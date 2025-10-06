import { logger } from '../../src/shared/utils/logger';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PARAMOUNT_API_BASE_URL = 'https://www.paramountliquor.com.au/rest/V1';
  
  // Suppress logs during testing unless DEBUG is set
  if (!process.env.DEBUG) {
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });
  }
});

afterAll(async () => {
  // Cleanup after all tests
  logger.transports.forEach((transport) => {
    transport.silent = false;
  });
  
  // Force close any remaining handles
  if (global.gc) {
    global.gc();
  }
  
  // Clear any remaining timers
  jest.clearAllTimers();
  
  // Give a small delay to allow cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Global test timeout
jest.setTimeout(30000);
