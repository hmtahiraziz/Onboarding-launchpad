import { logger } from '../src/shared/utils/logger';

// Global test setup for Node.js v21.7.1
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PARAMOUNT_API_BASE_URL = 'https://www.paramountliquor.com.au/rest/V1';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paramount_test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.PORT = '3001';
  
  // Suppress logs during testing unless DEBUG is set
  if (!process.env.DEBUG) {
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });
  }

  // Set up global test timeout for Node.js v21.7.1
  jest.setTimeout(30000);
  
  // Log Node.js version for verification
  console.log(`Running tests with Node.js ${process.version}`);
});

afterAll(async () => {
  // Cleanup after all tests
  logger.transports.forEach((transport) => {
    transport.silent = false;
  });
});

// Global test utilities
global.testUtils = {
  // Mock data generators
  createMockCustomer: (overrides = {}) => ({
    id: 'test-customer-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    businessName: 'Test Business',
    abn: '12345678901',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia'
    },
    preferences: {
      productCategories: ['wine', 'spirits'],
      priceRange: { min: 10, max: 100 }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockProduct: (overrides = {}) => ({
    id: 'test-product-id',
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    description: 'Test product description',
    price: 25.99,
    category: 'wine',
    brand: 'Test Brand',
    volume: '750ml',
    alcoholContent: '13.5%',
    country: 'Australia',
    region: 'Barossa Valley',
    vintage: '2023',
    inStock: true,
    stockQuantity: 100,
    images: ['https://example.com/image1.jpg'],
    attributes: {
      color: 'Red',
      body: 'Full',
      sweetness: 'Dry',
      acidity: 'Medium'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockOnboardingSession: (overrides = {}) => ({
    id: 'test-session-id',
    customerId: 'test-customer-id',
    step: 'business-info',
    completedSteps: ['welcome'],
    data: {
      businessType: 'retail',
      yearsInBusiness: 5,
      monthlyVolume: '1000-5000'
    },
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Wait utility for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API responses
  mockApiResponse: (data: any, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {}
  }),

  // Create test database connection string
  getTestDbUri: () => process.env.MONGODB_URI || 'mongodb://localhost:27017/paramount_test'
};

// Extend Jest matchers for better assertions
expect.extend({
  toBeValidObjectId(received: string) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const pass = objectIdRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid MongoDB ObjectId`,
      pass
    };
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email address`,
      pass
    };
  },

  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid Date`,
      pass
    };
  }
});

// Declare global types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidObjectId(): R;
      toBeValidEmail(): R;
      toBeValidDate(): R;
    }
  }

  var testUtils: {
    createMockCustomer: (overrides?: any) => any;
    createMockProduct: (overrides?: any) => any;
    createMockOnboardingSession: (overrides?: any) => any;
    wait: (ms: number) => Promise<void>;
    mockApiResponse: (data: any, status?: number) => any;
    getTestDbUri: () => string;
  };
}
