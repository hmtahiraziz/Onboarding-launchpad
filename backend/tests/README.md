# Test Suite Documentation

This directory contains comprehensive tests for the Paramount Launchpad Backend API, optimized for Node.js 21.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup and utilities
├── unit/                       # Unit tests for individual components
│   └── entities/
│       ├── Customer.test.ts
│       └── Product.test.ts
├── integration/                # Integration tests for API endpoints
│   └── api/
│       └── customerRoutes.test.ts
├── e2e/                       # End-to-end tests
│   ├── product-sync-scheduler.e2e.test.ts
│   ├── product-sync.e2e.test.ts
│   └── sync-api.e2e.test.ts
├── performance/               # Performance and load tests
│   └── productSync.performance.test.ts
└── README.md                  # This file
```

## Test Types

### Unit Tests
- **Purpose**: Test individual components in isolation
- **Location**: `tests/unit/`
- **Focus**: Entity validation, business logic, method behavior
- **Dependencies**: Mocked external dependencies

### Integration Tests
- **Purpose**: Test API endpoints and their interactions
- **Location**: `tests/integration/`
- **Focus**: Request/response handling, validation, error handling
- **Dependencies**: Express app with mocked services

### End-to-End Tests
- **Purpose**: Test complete workflows and system behavior
- **Location**: `tests/e2e/`
- **Focus**: Full application flow, scheduler operations
- **Dependencies**: Mocked external services

### Performance Tests
- **Purpose**: Test system performance under various loads
- **Location**: `tests/performance/`
- **Focus**: Response times, memory usage, concurrent operations
- **Dependencies**: Mocked services with performance monitoring

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
npm run test:watch:unit
npm run test:watch:integration
npm run test:watch:e2e

# Run tests for CI/CD
npm run test:ci
```

### Advanced Commands
```bash
# Debug tests
npm run test:debug

# Run with verbose output
npm run test:verbose

# Run silently
npm run test:silent

# Clean coverage reports
npm run test:clean

# Generate and open coverage report
npm run test:report
```

## Test Configuration

### Jest Configuration
- **Main Config**: `jest.config.js`
- **E2E Config**: `jest.e2e.config.js`
- **TypeScript**: Configured for ES2022 target
- **Coverage**: HTML, LCOV, and JSON reports
- **Timeout**: 30 seconds for all tests
- **Workers**: 50% of available CPU cores

### Environment Variables
Tests use the following environment variables:
```bash
NODE_ENV=test
PARAMOUNT_API_BASE_URL=https://www.paramountliquor.com.au/rest/V1
MONGODB_URI=mongodb://localhost:27017/paramount_test
JWT_SECRET=test-jwt-secret-key
PORT=3001
```

## Test Utilities

### Global Test Utils
Available in all tests via `global.testUtils`:

```typescript
// Mock data generators
testUtils.createMockCustomer(overrides?)
testUtils.createMockProduct(overrides?)
testUtils.createMockOnboardingSession(overrides?)

// Utility functions
testUtils.wait(ms)
testUtils.mockApiResponse(data, status?)
testUtils.getTestDbUri()
```

### Custom Jest Matchers
```typescript
// MongoDB ObjectId validation
expect(id).toBeValidObjectId()

// Email validation
expect(email).toBeValidEmail()

// Date validation
expect(date).toBeValidDate()
```

## Test Patterns

### Entity Testing
```typescript
describe('Entity Name', () => {
  describe('Constructor', () => {
    it('should create entity with valid data', () => {
      // Test valid creation
    });
    
    it('should generate timestamps when not provided', () => {
      // Test timestamp generation
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      // Test validation logic
    });
  });

  describe('Methods', () => {
    it('should perform expected operations', () => {
      // Test method behavior
    });
  });
});
```

### API Testing
```typescript
describe('API Endpoint', () => {
  it('should handle successful requests', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body).toEqual(expectedData);
  });

  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(invalidData)
      .expect(400);
    
    expect(response.body.success).toBe(false);
  });
});
```

### Performance Testing
```typescript
describe('Performance Tests', () => {
  it('should complete within acceptable time', async () => {
    const startTime = Date.now();
    
    await performOperation();
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });
});
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mocking
- Mock external dependencies
- Use `jest.clearAllMocks()` in `beforeEach`
- Mock at the appropriate level (unit vs integration)

### 3. Assertions
- Use specific matchers when possible
- Test both success and failure cases
- Verify side effects and state changes

### 4. Performance
- Set appropriate timeouts
- Monitor memory usage in performance tests
- Test with realistic data sizes

### 5. Error Handling
- Test error scenarios
- Verify error messages and status codes
- Test recovery from failures

## Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical paths covered
- **Performance Tests**: All major operations tested

## Debugging Tests

### Common Issues
1. **Timeout Errors**: Increase test timeout or optimize slow operations
2. **Memory Leaks**: Check for proper cleanup in `afterEach`/`afterAll`
3. **Mock Issues**: Verify mock setup and cleanup
4. **Async Issues**: Ensure proper `await` usage

### Debug Commands
```bash
# Run specific test file
npm test -- tests/unit/entities/Customer.test.ts

# Run with debug output
npm run test:debug

# Run single test
npm test -- --testNamePattern="should create customer"
```

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
    npm run lint
```

### Pre-commit Hooks
```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Add to package.json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.{ts,js}": ["eslint --fix", "jest --bail --findRelatedTests"]
}
```

## Troubleshooting

### Node.js 21 Compatibility
- All tests are optimized for Node.js 21
- Uses ES2022 target for TypeScript
- Leverages modern JavaScript features

### Common Fixes
1. **Import Issues**: Check path aliases in Jest config
2. **Type Issues**: Ensure proper TypeScript configuration
3. **Mock Issues**: Verify mock implementations match interfaces
4. **Timeout Issues**: Adjust timeouts based on operation complexity

## Contributing

When adding new tests:
1. Follow existing patterns and conventions
2. Add appropriate test coverage
3. Update this documentation if needed
4. Ensure tests pass in CI environment
5. Consider performance implications

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js 21 Features](https://nodejs.org/en/blog/release/v21.0.0)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
