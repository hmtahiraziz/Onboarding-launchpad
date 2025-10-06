# Product Curation Service 🧠

A production-ready FastAPI microservice for AI-powered product curation in liquor wholesale. This service transforms a massive product catalog into personalized, curated selections based on business profiles, solving the critical problem where 30% of new customers never place their first order due to catalog complexity.

## ✨ Features

- **Rule-based Scoring**: Fast, deterministic product scoring using business rules
- **LLM Integration**: Optional OpenAI-compatible LLM finalization (Ollama support)
- **Efficient Processing**: Handles large catalogs (77k+ products) without sending full data to LLM
- **Dockerized**: Production-ready container with health checks
- **Comprehensive API**: RESTful endpoints with detailed documentation
- **Performance Optimized**: <1s response time for rule-based curation
- **Memory Efficient**: Processes 77k+ products with minimal memory footprint
- **Production Ready**: Health checks, logging, and error handling

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (required for optimal performance)
- **pip** (Python package manager)
- **Docker & Docker Compose** (optional, for containerized setup)
- **Product catalog JSON file** (77k+ products from Paramount Liquor)

### 📦 Installation Options

#### Option 1: Local Development (Recommended)

1. **Clone and navigate to the service:**
   ```bash
   cd curation-service
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   # The .env file is already configured for local development
   # Edit .env if you need to change any settings
   ```

5. **Run the service:**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Verify installation:**
   ```bash
   # Check service health
   curl http://localhost:8000/health
   
   # View API documentation
   open http://localhost:8000/docs
   ```

#### Option 2: Docker Setup (Production-like)

1. **Build Docker image:**
   ```bash
   docker build -t curation-service .
   ```

2. **Run with product catalog:**
   ```bash
   docker run -p 8000:8000 \
     -v /path/to/products.json:/app/data/products.json:ro \
     -e PRODUCTS_JSON=/app/data/products.json \
     curation-service
   ```

#### Option 3: Docker Compose (Full Stack)

1. **Start with rule-based scoring only:**
   ```bash
   # From project root
   docker compose up -d postgres curation
   ```

2. **Start with LLM finalization:**
   ```bash
   # Includes Ollama for AI processing
   docker compose up -d
   ```

3. **Check service status:**
   ```bash
   docker compose ps
   curl http://localhost:8000/health
   ```

## Environment Configuration

The service uses a `.env` file for configuration. The file is already set up for local development with these default values:

```bash
# Product Catalog Configuration
PRODUCTS_JSON=/home/majid/Workspace/hackathon/backend/data/products.json

# Curation Parameters
DEFAULT_MAX_PRODUCTS=100
TOP_K_PRESELECT=250

# LLM Configuration
USE_LLM=false
LLM_BASE_URL=http://ollama:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=llama3.1
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=1800

# Server Configuration
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000
```

You can edit the `.env` file to change any settings as needed.

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
  "service": "product-curation",
  "version": "1.0.0",
  "products_loaded": 77000,
  "llm_enabled": false
}
```

#### Service Statistics
```http
GET /stats
```
**Response:**
```json
{
  "total_products": 77000,
  "products_loaded": 77000,
  "categories": 15,
  "suppliers": 250,
  "platinum_suppliers": 12,
  "memory_usage_mb": 180,
  "uptime_seconds": 3600
}
```

### 🎯 Product Curation

#### Curate Products

**POST** `/curate`

Curate products based on a business profile using AI-powered algorithms.

**Request Body:**
```json
{
  "profile": {
    "tier": "bronze",
    "location": {
      "city": "Sydney",
      "state": "NSW",
      "address": "123 Test St",
      "country": "Australia",
      "postcode": "2000"
    },
    "venueType": "restaurant",
    "cuisineStyle": "fine dining",
    "budgetBand": "mid"
  },
  "maxProducts": 100,
  "preferences": {
    "categories": ["wine", "champagne"],
    "excludeCategories": ["beer"],
    "supplierTiers": ["platinum", "gold"]
  }
}
```

**Response:**
```json
{
  "curatedProductIds": ["prod_123", "prod_456", "..."],
  "reasoning": [
    "Curated for restaurant venue type",
    "Prioritized products available in Sydney",
    "Emphasized wine and champagne selections for dining experience",
    "Focused on platinum and gold suppliers for quality assurance"
  ],
  "confidence": 0.85,
  "platinumSupplierProducts": ["prod_123", "prod_456"],
  "bundledPacks": ["prod_789", "prod_101"],
  "localFavorites": ["prod_202", "prod_303"],
  "businessInsights": [
    "Top category: Wine (45 products)",
    "Products from 12 different suppliers",
    "Average price range: $25-$150",
    "95% of products available in Sydney"
  ],
  "nextSteps": [
    "Review curated product list and select initial order",
    "Contact suppliers for pricing and availability",
    "Consider seasonal promotions for wine selections"
  ],
  "generatedAt": "2024-01-15T10:30:00Z",
  "processingTimeMs": 850
}
```

#### Get Product Details

**GET** `/products/{product_id}`

Get detailed information about a specific product.

**Response:**
```json
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
  "description": "Premium Australian Shiraz from Barossa Valley",
  "imageUrl": "https://example.com/grange.jpg",
  "attributes": {
    "alcoholContent": "14.5%",
    "vintage": "2018",
    "region": "Barossa Valley",
    "grapeVariety": "Shiraz"
  },
  "scoring": {
    "visibility": 4,
    "localityScore": 0.95,
    "categoryFitness": 0.88,
    "supplierTier": 1.0
  }
}
```

#### Search Products

**GET** `/products/search?q={query}&category={category}&limit={limit}`

Search products with filters.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Filter by category
- `supplier` (string): Filter by supplier tier
- `location` (string): Filter by availability in city
- `limit` (number): Maximum results (default: 20, max: 100)

**Response:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Penfolds Grange 2018",
      "category": "Wine",
      "supplierTier": "platinum",
      "price": 850.00,
      "availability": {
        "sydney": true,
        "melbourne": true
      }
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### 💡 Usage Examples

#### Basic Product Curation

**Rule-based curation (fast, deterministic):**
```bash
curl -X POST "http://localhost:8000/curate" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "tier": "bronze",
      "location": {
        "city": "Sydney",
        "state": "NSW",
        "country": "Australia"
      },
      "venueType": "restaurant",
      "cuisineStyle": "fine dining"
    },
    "maxProducts": 50
  }'
```

**Advanced curation with preferences:**
```bash
curl -X POST "http://localhost:8000/curate" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "tier": "gold",
      "location": {
        "city": "Melbourne",
        "state": "VIC",
        "country": "Australia"
      },
      "venueType": "bar",
      "cuisineStyle": "cocktail bar"
    },
    "maxProducts": 100,
    "preferences": {
      "categories": ["spirits", "champagne"],
      "excludeCategories": ["beer"],
      "supplierTiers": ["platinum", "gold"]
    }
  }'
```

**With LLM finalization (AI-enhanced):**
```bash
# First, ensure Ollama is running and USE_LLM=true
curl -X POST "http://localhost:8000/curate" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "tier": "platinum",
      "location": {
        "city": "Melbourne",
        "state": "VIC",
        "country": "Australia"
      },
      "venueType": "fine dining",
      "cuisineStyle": "modern australian"
    },
    "maxProducts": 100
  }'
```

#### Product Search and Discovery

**Search products by name:**
```bash
curl "http://localhost:8000/products/search?q=penfolds&limit=10"
```

**Filter by category and supplier:**
```bash
curl "http://localhost:8000/products/search?category=wine&supplier=platinum&limit=20"
```

**Get product details:**
```bash
curl "http://localhost:8000/products/prod_123"
```

#### Health and Monitoring

**Check service health:**
```bash
curl "http://localhost:8000/health"
```

**Get service statistics:**
```bash
curl "http://localhost:8000/stats"
```

**View API documentation:**
```bash
# Open in browser
open http://localhost:8000/docs
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PRODUCTS_JSON` | `/app/data/products.json` | Path to products JSON file |
| `DEFAULT_MAX_PRODUCTS` | `100` | Default maximum products to return |
| `TOP_K_PRESELECT` | `250` | Number of candidates for LLM processing |
| `USE_LLM` | `false` | Enable LLM finalization |
| `LLM_BASE_URL` | `http://ollama:11434/v1` | LLM API base URL |
| `LLM_API_KEY` | `ollama` | LLM API key |
| `LLM_MODEL` | `llama3.1` | LLM model name |
| `LLM_TEMPERATURE` | `0.3` | LLM temperature |
| `LLM_MAX_TOKENS` | `1800` | Maximum LLM tokens |
| `UVICORN_HOST` | `0.0.0.0` | Server host |
| `UVICORN_PORT` | `8000` | Server port |

### Product Catalog Format

The service expects a JSON file with products in one of these formats:

**Format 1 - Direct array:**
```json
[
  {
    "id": "product1",
    "name": "Product Name",
    "visibility": "4",
    "category_level_1": "Wine",
    "sold_at_sydney": 1,
    ...
  }
]
```

**Format 2 - Object with products key:**
```json
{
  "products": [
    {
      "id": "product1",
      "name": "Product Name",
      "visibility": "4",
      ...
    }
  ]
}
```

## Scoring Algorithm

### Rule-based Scoring

The service uses a deterministic scoring system with these factors:

1. **Visibility Filter**: Only products with `visibility == "4"`
2. **Locality Score**: Boost for products available in the specified city
3. **Category Fitness**: Weighted by venue type and cuisine style
4. **Bundle Detection**: Boost for products with bundle keywords
5. **Supplier Tier**: Boost for platinum > gold > silver > bronze
6. **Diversity**: Limit duplicates across brand-category combinations

### LLM Finalization

When `USE_LLM=true`, the service:
1. Sends only the top-K candidates to the LLM (not the full catalog)
2. Requests structured JSON response with reasoning
3. Falls back to rule-based results if LLM fails
4. Ensures response never exceeds maxProducts limit

## Architecture

```
curation-service/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── loader.py            # Product catalog loader
│   ├── scoring.py           # Rule-based scoring
│   └── llm_client.py        # LLM integration
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container definition
├── .env.example            # Environment variables
└── README.md               # This file
```

## 🛠️ Development

### Local Development Setup

1. **Setup environment:**
   ```bash
   cd curation-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   # The .env file is already configured for local development
   # Edit .env if you need to change any settings
   ```

3. **Run tests:**
   ```bash
   # Test the service
   python test_service.py
   
   # Run examples
   python example_usage.py
   
   # Run with pytest (if available)
   pytest tests/ -v
   ```

4. **Run development server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

1. **Build image:**
   ```bash
   docker build -t curation-service .
   ```

2. **Run container:**
   ```bash
   docker run -p 8000:8000 \
     -v /path/to/products.json:/app/data/products.json:ro \
     -e PRODUCTS_JSON=/app/data/products.json \
     curation-service
   ```

3. **Run with environment file:**
   ```bash
   docker run -p 8000:8000 \
     -v /path/to/products.json:/app/data/products.json:ro \
     --env-file .env \
     curation-service
   ```

### 🧪 Testing

#### Test the Service
```bash
# Basic functionality test
python test_service.py

# Run example curations
python example_usage.py

# Test with different profiles
python -c "
from app.main import app
from fastapi.testclient import TestClient
client = TestClient(app)
response = client.post('/curate', json={
    'profile': {'tier': 'bronze', 'venueType': 'restaurant'},
    'maxProducts': 10
})
print(response.json())
"
```

#### Performance Testing
```bash
# Test with large product catalog
python -c "
import time
import requests
start = time.time()
response = requests.post('http://localhost:8000/curate', json={
    'profile': {'tier': 'platinum', 'venueType': 'fine dining'},
    'maxProducts': 100
})
print(f'Response time: {time.time() - start:.2f}s')
print(f'Status: {response.status_code}')
"
```

## 🐛 Troubleshooting

### Common Issues

#### Products Not Loading
```bash
# Check file path in .env file
grep PRODUCTS_JSON .env

# Verify JSON format is valid
python -c "import json; json.load(open('path/to/products.json'))"

# Check file permissions
ls -la /path/to/products.json

# Test product loading
python -c "
from app.loader import load_products
products = load_products()
print(f'Loaded {len(products)} products')
"
```

#### LLM Not Working
```bash
# Check if Ollama is running
docker ps | grep ollama

# Test LLM connection
curl http://localhost:11434/api/tags

# Check environment variables
grep USE_LLM .env
grep LLM_BASE_URL .env

# Test LLM API
python -c "
import requests
response = requests.get('http://localhost:11434/api/tags')
print(f'LLM Status: {response.status_code}')
"
```

#### Memory Issues
```bash
# Check memory usage
python -c "
import psutil
print(f'Memory usage: {psutil.virtual_memory().percent}%')
"

# Reduce memory usage
# Edit .env file:
# TOP_K_PRESELECT=100  # Reduce from 250
# USE_LLM=false        # Disable LLM processing
```

#### Environment Variables Not Loading
```bash
# Check .env file location
ls -la .env

# Verify python-dotenv is installed
pip list | grep python-dotenv

# Test environment loading
python -c "
from dotenv import load_dotenv
load_dotenv()
import os
print(f'PRODUCTS_JSON: {os.getenv(\"PRODUCTS_JSON\")}')
"
```

#### Service Not Starting
```bash
# Check port availability
lsof -i :8000

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r requirements.txt
```

### 🔍 Debugging

#### Enable Debug Logging
```bash
# Add to .env file
LOG_LEVEL=DEBUG
UVICORN_LOG_LEVEL=debug

# Run with debug output
python -m uvicorn app.main:app --reload --log-level debug
```

#### Check Service Logs
```bash
# Docker logs
docker logs curation-service

# Local development logs
tail -f logs/curation.log  # If logging to file

# Real-time monitoring
watch -n 1 'curl -s http://localhost:8000/health | jq'
```

#### Performance Monitoring
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep python'

# Test response times
for i in {1..10}; do
  time curl -s -X POST http://localhost:8000/curate \
    -H "Content-Type: application/json" \
    -d '{"profile": {"tier": "bronze", "venueType": "restaurant"}, "maxProducts": 10}'
done
```

### 🏥 Health Checks

#### Service Health
```bash
# Basic health check
curl http://localhost:8000/health

# Detailed statistics
curl http://localhost:8000/stats

# API documentation
open http://localhost:8000/docs
```

#### Database/Storage Health
```bash
# Check product file
ls -la /path/to/products.json

# Verify product count
curl -s http://localhost:8000/stats | jq '.total_products'

# Test product search
curl "http://localhost:8000/products/search?q=wine&limit=1"
```

### 📊 Performance Optimization

#### For Large Catalogs (100k+ products)
```bash
# Reduce memory usage
TOP_K_PRESELECT=100
USE_LLM=false

# Increase memory limit
export PYTHONHASHSEED=0
python -m uvicorn app.main:app --workers 1
```

#### For High Throughput
```bash
# Use multiple workers
python -m uvicorn app.main:app --workers 4

# Enable gzip compression
# Add to FastAPI app configuration
```

### 🔧 Configuration Issues

#### Invalid JSON Format
```bash
# Validate JSON file
python -c "
import json
try:
    with open('products.json') as f:
        data = json.load(f)
    print('JSON is valid')
    print(f'Type: {type(data)}')
    if isinstance(data, dict) and 'products' in data:
        print(f'Products count: {len(data[\"products\"])}')
    elif isinstance(data, list):
        print(f'Products count: {len(data)}')
except Exception as e:
    print(f'JSON error: {e}')
"
```

#### Missing Dependencies
```bash
# Install all dependencies
pip install -r requirements.txt

# Check specific packages
pip list | grep -E "(fastapi|uvicorn|pydantic|openai)"
```

### 🚨 Emergency Recovery

#### Reset Service
```bash
# Stop all containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Restart fresh
docker compose up -d
```

#### Fallback to Rule-based Only
```bash
# Disable LLM processing
echo "USE_LLM=false" >> .env

# Restart service
docker compose restart curation
```

#### Manual Product Loading
```bash
# Test product loading manually
python -c "
from app.loader import load_products
products = load_products()
print(f'Successfully loaded {len(products)} products')
"
```

## Performance

- **Cold start:** ~2-3 seconds for 77k products
- **Memory usage:** ~200MB for 77k products
- **Response time:** <1s for rule-based, 2-5s with LLM
- **Throughput:** 100+ requests/second

## Security

- No authentication required (internal service)
- Input validation via Pydantic
- No secrets in code (environment variables)
- Read-only product catalog access

## License

Internal use only - Paramount Launchpad project.
