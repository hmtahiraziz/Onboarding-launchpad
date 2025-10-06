# 🚀 Paramount Launchpad Frontend Integration Guide

## 📋 **Quick Start**

### 1. **Backend is Running**
- **URL**: `http://localhost:3000`
- **Status**: ✅ Working
- **Health Check**: `GET /health`

### 2. **Test Backend is Working**
```bash
curl http://localhost:3000/health
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-16T09:28:12.649Z",
  "service": "Paramount Launchpad API"
}
```

## 🎯 **API Endpoints for Frontend**

### **Base URL**: `http://localhost:3000`

---

## 1. **Customer Management**

### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "email": "customer@example.com",
  "name": "Customer Name",
  "venueType": "restaurant",
  "cuisineStyle": "Italian",
  "location": {
    "address": "123 Main Street",
    "city": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "Australia"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "customer@example.com",
    "name": "Customer Name",
    "tier": "bronze",
    "venueType": "restaurant",
    "cuisineStyle": "Italian",
    "location": { ... },
    "onboardingStatus": "not_started",
    "preferences": { ... },
    "createdAt": "2025-09-16T09:28:12.649Z",
    "updatedAt": "2025-09-16T09:28:12.649Z"
  }
}
```

### Get Customer
```http
GET /api/customers/{customerId}
```

---

## 2. **AI-Powered Product Curation**

### Get AI-Curated Products
```http
GET /api/products/ai-curated/{customerId}?maxProducts=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "curatedProducts": [
      {
        "id": "product-id",
        "name": "Product Name",
        "description": "Product Description",
        "category": "Spirits",
        "supplier": "Supplier Name",
        "pricing": {
          "cost": 25.99,
          "retail": 35.99,
          "wholesale": 30.99
        },
        "inventory": {
          "available": 100,
          "reserved": 0
        },
        "specifications": { ... },
        "tags": ["platinum", "bundle", "local-favorite"],
        "aiConfidence": 0.95,
        "aiReasoning": "Recommended based on venue type and cuisine style"
      }
    ],
    "reasoning": "AI reasoning for product selection",
    "confidence": 0.92,
    "generatedAt": "2025-09-16T09:28:12.649Z"
  }
}
```

### Get Bundled Packs
```http
GET /api/products/ai-bundled-packs?limit=20
```

### Get Local Favorites
```http
GET /api/products/ai-local-favorites/{customerId}?limit=20
```

### Customer Segmentation
```http
POST /api/products/ai-segmentation
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "sessionId": "session-uuid"
}
```

---

## 3. **Onboarding Flow**

### Start Onboarding
```http
POST /api/onboarding/start
Content-Type: application/json

{
  "customerId": "customer-uuid"
}
```

### Submit Onboarding Response
```http
POST /api/onboarding/response
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "step": "venue_type",
  "answer": "restaurant"
}
```

### Get Next Question
```http
GET /api/onboarding/session/{sessionId}/next-question
```

### Generate Curated Products
```http
POST /api/onboarding/session/{sessionId}/curated-products
```

---

## 4. **Product Management**

### Get All Products
```http
GET /api/products?page=1&limit=50&category=spirits&supplier=platinum
```

### Search Products
```http
GET /api/products/search?q=whiskey&category=spirits
```

### Get Product by ID
```http
GET /api/products/{productId}
```

---

## 💻 **Frontend Code Examples**

### React/TypeScript Example

```typescript
// API Client
const API_BASE = 'http://localhost:3000';

export class ParamountAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Health Check
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // Create Customer
  async createCustomer(customerData: CreateCustomerRequest) {
    const response = await fetch(`${this.baseUrl}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    return response.json();
  }

  // Get AI-Curated Products
  async getAICuratedProducts(customerId: string, maxProducts: number = 100) {
    const response = await fetch(
      `${this.baseUrl}/api/products/ai-curated/${customerId}?maxProducts=${maxProducts}`
    );
    return response.json();
  }

  // Get Bundled Packs
  async getBundledPacks(limit: number = 20) {
    const response = await fetch(
      `${this.baseUrl}/api/products/ai-bundled-packs?limit=${limit}`
    );
    return response.json();
  }

  // Start Onboarding
  async startOnboarding(customerId: string) {
    const response = await fetch(`${this.baseUrl}/api/onboarding/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId })
    });
    return response.json();
  }
}

// Types
interface CreateCustomerRequest {
  email: string;
  name: string;
  venueType: 'restaurant' | 'bar' | 'hotel' | 'nightclub' | 'cafe' | 'catering';
  cuisineStyle?: string;
  location: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  supplier: string;
  pricing: {
    cost: number;
    retail: number;
    wholesale: number;
  };
  inventory: {
    available: number;
    reserved: number;
  };
  tags: string[];
  aiConfidence: number;
  aiReasoning: string;
}

// Usage Example
const api = new ParamountAPI();

// Create a customer
const customer = await api.createCustomer({
  email: 'test@example.com',
  name: 'Test Customer',
  venueType: 'restaurant',
  cuisineStyle: 'Italian',
  location: {
    address: '123 Main Street',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia'
  }
});

// Get AI-curated products
const products = await api.getAICuratedProducts(customer.data.id, 50);
```

### JavaScript Example

```javascript
const API_BASE = 'http://localhost:3000';

// Health check
const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
};

// Create customer
const createCustomer = async (customerData) => {
  const response = await fetch(`${API_BASE}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return response.json();
};

// Get AI products
const getAIProducts = async (customerId, maxProducts = 100) => {
  const response = await fetch(
    `${API_BASE}/api/products/ai-curated/${customerId}?maxProducts=${maxProducts}`
  );
  return response.json();
};

// Get bundled packs
const getBundledPacks = async (limit = 20) => {
  const response = await fetch(
    `${API_BASE}/api/products/ai-bundled-packs?limit=${limit}`
  );
  return response.json();
};

// Usage
const main = async () => {
  // Check if API is running
  const health = await checkHealth();
  console.log('API Status:', health);

  // Create customer
  const customer = await createCustomer({
    email: 'test@example.com',
    name: 'Test Customer',
    venueType: 'restaurant',
    cuisineStyle: 'Italian',
    location: {
      address: '123 Main Street',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia'
    }
  });

  if (customer.success) {
    // Get AI-curated products
    const products = await getAIProducts(customer.data.id, 50);
    console.log('AI Products:', products);

    // Get bundled packs
    const bundles = await getBundledPacks(10);
    console.log('Bundled Packs:', bundles);
  }
};

main();
```

---

## 🧪 **Testing Commands**

### Test Health
```bash
curl http://localhost:3000/health
```

### Test Customer Creation
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Customer",
    "venueType": "restaurant",
    "cuisineStyle": "Italian",
    "location": {
      "address": "123 Main Street",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2000",
      "country": "Australia"
    }
  }'
```

### Test AI Products (replace CUSTOMER_ID)
```bash
curl http://localhost:3000/api/products/ai-curated/CUSTOMER_ID
```

### Test Bundled Packs
```bash
curl http://localhost:3000/api/products/ai-bundled-packs?limit=5
```

---

## 🚨 **Error Handling**

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 📝 **Important Notes**

1. **Always check `success` field** in responses
2. **Create customer first** before using AI endpoints
3. **AI endpoints may take 2-5 seconds** to respond
4. **Use proper error handling** for network issues
5. **Customer ID is required** for most AI endpoints
6. **Onboarding session** needed for full AI functionality

---

## 🎯 **Quick Integration Steps**

1. **Test API**: `curl http://localhost:3000/health`
2. **Create customer** using the API
3. **Get customer ID** from response
4. **Call AI endpoints** with customer ID
5. **Handle responses** and display products
6. **Implement onboarding flow** for new users

---

## 🔧 **Environment Setup**

The backend uses these environment variables:
- `OPENAI_API_KEY`: For AI functionality
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: For authentication
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

---

## 📞 **Support**

If you encounter issues:
1. Check if backend is running: `curl http://localhost:3000/health`
2. Verify customer exists before calling AI endpoints
3. Check network connectivity
4. Review error messages in response

**Backend is currently running and ready for integration!** 🚀
