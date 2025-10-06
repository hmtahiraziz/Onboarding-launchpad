# E2E Tests for Product Sync System

This directory contains comprehensive end-to-end tests for the product synchronization system, including the ProductSyncService, ProductSyncScheduler, and related API endpoints.

## Test Structure

### Test Files

1. **`product-sync.e2e.test.ts`** - Tests for ProductSyncService
   - API integration tests
   - Data processing and attribute extraction
   - File operations (products.json and attributes.json)
   - Error handling scenarios

2. **`product-sync-scheduler.e2e.test.ts`** - Tests for ProductSyncScheduler
   - Scheduler lifecycle management
   - Manual sync execution
   - Custom schedule handling
   - Status monitoring
   - Concurrency control

3. **`sync-api.e2e.test.ts`** - Tests for API endpoints
   - GET /api/sync/status
   - POST /api/sync/run
   - POST /api/sync/start
   - POST /api/sync/stop
   - Error handling and edge cases

### Setup Files

- **`setup.ts`** - Global test configuration and environment setup

## Running Tests

### Prerequisites

Install dependencies:
```bash
npm install
```

### Available Test Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests in watch mode
npm run test:e2e:watch

# Run e2e tests for CI (with coverage)
npm run test:e2e:ci

# Run specific test file
npm run test:e2e -- --testNamePattern="ProductSyncService"

# Run tests with verbose output
npm run test:e2e -- --verbose
```

### Test Environment

The tests use the following environment variables:
- `NODE_ENV=test`
- `PARAMOUNT_API_BASE_URL=https://www.paramountliquor.com.au/rest/V1`

## Test Coverage

### ProductSyncService Tests

- ✅ **API Integration**
  - Fetches products from Paramount API
  - Handles API errors gracefully
  - Validates product data structure

- ✅ **Data Processing**
  - Extracts unique attributes correctly
  - Handles empty product arrays
  - Processes null/undefined values
  - Removes duplicates and sorts results

- ✅ **File Operations**
  - Saves products to JSON file
  - Saves attributes to JSON file
  - Creates proper file structure with metadata

- ✅ **Error Handling**
  - Network timeouts
  - Invalid API responses
  - File system errors

### ProductSyncScheduler Tests

- ✅ **Scheduler Lifecycle**
  - Start/stop functionality
  - Multiple start/stop calls
  - Status monitoring

- ✅ **Manual Execution**
  - Run sync immediately
  - Prevent concurrent executions
  - Handle execution errors

- ✅ **Custom Scheduling**
  - Custom cron expressions
  - Schedule replacement
  - Timezone handling

- ✅ **Status Management**
  - Real-time status updates
  - Next run time calculation
  - Running state tracking

### API Endpoint Tests

- ✅ **Status Endpoint**
  - Returns current scheduler status
  - Handles different status states
  - Provides next run information

- ✅ **Run Endpoint**
  - Triggers manual sync
  - Handles sync errors
  - Returns appropriate responses

- ✅ **Start/Stop Endpoints**
  - Controls scheduler state
  - Handles multiple requests
  - Provides feedback

- ✅ **Error Handling**
  - Invalid HTTP methods
  - Malformed requests
  - Missing routes
  - Service errors

## Test Data

### Mock Data

Tests use realistic mock data that matches the Paramount API response format:

```typescript
const mockProducts: ParamountProduct[] = [
  {
    id: '1',
    sku: 'SKU1',
    name: 'Product 1',
    brand: 'Brand A',
    country: 'Australia',
    region: 'Victoria',
    category_level_1: 'Wine',
    category_level_2: 'Red Wine',
    // ... other fields
  }
];
```

### Test Files

Tests create temporary files in a `test-data` directory:
- `test-data/products.json` - Mock products file
- `test-data/attributes.json` - Mock attributes file

These files are automatically cleaned up after each test.

## Configuration

### Jest Configuration

The e2e tests use a separate Jest configuration (`jest.e2e.config.js`):

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.e2e.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  testTimeout: 30000,
  // ... other options
};
```

### Test Setup

Global setup includes:
- Environment variable configuration
- Logger suppression (unless DEBUG is set)
- Test timeout configuration
- Cleanup procedures

## Best Practices

### Test Organization

- Each test file focuses on a specific component
- Tests are grouped by functionality
- Clear test descriptions and expectations
- Proper setup and teardown

### Mocking Strategy

- Mock external dependencies (API calls, file system)
- Use realistic test data
- Test both success and error scenarios
- Verify mock interactions

### Error Testing

- Test various error conditions
- Verify error handling and recovery
- Check error messages and status codes
- Test edge cases and boundary conditions

## Debugging

### Running Specific Tests

```bash
# Run tests matching a pattern
npm run test:e2e -- --testNamePattern="should fetch products"

# Run tests in a specific file
npm run test:e2e -- product-sync.e2e.test.ts

# Run tests with debug output
DEBUG=1 npm run test:e2e
```

### Common Issues

1. **Timeout Errors**
   - Increase test timeout in configuration
   - Check for hanging promises
   - Verify mock implementations

2. **API Errors**
   - Ensure API URL is correct
   - Check network connectivity
   - Verify API response format

3. **File System Errors**
   - Check file permissions
   - Ensure test directory exists
   - Verify cleanup procedures

## Continuous Integration

The tests are designed to run in CI environments:

```bash
# CI command with coverage
npm run test:e2e:ci
```

This command:
- Runs tests without watch mode
- Generates coverage reports
- Exits with proper status codes
- Handles test failures gracefully

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Use descriptive test names
3. Include both positive and negative test cases
4. Add proper cleanup in afterEach/afterAll
5. Update this documentation if needed

## Dependencies

- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `supertest` - HTTP assertion library
- `@types/supertest` - TypeScript definitions


