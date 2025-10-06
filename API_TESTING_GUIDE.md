# Paramount Launchpad API Testing Guide

## Overview
This guide explains how to test the AI-powered Paramount Launchpad API functionality properly. The API provides AI-powered product curation, customer segmentation, and personalized recommendations.

## Prerequisites
1. Backend server running on port 3000
2. PostgreSQL database running
3. OpenAI API key configured
4. `jq` installed for JSON formatting (optional but recommended)

## Quick Start

### 1. Health Check
```bash
curl http://localhost:3000/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-16T10:07:38.799Z",
  "service": "Paramount Launchpad API"
}
```

### 2. Test Product API
```bash
curl http://localhost:3000/api/products | jq '.'
```
**Expected Response:** List of all active products with full details including pricing, inventory, and supplier information.

## Complete API Testing Flow

### Step 1: Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Restaurant",
    "venueType": "restaurant",
    "cuisineStyle": "Italian",
    "location": {
      "address": "123 Test Street",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2000",
      "country": "Australia"
    }
  }' | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer-uuid",
    "email": "test@example.com",
    "name": "Test Restaurant",
    "tier": "bronze",
    "venueType": "restaurant",
    "cuisineStyle": "Italian",
    "location": { ... },
    "onboardingStatus": "not_started",
    "preferences": { ... },
    "createdAt": "2025-09-16T10:08:06.848Z",
    "updatedAt": "2025-09-16T10:08:06.848Z"
  }
}
```

### Step 2: Start Onboarding Session
```bash
curl -X POST http://localhost:3000/api/onboarding/start \
  -H "Content-Type: application/json" \
  -d '{"customerId": "CUSTOMER_ID_FROM_STEP_1"}' | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "customerId": "customer-uuid",
    "currentStep": "welcome",
    "responses": [],
    "curatedProducts": [],
    "status": "active",
    "startedAt": "2025-09-16T10:08:13.619Z",
    "completedAt": null,
    "lastActivityAt": "2025-09-16T10:08:13.619Z"
  }
}
```

### Step 3: Test AI Product Curation
```bash
curl http://localhost:3000/api/products/ai-curated/CUSTOMER_ID | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "curatedProducts": [
      {
        "id": "prod-001",
        "name": "Penfolds Grange 2018",
        "description": "Premium Australian Shiraz wine from Barossa Valley",
        "category": "wine",
        "supplier": {
          "tier": "platinum",
          "name": "Penfolds Wines"
        },
        "pricing": { ... },
        "inventory": { ... },
        "specifications": { ... },
        "tags": ["premium", "award-winning", "shiraz", "barossa"]
      }
    ],
    "reasoning": [
      "Fallback curation used due to AI service unavailability",
      "Prioritized Platinum suppliers",
      "Focused on in-stock products"
    ],
    "confidence": 0.6,
    "platinumSupplierProducts": [ ... ],
    "bundledPacks": [ ... ],
    "localFavorites": [ ... ],
    "customerSegment": { ... },
    "generatedAt": "2025-09-16T10:08:28.066Z"
  }
}
```

### Step 4: Test AI Local Favorites
```bash
curl http://localhost:3000/api/products/ai-local-favorites/CUSTOMER_ID | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-001",
      "name": "Penfolds Grange 2018",
      "description": "Premium Australian Shiraz wine from Barossa Valley",
      "category": "wine",
      "supplier": {
        "tier": "platinum",
        "name": "Penfolds Wines"
      }
    }
  ],
  "total": 1
}
```

### Step 5: Test AI Customer Segmentation
```bash
curl -X POST http://localhost:3000/api/products/ai-segmentation \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "sessionId": "SESSION_ID"
  }' | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "recommendedSegment": {
      "id": "segment-restaurant-fine-dining",
      "name": "Fine Dining Restaurant",
      "description": "High-end restaurants with premium wine and spirits focus",
      "criteria": { ... },
      "productTemplate": ["wine", "spirits", "champagne", "cocktail_ingredients"]
    },
    "reasoning": [ ... ],
    "confidence": 0.8,
    "alternativeSegments": [ ... ]
  }
}
```

## Product Search and Filtering

### Search Products by Query
```bash
curl "http://localhost:3000/api/products/search?q=wine" | jq '.'
```

### Filter by Category
```bash
curl "http://localhost:3000/api/products?category=wine" | jq '.'
```

### Filter by Supplier Tier
```bash
curl "http://localhost:3000/api/products?supplierTier=platinum" | jq '.'
```

### Filter by Price Range
```bash
curl "http://localhost:3000/api/products?minPrice=50&maxPrice=100" | jq '.'
```

### Get Trending Products
```bash
curl "http://localhost:3000/api/products/trending?limit=10" | jq '.'
```

### Get Recommended Products for Customer
```bash
curl "http://localhost:3000/api/products/recommended/CUSTOMER_ID?limit=10" | jq '.'
```

## Error Handling

### Invalid Customer ID
```bash
curl http://localhost:3000/api/products/ai-curated/invalid-id | jq '.'
```
**Expected Response:**
```json
{
  "success": false,
  "error": "Customer not found"
}
```

### Missing Onboarding Session
```bash
# Create customer without onboarding session
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"email": "no-session@example.com","name": "No Session Restaurant","venueType": "restaurant","location": {"address": "123 No Session Street","city": "Sydney","state": "NSW","postcode": "2000","country": "Australia"}}' | jq '.id'

# Try AI curation (will fail)
curl http://localhost:3000/api/products/ai-curated/CUSTOMER_ID | jq '.'
```
**Expected Response:**
```json
{
  "success": false,
  "error": "Onboarding session not found"
}
```

## Performance Testing

### Test Response Times
```bash
time curl -s http://localhost:3000/api/products > /dev/null
time curl -s http://localhost:3000/api/products/ai-curated/CUSTOMER_ID > /dev/null
```

### Test Concurrent Requests
```bash
# Test 10 concurrent requests
for i in {1..10}; do
  curl -s http://localhost:3000/api/products > /dev/null &
done
wait
```

## Data Validation

### Test Customer Creation Validation
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid@example.com"}' | jq '.'

# Invalid venue type
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-venue@example.com",
    "name": "Invalid Venue",
    "venueType": "invalid",
    "location": {
      "address": "123 Invalid Street",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2000",
      "country": "Australia"
    }
  }' | jq '.'
```

## AI Functionality Testing

### Test AI Curation with Different Customer Types
```bash
# Fine dining restaurant
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"email": "fine-dining@example.com","name": "Fine Dining Restaurant","venueType": "restaurant","cuisineStyle": "fine-dining","location": {"address": "123 Fine Dining Street","city": "Sydney","state": "NSW","postcode": "2000","country": "Australia"}}' | jq '.id'

# Casual bar
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"email": "casual-bar@example.com","name": "Casual Bar","venueType": "bar","cuisineStyle": "casual","location": {"address": "123 Casual Street","city": "Melbourne","state": "VIC","postcode": "3000","country": "Australia"}}' | jq '.id'

# Hotel
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"email": "hotel@example.com","name": "Hotel Restaurant","venueType": "hotel","cuisineStyle": "international","location": {"address": "123 Hotel Street","city": "Brisbane","state": "QLD","postcode": "4000","country": "Australia"}}' | jq '.id'
```

Then test AI curation for each:
```bash
# Start onboarding for each customer
curl -X POST http://localhost:3000/api/onboarding/start -H "Content-Type: application/json" -d '{"customerId": "FINE_DINING_CUSTOMER_ID"}'
curl -X POST http://localhost:3000/api/onboarding/start -H "Content-Type: application/json" -d '{"customerId": "CASUAL_BAR_CUSTOMER_ID"}'
curl -X POST http://localhost:3000/api/onboarding/start -H "Content-Type: application/json" -d '{"customerId": "HOTEL_CUSTOMER_ID"}'

# Test AI curation for each
curl http://localhost:3000/api/products/ai-curated/FINE_DINING_CUSTOMER_ID | jq '.data.customerSegment.name'
curl http://localhost:3000/api/products/ai-curated/CASUAL_BAR_CUSTOMER_ID | jq '.data.customerSegment.name'
curl http://localhost:3000/api/products/ai-curated/HOTEL_CUSTOMER_ID | jq '.data.customerSegment.name'
```

## Troubleshooting

### Common Issues

1. **"Internal server error"**
   - Check if backend is running: `curl http://localhost:3000/health`
   - Check database connection
   - Check environment variables

2. **"Customer not found"**
   - Ensure customer ID is correct
   - Check if customer exists in database

3. **"Onboarding session not found"**
   - Create onboarding session first
   - Check if session ID is correct

4. **"Product not found"**
   - Check if products exist in database
   - Run the sample products script: `cd backend && npx ts-node scripts/add-sample-products.ts`

### Debug Mode
Enable debug logging by setting environment variable:
```bash
export DEBUG=paramount-launchpad:*
```

### Database Queries
Check database directly:
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d paramount_launchpad

# Check customers
SELECT id, email, name, "venueType" FROM customers;

# Check products
SELECT id, name, category, "supplier"->>'tier' as supplier_tier FROM products;

# Check onboarding sessions
SELECT id, "customerId", status, "currentStep" FROM onboarding_sessions;
```

## API Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "data": { ... },  // Present when success: true
  "error": "Error message",  // Present when success: false
  "pagination": {  // Present for list endpoints
    "total": 100,
    "offset": 0,
    "limit": 20,
    "hasMore": true
  }
}
```

## Rate Limiting
The API currently has no rate limiting implemented. In production, consider implementing rate limiting based on:
- Customer tier (Platinum customers get higher limits)
- API endpoint type
- Time-based limits

## Security Considerations
- All customer data is validated using Joi schemas
- SQL injection is prevented using parameterized queries
- Input sanitization is handled by validation middleware
- Environment variables are used for sensitive configuration

## Monitoring and Logging
- All API calls are logged with timestamps
- Error responses include appropriate HTTP status codes
- Database queries are logged in development mode
- AI service calls are logged with confidence scores

## Next Steps
1. Implement authentication and authorization
2. Add rate limiting
3. Implement caching for frequently accessed data
4. Add comprehensive error tracking
5. Implement API versioning
6. Add comprehensive API documentation with OpenAPI/Swagger