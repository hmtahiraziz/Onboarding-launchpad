# Paramount Launchpad Backend 🚀

AI-powered liquor wholesale onboarding system built with Node.js, TypeScript, and Express following SOLID principles and clean architecture. This backend serves as the core API for the Paramount Launchpad system, handling customer management, product catalog operations, and AI-powered onboarding flows.

## 🏗️ Architecture

This backend follows clean architecture principles with clear separation of concerns:

- **Domain Layer**: Core business entities, repositories (interfaces), and services
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: Database implementations, API routes, and external services

### SOLID Principles Implementation

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes are substitutable for base classes
- **Interface Segregation**: Clients depend only on interfaces they use
- **Dependency Inversion**: Depend on abstractions, not concretions

## ✨ Features

- **Customer Management**: Tier-based customer system (Bronze, Silver, Gold, Platinum)
- **AI-Powered Onboarding**: Multi-step questionnaire with progress tracking
- **Product Catalog**: 19,000+ product database with supplier management
- **Smart Recommendations**: Curated product sets based on customer preferences
- **Product Sync System**: Automated synchronization with Paramount Liquor API
- **RESTful API**: Comprehensive error handling and validation
- **Database Management**: PostgreSQL with TypeORM for data persistence

## 🛠️ Tech Stack

- **Runtime**: Node.js 21.7.0+ with TypeScript
- **Framework**: Express.js with clean architecture
- **Database**: PostgreSQL with TypeORM
- **Validation**: Joi for input validation
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, JWT authentication
- **Testing**: Jest with comprehensive test suites
- **Product Sync**: Automated cron jobs with error handling

## 🚀 Getting Started

### Prerequisites

- **Node.js 21.7.0+** (required for optimal performance)
- **PostgreSQL 15+** (for customer and onboarding data)
- **npm or yarn** (package manager)
- **Docker & Docker Compose** (recommended for easy setup)

### 📦 Installation

#### Option 1: Docker Setup (Recommended)

1. **Start PostgreSQL with Docker:**
```bash
# From project root
docker compose up -d postgres

# Wait for database to be ready (about 10-15 seconds)
```

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Configure environment:**
```bash
cp env.example .env
# Edit .env with your PostgreSQL credentials (defaults work with Docker)
```

4. **Run database migrations:**
```bash
npm run migrate
```

5. **Test database connection:**
```bash
npm run test:migration
```

6. **Start development server:**
```bash
npm run dev
```

#### Option 2: Local PostgreSQL Setup

1. **Install PostgreSQL 15+ locally**
2. **Create database:**
```sql
CREATE DATABASE paramount_launchpad;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE paramount_launchpad TO postgres;
```

3. **Follow steps 2-6 from Docker setup above**

### 🔧 Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=paramount_launchpad

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Service Integration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-api-key

# Logging
LOG_LEVEL=info
LOG_FILE=logs/combined.log
ERROR_LOG_FILE=logs/error.log

# Product Sync Configuration
PRODUCT_SYNC_ENABLED=true
PRODUCT_SYNC_CRON_SCHEDULE=0 2 * * *
PRODUCT_API_URL=https://api.paramountliquor.com
PRODUCT_API_KEY=your-api-key
```

### 🗄️ Database Management

#### Run Migrations
```bash
# Run all pending migrations
npm run migrate

# Test database connection
npm run test:migration
```

#### Database Schema
The backend uses TypeORM with the following main entities:
- **Customer**: Business information and tier classification
- **OnboardingSession**: Multi-step questionnaire progress
- **Questionnaire**: Dynamic question sets
- **QuestionnaireResponse**: User answers and progress tracking

## 📚 API Documentation

### 🏥 Health & System

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

#### Product Sync Status
```http
GET /api/sync/status
POST /api/sync/run
POST /api/sync/start
POST /api/sync/stop
```

### 👥 Customer Management

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "businessName": "The Golden Spoon",
  "email": "contact@goldenspoon.com",
  "phone": "+61 2 1234 5678",
  "venueType": "restaurant",
  "cuisineStyle": "fine dining",
  "location": {
    "address": "123 Collins Street",
    "city": "Melbourne",
    "state": "VIC",
    "postcode": "3000",
    "country": "Australia"
  },
  "tier": "bronze"
}
```

#### Get Customer
```http
GET /api/customers/:id
GET /api/customers/email/:email
```

#### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "tier": "silver",
  "venueType": "bar"
}
```

#### List Customers by Tier
```http
GET /api/customers/tier/:tier
# tier: bronze, silver, gold, platinum
```

### 📦 Product Catalog API

#### Search Products
```http
GET /api/products?search=wine&category=wine&supplier=platinum&limit=20&offset=0
```

**Query Parameters:**
- `search` (string): Search term for product name
- `category` (string): Filter by category (wine, spirits, beer, etc.)
- `supplier` (string): Filter by supplier tier (bronze, silver, gold, platinum)
- `location` (string): Filter by availability in city
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `limit` (number): Number of results (default: 20, max: 100)
- `offset` (number): Pagination offset (default: 0)

**Response:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Penfolds Grange 2018",
      "category": "Wine",
      "subcategory": "Red Wine",
      "supplier": "Treasury Wine Estates",
      "supplierTier": "platinum",
      "price": 850.00,
      "currency": "AUD",
      "availability": {
        "sydney": true,
        "melbourne": true,
        "brisbane": false
      },
      "description": "Premium Australian Shiraz",
      "imageUrl": "https://example.com/grange.jpg",
      "attributes": {
        "alcoholContent": "14.5%",
        "vintage": "2018",
        "region": "Barossa Valley"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Get Products by Category
```http
GET /api/products/category/:category
# category: wine, spirits, beer, champagne, etc.
```

#### Get Recommended Products
```http
GET /api/products/recommended/:customerId?maxProducts=50
```

**Response:**
```json
{
  "recommendations": [
    {
      "productId": "prod_123",
      "score": 0.95,
      "reasoning": "High-tier supplier, matches venue type",
      "category": "Wine"
    }
  ],
  "customerProfile": {
    "tier": "gold",
    "venueType": "restaurant",
    "cuisineStyle": "fine dining"
  },
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Trending Products
```http
GET /api/products/trending?period=7d&limit=20
```

**Query Parameters:**
- `period` (string): Time period (1d, 7d, 30d, 90d)
- `limit` (number): Number of results (default: 20)

### 🎯 Onboarding Flow API

#### Start Onboarding Session
```http
POST /api/onboarding/start
Content-Type: application/json

{
  "customerId": "cust_123",
  "venueType": "restaurant"
}
```

**Response:**
```json
{
  "sessionId": "session_456",
  "customerId": "cust_123",
  "currentStep": 1,
  "totalSteps": 6,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "What type of establishment do you run?",
      "options": [
        "Fine dining restaurant",
        "Casual restaurant",
        "Bar",
        "Hotel",
        "Cafe"
      ],
      "required": true
    }
  ],
  "progress": 0.17
}
```

#### Submit Onboarding Response
```http
POST /api/onboarding/response
Content-Type: application/json

{
  "sessionId": "session_456",
  "questionId": "q1",
  "answer": "Fine dining restaurant",
  "step": 1
}
```

#### Get Onboarding Progress
```http
GET /api/onboarding/session/:sessionId/progress
```

#### Complete Onboarding
```http
POST /api/onboarding/session/:sessionId/complete
```

**Response:**
```json
{
  "sessionId": "session_456",
  "status": "completed",
  "completionDate": "2024-01-15T10:30:00Z",
  "recommendedProducts": 95,
  "nextSteps": [
    "Review your curated product selection",
    "Place your first order",
    "Contact your account manager"
  ]
}
```

### 📊 Analytics & Reporting

#### Customer Analytics
```http
GET /api/analytics/customers?period=30d
GET /api/analytics/onboarding?period=7d
GET /api/analytics/products/trending?category=wine
```

### 🔧 Admin Endpoints

#### System Status
```http
GET /api/admin/status
GET /api/admin/logs
GET /api/admin/metrics
```

#### Product Management
```http
POST /api/admin/products/sync
GET /api/admin/products/stats
PUT /api/admin/products/:id/visibility
```

## Project Structure

```
src/
├── domain/                 # Domain layer
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Service interfaces
├── application/           # Application layer
│   └── use-cases/        # Business use cases
├── infrastructure/        # Infrastructure layer
│   ├── database/         # Database models and connections
│   ├── repositories/     # Repository implementations
│   └── routes/           # API routes
└── shared/               # Shared utilities
    ├── middleware/       # Express middleware
    └── utils/           # Utility functions
```

## 🛠️ Development

### Available Scripts

#### Development
```bash
npm run dev                 # Start development server with hot reload
npm run build              # Build for production
npm start                  # Start production server
npm run type-check         # TypeScript type checking
npm run type-check:watch   # TypeScript type checking in watch mode
```

#### Database Management
```bash
npm run migrate            # Run database migrations
npm run test:migration     # Test database connection
npm run sync:products      # Manual product sync from API
```

#### Testing
```bash
npm run test               # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only
npm run test:performance   # Performance tests
npm run test:all           # Run all test suites
npm run test:coverage      # Test coverage report
npm run test:watch         # Run tests in watch mode
npm run test:ci            # CI-optimized test run
```

#### Code Quality
```bash
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run test:clean         # Clean test artifacts
npm run test:report        # Generate and open coverage report
```

### 🧪 Testing Strategy

The backend includes comprehensive testing across multiple layers:

#### Unit Tests (`tests/unit/`)
- Business logic and use cases
- Domain entities and services
- Repository implementations
- Utility functions

#### Integration Tests (`tests/integration/`)
- API endpoint testing
- Database integration
- External service integration
- AI curation service integration

#### End-to-End Tests (`tests/e2e/`)
- Complete user flows
- Product sync workflows
- Onboarding processes
- Cross-service communication

#### Performance Tests (`tests/performance/`)
- Load testing for API endpoints
- Database query performance
- Product sync performance
- Memory usage optimization

### 📝 Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any` types
- **ESLint**: Follow configured rules for consistency
- **Naming**: Use descriptive variable and function names
- **Documentation**: Add JSDoc comments for public APIs
- **Testing**: Write tests for all business logic
- **Architecture**: Follow clean architecture principles
- **Error Handling**: Use custom error classes with proper HTTP status codes

### 🔄 Product Sync System

The backend includes an automated product synchronization system:

#### Automatic Sync
- **Daily at 2:00 AM** (Australia/Sydney timezone)
- Fetches products from Paramount Liquor API
- Saves to `data/products.json` and `data/attributes.json`
- Runs automatically when backend starts

#### Manual Sync Control
```bash
# Check sync status
curl http://localhost:3000/api/sync/status

# Run sync now
curl -X POST http://localhost:3000/api/sync/run

# Start/stop scheduler
curl -X POST http://localhost:3000/api/sync/start
curl -X POST http://localhost:3000/api/sync/stop
```

#### Sync Configuration
```bash
# Environment variables for sync
PRODUCT_SYNC_ENABLED=true
PRODUCT_SYNC_CRON_SCHEDULE=0 2 * * *
PRODUCT_API_URL=https://api.paramountliquor.com
PRODUCT_API_KEY=your-api-key
```

## 🚀 Deployment

### Production Build

1. **Build the application:**
```bash
npm run build
```

2. **Set production environment variables:**
```bash
# Update .env with production values
NODE_ENV=production
POSTGRES_HOST=your-production-db-host
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-production-jwt-secret
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start the application:**
```bash
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t paramount-launchpad-backend .

# Run with environment variables
docker run -p 3000:3000 \
  -e POSTGRES_HOST=your-db-host \
  -e POSTGRES_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  paramount-launchpad-backend
```

### Environment-Specific Configuration

#### Development
- Hot reload enabled
- Detailed logging
- Test database
- CORS enabled for localhost

#### Production
- Optimized build
- Error logging only
- Production database
- Security headers enabled
- Rate limiting enabled

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test database connection
npm run test:migration

# Check connection string
echo $POSTGRES_HOST
echo $POSTGRES_PORT
```

#### Migration Errors
```bash
# Check migration status
npm run migrate

# Reset database (development only)
docker compose down -v
docker compose up -d postgres
npm run migrate
```

#### Product Sync Issues
```bash
# Check sync status
curl http://localhost:3000/api/sync/status

# Run manual sync
npm run sync:products

# Check logs
tail -f logs/combined.log
```

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Check memory usage
npm run test:performance
```

### Health Checks

- **Backend Health**: `GET http://localhost:3000/health`
- **Database Status**: Check logs for connection messages
- **Sync Status**: `GET http://localhost:3000/api/sync/status`
- **API Documentation**: `GET http://localhost:3000/api/docs`

### Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

```bash
# View real-time logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# Search logs
grep "ERROR" logs/combined.log
```

## 🤝 Contributing

### Development Workflow

1. **Follow the established architecture patterns**
2. **Write comprehensive tests for new features**
3. **Update documentation as needed**
4. **Follow the existing code style**
5. **Use conventional commit messages**

### Code Review Checklist

- [ ] Code follows clean architecture principles
- [ ] TypeScript types are properly defined
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance considerations addressed

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 📄 License

MIT License - see LICENSE file for details

---

**Paramount Launchpad Backend** - Built with ❤️ for the future of liquor wholesale onboarding.
