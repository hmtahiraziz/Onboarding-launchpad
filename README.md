# Paramount Launchpad 🚀

AI-powered liquor wholesale onboarding system that transforms the overwhelming 19,000-product catalog into a personalized experience for new customers.

## Problem Statement

Paramount Liquor faces a critical challenge: **30% of new customers never place their first order** due to the overwhelming nature of browsing 19,000 products. While Gold and Platinum customers receive high-touch onboarding, Bronze and Silver customers are left to navigate the vast catalog alone.

## Solution: Paramount Launchpad

Launchpad bridges this gap by providing AI-powered onboarding that:

- **Asks 3-5 simple questions** about venue type, cuisine style, and location
- **Builds a curated Starter Range** of ~100 products tailored to each customer
- **Prioritizes Platinum suppliers** while learning from every order
- **Surfaces trending products** and predicts churn risk
- **Lifts first-order conversion** from 70% to 85%+

## Architecture Overview

This project consists of two main applications:

### Backend (`/backend`)
- **Technology**: Node.js + TypeScript + Express
- **Architecture**: Clean Architecture with SOLID principles
- **Database**: MongoDB with Mongoose
- **Features**: Customer management, onboarding flow, product catalog, AI recommendations

### Frontend (`/frontend`)
- **Technology**: React.js + TypeScript + Vite
- **Architecture**: Clean Architecture with separation of concerns
- **Styling**: Tailwind CSS with custom design system
- **Features**: Customer registration, onboarding flow, product browsing

### Curation Service (`/curation-service`)
- **Technology**: FastAPI + Python 3.11
- **Architecture**: Microservice with rule-based + LLM scoring
- **Features**: AI-powered product curation, deterministic scoring, OpenAI-compatible LLM integration
- **Performance**: Handles 77k+ products efficiently with <1s response time

## 🚀 Quick Start

### Prerequisites

- **Node.js 21.7.0+** (required for backend)
- **Python 3.11+** (required for curation service)
- **PostgreSQL 15+** (for customer and onboarding data)
- **Docker & Docker Compose** (recommended for easy setup)
- **npm or yarn** (package manager)
- **Git** (for cloning the repository)

### 📦 Installation Options

#### Option 1: Complete Docker Setup (Recommended)

The easiest way to get started is with Docker Compose for all services:

```bash
# Clone the repository
git clone <repository-url>
cd hackathon

# Start all services (PostgreSQL + Curation + LLM)
docker compose up -d

# Check service status
docker compose ps

# Wait for services to be ready (about 30-60 seconds)
# Then proceed with backend setup below
```

**Services included:**
- **PostgreSQL**: Customer and onboarding data
- **Curation Service**: AI-powered product curation
- **Ollama**: LLM for AI finalization (optional)

#### Option 2: Hybrid Setup (Docker + Local)

Use Docker for infrastructure services and run applications locally:

```bash
# Start only infrastructure services
docker compose up -d postgres ollama

# Wait for services to be ready
sleep 30

# Then run backend and frontend locally (see below)
```

#### Option 3: Full Local Setup

Run everything locally without Docker:

```bash
# Install PostgreSQL 15+ locally
# Install Python 3.11+ locally
# Install Node.js 21.7.0+ locally
# Then follow individual service setup below
```

### 🧠 Curation Service Setup

The AI-powered product curation service handles 77k+ products efficiently:

#### With Docker (Recommended)
```bash
# Already included in docker compose up -d
# Test the service
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/docs
```

#### Local Development
```bash
cd curation-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Test the service
curl http://localhost:8000/health
```

**Key Features:**
- **Rule-based scoring**: Fast, deterministic product selection (<1s response time)
- **LLM integration**: Optional AI finalization with Ollama
- **Efficient processing**: Handles 77k+ products with minimal memory footprint
- **Production ready**: Dockerized with health checks and monitoring

### 🖥️ Backend Setup

The backend provides the core API for customer management, onboarding, and product operations:

#### With Docker Infrastructure
```bash
cd backend

# Install dependencies
npm install

# Configure environment (defaults work with Docker)
cp env.example .env
# Edit .env if needed - defaults work with Docker setup

# Run database migrations
npm run migrate

# Test database connection
npm run test:migration

# Start development server
npm run dev
```

#### Local PostgreSQL Setup
```bash
# If not using Docker, install PostgreSQL locally
# Create database
createdb paramount_launchpad

# Update .env with local credentials
POSTGRES_HOST=localhost
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# Then follow the same steps as above
```

**Backend will start on `http://localhost:3000`**

#### Available Backend Scripts:
```bash
# Development
npm run dev                 # Start with hot reload
npm run build              # Build for production
npm start                  # Start production build
npm run type-check         # TypeScript type checking

# Database Management
npm run migrate            # Run database migrations
npm run test:migration     # Test database connection
npm run sync:products      # Manual product sync from API

# Testing Suite
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e          # End-to-end tests only
npm run test:performance  # Performance tests
npm run test:coverage     # Test coverage report
npm run test:ci           # CI-optimized test run

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run test:clean        # Clean test artifacts
```

### 🎨 Frontend Setup

The frontend provides the user interface for customer onboarding and product browsing:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will start on `http://localhost:5173` (Vite default)**

#### Available Frontend Scripts:
```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
```

#### Frontend Features:
- **Customer Registration**: Business information and venue type selection
- **Onboarding Flow**: Multi-step questionnaire with progress tracking
- **Product Browsing**: Curated product recommendations
- **Admin Dashboard**: Customer management and analytics
- **Responsive Design**: Mobile-first approach with Tailwind CSS

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

### 🗄️ Database Management

#### PostgreSQL (Customer & Onboarding Data)
```bash
# Run migrations
npm run migrate

# Test database connection
npm run test:migration

# View database (with Docker)
docker exec -it launchpad_postgres psql -U postgres -d paramount_launchpad
```

#### Product Data
- **Development**: Uses JSON files (`data/products.json`)
- **Production**: Can connect to MongoDB or use JSON files
- **Sync**: Automatically updated via cron job

### 🧪 Testing

#### Backend Testing
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit         # Business logic tests
npm run test:integration  # API endpoint tests
npm run test:e2e          # End-to-end flow tests
npm run test:performance  # Performance benchmarks

# Watch mode
npm run test:watch:unit
npm run test:watch:integration
npm run test:watch:e2e

# Coverage report
npm run test:coverage
```

#### Frontend Testing
```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch
```

### 🚀 Production Deployment

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### 🔧 Environment Configuration

#### Backend (.env)
```bash
# Server
PORT=3000
NODE_ENV=production

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=paramount_launchpad

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Service (future integration)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-api-key

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Paramount Launchpad
```

### 🐛 Troubleshooting

#### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Restart database
   docker-compose restart postgres
   ```

2. **Migration Errors**
   ```bash
   # Test database connection
   npm run test:migration
   
   # Check migration status
   npm run migrate
   ```

3. **Product Sync Issues**
   ```bash
   # Check sync status
   curl http://localhost:3000/api/sync/status
   
   # Run manual sync
   npm run sync:products
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or change port in .env
   PORT=3001
   ```

### 📊 Health Checks

- **Backend Health**: `GET http://localhost:3000/health`
- **Sync Status**: `GET http://localhost:3000/api/sync/status`
- **Database Status**: Check logs for connection messages

### ✅ Installation Verification

After completing the setup, verify everything is working correctly:

#### 1. Check All Services
```bash
# Check Docker services
docker compose ps

# Check backend health
curl http://localhost:3000/health

# Check curation service health
curl http://localhost:8000/health

# Check frontend (open in browser)
open http://localhost:5173
```

#### 2. Test Product Curation
```bash
# Test basic curation
curl -X POST "http://localhost:8000/curate" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "tier": "bronze",
      "venueType": "restaurant",
      "location": {"city": "Sydney", "country": "Australia"}
    },
    "maxProducts": 10
  }'
```

#### 3. Test Backend API
```bash
# Test customer creation
curl -X POST "http://localhost:3000/api/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Restaurant",
    "email": "test@example.com",
    "venueType": "restaurant",
    "tier": "bronze"
  }'

# Test product search
curl "http://localhost:3000/api/products?search=wine&limit=5"
```

#### 4. Run Test Suites
```bash
# Backend tests
cd backend && npm run test:all

# Curation service tests
cd curation-service && python test_service.py

# Frontend tests (when implemented)
cd frontend && npm run test
```

### 🎯 Next Steps

1. **Start the application** using the setup above
2. **Visit the frontend** at `http://localhost:5173`
3. **Test the API** using the provided endpoints
4. **Check the logs** for any issues
5. **Run tests** to ensure everything works correctly
6. **Explore the admin dashboard** for customer management
7. **Try the onboarding flow** to see AI-powered curation in action

## Key Features

### 🎯 AI-Powered Onboarding
- Multi-step questionnaire tailored to venue type
- Smart product curation based on customer preferences
- Progress tracking and completion analytics

### 🏪 Customer Management
- Tier-based customer system (Bronze, Silver, Gold, Platinum)
- Venue type classification (Restaurant, Bar, Hotel, etc.)
- Location-based customer segmentation

### 📦 Product Catalog
- 19,000+ product database with supplier management
- Category-based organization (Spirits, Wine, Beer, etc.)
- Inventory tracking and pricing tiers
- Supplier tier system with preferential treatment

### 🔍 Smart Recommendations
- Curated product sets for new customers
- Trending product identification
- Personalized recommendations based on venue type
- Churn prediction and intervention

## Business Impact

- **Revenue Growth**: Capture millions in lost revenue from the 30% who never order
- **Customer Experience**: Every tier feels supported and seen
- **Operational Efficiency**: Reduce manual workload for digital team
- **Supplier Relations**: Stronger ROI and visibility for suppliers
- **Market Position**: First AI-driven liquor wholesaler

## Technical Highlights

### Backend Architecture
- **Domain-Driven Design**: Clear separation of business logic
- **SOLID Principles**: Maintainable and extensible codebase
- **Repository Pattern**: Abstracted data access layer
- **Use Case Pattern**: Encapsulated business operations
- **Dependency Injection**: Testable and flexible design

### Frontend Architecture
- **Clean Architecture**: Separation of presentation, domain, and data layers
- **Type Safety**: Full TypeScript integration
- **Component-Based**: Reusable and maintainable UI components
- **Form Management**: Robust form handling with validation
- **Responsive Design**: Mobile-first approach

## API Documentation

### Customer Endpoints
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer information

### Onboarding Endpoints
- `POST /api/onboarding/start` - Begin onboarding process
- `POST /api/onboarding/response` - Submit onboarding answers
- `GET /api/onboarding/session/:id/progress` - Track progress

### Product Endpoints
- `GET /api/products` - Search and filter products
- `GET /api/products/recommended/:customerId` - Get personalized recommendations
- `GET /api/products/trending` - Get trending products

## Development

### Code Quality
- ESLint configuration for consistent code style
- TypeScript strict mode for type safety
- Comprehensive error handling
- Logging with Winston
- Input validation with Joi

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for React components
- End-to-end testing for critical flows

## Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## Future Enhancements

- **Machine Learning Integration**: Advanced recommendation algorithms
- **Real-time Analytics**: Customer behavior tracking
- **Mobile App**: Native mobile experience
- **Advanced AI**: Natural language processing for product queries
- **Integration APIs**: Connect with existing POS systems

## Contributing

1. Follow the established architecture patterns
2. Write comprehensive tests
3. Update documentation
4. Use semantic commit messages
5. Follow accessibility guidelines

## License

MIT License - see LICENSE file for details

---

**Paramount Launchpad** - Turning data into day-one delight, and that's how Paramount wins the future. 🚀
