# PostgreSQL Migration Guide

This document outlines the migration from MongoDB to PostgreSQL using TypeORM for the Customer and Onboarding entities.

## Overview

The migration replaces MongoDB with PostgreSQL while maintaining the same domain interfaces and business logic. Only Customer and Onboarding entities have been migrated - Product entities remain unchanged.

## Changes Made

### 1. Dependencies Added
- `typeorm`: ^0.3.26
- `pg`: ^8.16.3
- `reflect-metadata`: ^0.2.2
- `@types/pg`: ^8.10.9

### 2. Database Configuration
- **File**: `src/infrastructure/database/connection.ts`
- **Type**: PostgreSQL with TypeORM
- **Environment Variables**:
  - `POSTGRES_HOST` (default: localhost)
  - `POSTGRES_PORT` (default: 5432)
  - `POSTGRES_USER` (default: postgres)
  - `POSTGRES_PASSWORD` (default: password)
  - `POSTGRES_DB` (default: paramount_launchpad)

### 3. TypeORM Entities
- **Customer Entity**: `src/infrastructure/database/entities/Customer.ts`
  - Uses PostgreSQL enums for tier, venue type, and onboarding status
  - JSONB columns for location and preferences
  - Proper indexing for performance

- **OnboardingSession Entity**: `src/infrastructure/database/entities/OnboardingSession.ts`
  - Foreign key relationship with Customer
  - JSONB columns for responses and curated products
  - Proper indexing for queries

### 4. Database Migrations
- **001-CreateCustomersTable.ts**: Creates customers table with enums and indexes
- **002-CreateOnboardingSessionsTable.ts**: Creates onboarding_sessions table with foreign keys

### 5. Repository Updates
- **CustomerRepository**: Updated to use TypeORM Repository pattern
- **OnboardingRepository**: Updated to use TypeORM Repository pattern
- Maintains same interface as before (no breaking changes)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database
```bash
# Create database
createdb paramount_launchpad

# Or using psql
psql -U postgres -c "CREATE DATABASE paramount_launchpad;"
```

### 3. Configure Environment Variables
Copy `env.example` to `.env` and update PostgreSQL credentials:
```bash
cp env.example .env
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Test Migration
```bash
npm run test:migration
```

### 6. Start Development Server
```bash
npm run dev
```

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  tier customer_tier DEFAULT 'bronze',
  "venueType" venue_type NOT NULL,
  "cuisineStyle" VARCHAR,
  location JSONB NOT NULL,
  "onboardingStatus" onboarding_status DEFAULT 'not_started',
  preferences JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Onboarding Sessions Table
```sql
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "currentStep" onboarding_step DEFAULT 'welcome',
  responses JSONB DEFAULT '[]',
  "curatedProducts" JSONB DEFAULT '[]',
  status onboarding_session_status DEFAULT 'active',
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  "lastActivityAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Features

### 1. Type Safety
- Full TypeScript support with TypeORM
- Compile-time type checking for database operations
- IntelliSense support for entity properties

### 2. Performance
- Proper indexing on frequently queried columns
- JSONB for flexible JSON storage with indexing support
- Query optimization with TypeORM query builder

### 3. Data Integrity
- Foreign key constraints between Customer and OnboardingSession
- Enum types for data validation
- Cascade deletes for data consistency

### 4. Migration Support
- Version-controlled database schema changes
- Rollback capability for migrations
- Environment-specific migration handling

## API Compatibility

The migration maintains full API compatibility:
- All existing endpoints work unchanged
- Same request/response formats
- Same business logic and validation
- No breaking changes for frontend

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check connection credentials in `.env`
   - Verify database exists

2. **Migration Errors**
   - Check PostgreSQL user permissions
   - Ensure database is empty or migrations are compatible
   - Check migration file syntax

3. **Type Errors**
   - Run `npm run type-check` to identify issues
   - Ensure all imports are correct
   - Check entity property types

### Debug Commands

```bash
# Check TypeScript compilation
npm run type-check

# Run linting
npm run lint

# Test database connection
npm run test:migration

# View migration status
npm run migrate
```

## Rollback Plan

If rollback is needed:

1. **Stop the application**
2. **Restore MongoDB connection** (revert connection.ts)
3. **Restore MongoDB repositories** (revert repository files)
4. **Update package.json** (remove TypeORM dependencies)
5. **Restart with MongoDB**

## Performance Considerations

- **Indexing**: Proper indexes on frequently queried columns
- **Connection Pooling**: TypeORM handles connection pooling automatically
- **Query Optimization**: Use TypeORM query builder for complex queries
- **JSONB**: Efficient JSON storage and querying with PostgreSQL

## Security

- **SQL Injection**: TypeORM provides protection against SQL injection
- **Data Validation**: Entity validation at the database level
- **Access Control**: Database user permissions should be properly configured
- **Environment Variables**: Sensitive data stored in environment variables

## Monitoring

- **Query Logging**: Enabled in development mode
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: `/health` endpoint for monitoring
- **Database Metrics**: Monitor connection pool and query performance

## Next Steps

1. **Production Deployment**: Update production environment variables
2. **Monitoring Setup**: Configure database monitoring and alerts
3. **Backup Strategy**: Implement PostgreSQL backup procedures
4. **Performance Tuning**: Monitor and optimize query performance
5. **Documentation**: Update API documentation if needed

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test with `npm run test:migration`
4. Verify environment configuration
