# Paramount Launchpad - Code Style Guide

## 🎯 Overview
This guide ensures consistent, maintainable, and high-quality code across the Paramount Launchpad project.

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── domain/                 # Business entities and interfaces
│   │   ├── entities/          # Domain models
│   │   ├── repositories/      # Repository interfaces
│   │   └── services/          # Service interfaces
│   ├── application/           # Business logic
│   │   └── use-cases/        # Use case implementations
│   ├── infrastructure/        # External concerns
│   │   ├── database/         # Database models and connections
│   │   ├── repositories/     # Repository implementations
│   │   └── routes/           # API routes
│   └── shared/               # Shared utilities
│       ├── middleware/       # Express middleware
│       └── utils/           # Utility functions
```

### Frontend Structure
```
frontend/
├── src/
│   ├── domain/               # Business entities and interfaces
│   │   ├── entities/        # Domain models
│   │   └── repositories/    # Repository interfaces
│   ├── data/                # Data access layer
│   │   ├── api/            # API client
│   │   └── repositories/   # Repository implementations
│   ├── presentation/        # UI layer
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Basic UI components
│   │   │   ├── customer/  # Customer-related components
│   │   │   ├── onboarding/ # Onboarding components
│   │   │   └── product/   # Product-related components
│   │   └── pages/         # Page components
│   └── shared/            # Shared utilities
```

## 🏗️ Architecture Rules

### Clean Architecture Principles

#### 1. **Dependency Rule**
- Dependencies must point inward
- Domain layer has no dependencies
- Application layer depends only on domain
- Infrastructure layer depends on application and domain

#### 2. **Layer Responsibilities**

**Domain Layer:**
- Contains business entities
- Defines repository interfaces
- Contains business rules
- No external dependencies

**Application Layer:**
- Implements use cases
- Orchestrates domain objects
- Depends only on domain layer

**Infrastructure Layer:**
- Implements repository interfaces
- Handles external concerns (database, API)
- Depends on application and domain layers

### SOLID Principles

#### 1. **Single Responsibility Principle (SRP)**
```typescript
// ✅ Good: Single responsibility
class CustomerRepository {
  async findById(id: string): Promise<Customer> { }
  async save(customer: Customer): Promise<Customer> { }
}

// ❌ Bad: Multiple responsibilities
class CustomerService {
  async findById(id: string): Promise<Customer> { }
  async sendEmail(customer: Customer): Promise<void> { }
  async generateReport(): Promise<Report> { }
}
```

#### 2. **Open/Closed Principle (OCP)**
```typescript
// ✅ Good: Open for extension, closed for modification
interface PaymentProcessor {
  processPayment(amount: number): Promise<PaymentResult>;
}

class CreditCardProcessor implements PaymentProcessor {
  async processPayment(amount: number): Promise<PaymentResult> { }
}

class PayPalProcessor implements PaymentProcessor {
  async processPayment(amount: number): Promise<PaymentResult> { }
}
```

#### 3. **Liskov Substitution Principle (LSP)**
```typescript
// ✅ Good: Derived classes are substitutable
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}

class CustomerRepository implements Repository<Customer> {
  async findById(id: string): Promise<Customer | null> { }
  async save(customer: Customer): Promise<Customer> { }
}
```

#### 4. **Interface Segregation Principle (ISP)**
```typescript
// ✅ Good: Focused interfaces
interface ReadableRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface WritableRepository<T> {
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// ❌ Bad: Fat interface
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
  sendEmail(entity: T): Promise<void>;
  generateReport(): Promise<Report>;
}
```

#### 5. **Dependency Inversion Principle (DIP)**
```typescript
// ✅ Good: Depend on abstractions
class CustomerService {
  constructor(private customerRepository: ICustomerRepository) {}
  
  async getCustomer(id: string): Promise<Customer> {
    return await this.customerRepository.findById(id);
  }
}

// ❌ Bad: Depend on concretions
class CustomerService {
  constructor() {
    this.customerRepository = new CustomerRepository();
  }
}
```

## 📝 Naming Conventions

### Files and Directories
- **Files**: `camelCase.ts` or `PascalCase.tsx`
- **Directories**: `kebab-case` or `camelCase`
- **Components**: `PascalCase.tsx`
- **Hooks**: `useCamelCase.ts`
- **Utilities**: `camelCase.ts`

### Variables and Functions
```typescript
// ✅ Good
const customerId = '123';
const isOnboardingComplete = true;
const getCustomerById = async (id: string) => { };

// ❌ Bad
const customer_id = '123';
const IsOnboardingComplete = true;
const GetCustomerById = async (id: string) => { };
```

### Classes and Interfaces
```typescript
// ✅ Good
interface ICustomerRepository { }
class CustomerService { }
enum CustomerTier { }

// ❌ Bad
interface customerRepository { }
class customerService { }
enum customerTier { }
```

### Constants
```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxRetryAttempts = 3;
const apiBaseUrl = 'https://api.example.com';
```

## 🎨 Code Style

### TypeScript
```typescript
// ✅ Good: Explicit types
interface CreateCustomerRequest {
  email: string;
  name: string;
  venueType: VenueType;
}

const createCustomer = async (request: CreateCustomerRequest): Promise<Customer> => {
  // Implementation
};

// ❌ Bad: Any types
const createCustomer = async (request: any): Promise<any> => {
  // Implementation
};
```

### React Components
```typescript
// ✅ Good: Functional components with proper typing
interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete
}) => {
  return (
    <div className="customer-card">
      <h3>{customer.name}</h3>
      <button onClick={() => onEdit(customer)}>Edit</button>
      <button onClick={() => onDelete(customer.id)}>Delete</button>
    </div>
  );
};

// ❌ Bad: Any props, no typing
export const CustomerCard = ({ customer, onEdit, onDelete }: any) => {
  return <div>{customer.name}</div>;
};
```

### Error Handling
```typescript
// ✅ Good: Proper error handling
try {
  const customer = await customerService.getCustomer(id);
  return customer;
} catch (error) {
  if (error instanceof CustomError) {
    throw error;
  }
  throw new CustomError('Failed to get customer', 500);
}

// ❌ Bad: Generic error handling
try {
  const customer = await customerService.getCustomer(id);
  return customer;
} catch (error) {
  throw error;
}
```

## 🧪 Testing Standards

### Unit Tests
```typescript
// ✅ Good: Descriptive test names
describe('CustomerService', () => {
  describe('getCustomer', () => {
    it('should return customer when valid ID is provided', async () => {
      // Test implementation
    });
    
    it('should throw error when customer is not found', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests
```typescript
// ✅ Good: Test real scenarios
describe('Customer API', () => {
  it('should create customer and return 201 status', async () => {
    const customerData = {
      email: 'test@example.com',
      name: 'Test Customer',
      venueType: VenueType.RESTAURANT
    };
    
    const response = await request(app)
      .post('/api/customers')
      .send(customerData)
      .expect(201);
      
    expect(response.body.data.email).toBe(customerData.email);
  });
});
```

## 📚 Documentation

### JSDoc Comments
```typescript
/**
 * Creates a new customer with the provided information
 * @param request - Customer creation request data
 * @returns Promise resolving to the created customer
 * @throws {CustomError} When email already exists
 * @example
 * ```typescript
 * const customer = await createCustomer({
 *   email: 'test@example.com',
 *   name: 'Test Customer',
 *   venueType: VenueType.RESTAURANT
 * });
 * ```
 */
async function createCustomer(request: CreateCustomerRequest): Promise<Customer> {
  // Implementation
}
```

### README Files
- Each major component should have a README
- Include usage examples
- Document API endpoints
- Explain configuration options

## 🔧 Tools and Configuration

### ESLint Rules
- Enforce TypeScript strict mode
- Require explicit return types for public methods
- Disallow `any` types
- Enforce consistent naming conventions

### Prettier Configuration
- 2-space indentation
- Single quotes
- No trailing commas
- 100 character line length

### Git Hooks
- Pre-commit: Run linting and formatting
- Pre-push: Run tests
- Commit message: Follow conventional commits

## 🚀 Performance Guidelines

### Backend
- Use database indexes for frequently queried fields
- Implement proper pagination
- Cache frequently accessed data
- Use connection pooling

### Frontend
- Lazy load components
- Implement proper error boundaries
- Use React.memo for expensive components
- Optimize bundle size

## 🔒 Security Guidelines

### Backend
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Sanitize user data

### Frontend
- Sanitize user inputs
- Use HTTPS for all API calls
- Implement proper error handling
- Don't expose sensitive data in client code

## 📋 Code Review Checklist

- [ ] Follows clean architecture principles
- [ ] Implements SOLID principles
- [ ] Has proper TypeScript typing
- [ ] Includes unit tests
- [ ] Has proper error handling
- [ ] Follows naming conventions
- [ ] Includes documentation
- [ ] No console.log statements
- [ ] No TODO comments in production code
- [ ] Properly handles async operations

---

**Remember: Code is read more often than it's written. Write for humans, not just machines!** 🚀
