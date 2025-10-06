# Paramount Launchpad - Development Rules

## 🎯 Project Rules and Guidelines

### 1. **Architecture Rules**

#### Clean Architecture Enforcement
- **Domain Layer**: Must not import from any other layer
- **Application Layer**: Can only import from Domain layer
- **Infrastructure Layer**: Can import from Application and Domain layers
- **Presentation Layer**: Can import from Domain and Data layers

#### SOLID Principles
- **Single Responsibility**: Each class/function has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Clients should not depend on interfaces they don't use
- **Dependency Inversion**: Depend on abstractions, not concretions

### 2. **Code Quality Rules**

#### TypeScript Rules
- **Strict Mode**: Always use TypeScript strict mode
- **No Any Types**: Avoid `any` type, use proper typing
- **Explicit Return Types**: Public methods must have explicit return types
- **Interface Prefix**: Use `I` prefix for interfaces (e.g., `ICustomerRepository`)

#### Error Handling
- **Custom Errors**: Use `CustomError` class for business logic errors
- **Proper HTTP Status**: Return appropriate HTTP status codes
- **Error Logging**: Log all errors with context
- **User-Friendly Messages**: Don't expose internal errors to users

#### Validation
- **Input Validation**: Validate all inputs using Joi schemas
- **Type Safety**: Use TypeScript for compile-time type checking
- **Runtime Validation**: Validate data at API boundaries

### 3. **Database Rules**

#### MongoDB Best Practices
- **Indexes**: Create indexes for frequently queried fields
- **Connection Pooling**: Use connection pooling for performance
- **Transactions**: Use transactions for multi-document operations
- **Data Validation**: Validate data at the database level

#### Repository Pattern
- **Interface First**: Define repository interfaces in domain layer
- **Implementation**: Implement repositories in infrastructure layer
- **Dependency Injection**: Inject repositories into services
- **Error Handling**: Handle database errors appropriately

### 4. **API Design Rules**

#### RESTful API
- **Resource-Based URLs**: Use nouns for resources, verbs for actions
- **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- **Status Codes**: Return proper HTTP status codes
- **Response Format**: Use consistent response format

#### API Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { /* actual data */ },
  "pagination": { /* if applicable */ }
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### 5. **Frontend Rules**

#### React Best Practices
- **Functional Components**: Use functional components with hooks
- **Props Interface**: Define proper TypeScript interfaces for props
- **Error Boundaries**: Implement error boundaries for error handling
- **Performance**: Use React.memo for expensive components

#### State Management
- **Local State**: Use useState for component-local state
- **Global State**: Use context or state management library for global state
- **Server State**: Use React Query for server state management
- **Form State**: Use React Hook Form for form management

#### Component Structure
```typescript
// Component file structure
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Hooks
  // Event handlers
  // Render
  return (
    // JSX
  );
};
```

### 6. **Testing Rules**

#### Unit Testing
- **Test Coverage**: Maintain minimum 80% test coverage
- **Test Structure**: Use Arrange-Act-Assert pattern
- **Mocking**: Mock external dependencies
- **Test Names**: Use descriptive test names

#### Integration Testing
- **API Testing**: Test API endpoints with real data
- **Database Testing**: Test database operations
- **Error Scenarios**: Test error handling paths
- **Performance**: Test performance-critical paths

### 7. **Security Rules**

#### Authentication & Authorization
- **JWT Tokens**: Use JWT for authentication
- **Token Expiration**: Implement token expiration
- **Role-Based Access**: Implement role-based access control
- **Input Sanitization**: Sanitize all user inputs

#### Data Protection
- **Environment Variables**: Store secrets in environment variables
- **HTTPS**: Use HTTPS for all communications
- **CORS**: Configure CORS properly
- **Rate Limiting**: Implement rate limiting for API endpoints

### 8. **Performance Rules**

#### Backend Performance
- **Database Queries**: Optimize database queries
- **Caching**: Implement caching for frequently accessed data
- **Pagination**: Use pagination for large datasets
- **Connection Pooling**: Use connection pooling

#### Frontend Performance
- **Bundle Size**: Keep bundle size minimal
- **Lazy Loading**: Implement lazy loading for components
- **Image Optimization**: Optimize images
- **Code Splitting**: Use code splitting for large applications

### 9. **Documentation Rules**

#### Code Documentation
- **JSDoc**: Use JSDoc for public APIs
- **README**: Maintain comprehensive README files
- **API Documentation**: Document all API endpoints
- **Architecture**: Document architecture decisions

#### Commit Messages
- **Conventional Commits**: Use conventional commit format
- **Descriptive**: Write descriptive commit messages
- **Scope**: Include scope when applicable
- **Breaking Changes**: Mark breaking changes

### 10. **Deployment Rules**

#### Environment Management
- **Environment Variables**: Use environment variables for configuration
- **Secrets Management**: Never commit secrets to version control
- **Environment Separation**: Separate development, staging, and production
- **Configuration**: Use configuration files for non-sensitive data

#### Build Process
- **Type Checking**: Run TypeScript type checking
- **Linting**: Run ESLint before building
- **Testing**: Run tests before deployment
- **Build Optimization**: Optimize build for production

### 11. **Git Workflow Rules**

#### Branch Naming
- **Feature Branches**: `feature/feature-name`
- **Bug Fixes**: `bugfix/bug-description`
- **Hotfixes**: `hotfix/issue-description`
- **Releases**: `release/version-number`

#### Commit Rules
- **Atomic Commits**: Make atomic commits
- **Commit Messages**: Use conventional commit format
- **Code Review**: All code must be reviewed
- **CI/CD**: All code must pass CI/CD pipeline

### 12. **Monitoring and Logging Rules**

#### Logging
- **Structured Logging**: Use structured logging format
- **Log Levels**: Use appropriate log levels
- **Context**: Include context in log messages
- **Sensitive Data**: Don't log sensitive data

#### Monitoring
- **Health Checks**: Implement health check endpoints
- **Metrics**: Collect relevant metrics
- **Alerts**: Set up alerts for critical issues
- **Performance**: Monitor performance metrics

### 13. **Code Review Rules**

#### Review Checklist
- [ ] Code follows architecture principles
- [ ] Implements SOLID principles
- [ ] Has proper TypeScript typing
- [ ] Includes unit tests
- [ ] Has proper error handling
- [ ] Follows naming conventions
- [ ] Includes documentation
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Accessibility compliance

#### Review Process
- **Two Reviewers**: Require at least two reviewers
- **Automated Checks**: Run automated checks first
- [ ] **Manual Review**: Perform manual code review
- [ ] **Testing**: Verify tests pass
- [ ] **Documentation**: Check documentation updates

### 14. **Emergency Procedures**

#### Hotfix Process
- **Critical Issues**: Only for critical production issues
- **Fast Track**: Expedited review process
- **Documentation**: Document the issue and fix
- **Post-Mortem**: Conduct post-mortem for learning

#### Rollback Procedures
- **Automated Rollback**: Implement automated rollback
- **Manual Rollback**: Document manual rollback procedures
- **Data Recovery**: Plan for data recovery scenarios
- **Communication**: Communicate rollback to stakeholders

---

## 🚨 **Critical Rules - Never Break These**

1. **Never commit secrets or API keys**
2. **Never bypass TypeScript type checking**
3. **Never skip code reviews**
4. **Never deploy without tests**
5. **Never ignore security vulnerabilities**
6. **Never break the clean architecture**
7. **Never use `any` type in production code**
8. **Never commit directly to main branch**
9. **Never ignore linting errors**
10. **Never skip error handling**

---

**Remember: These rules exist to ensure code quality, maintainability, and team productivity. When in doubt, ask for clarification!** 🚀
