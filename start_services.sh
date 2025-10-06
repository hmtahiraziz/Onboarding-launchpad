#!/bin/bash

# Paramount Launchpad - Service Startup Script
# This script starts all services using the consolidated docker-compose.yml

echo "🚀 Starting Paramount Launchpad Services"
echo "========================================"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker and Docker Compose."
    exit 1
fi

# Check if products.json exists
if [ ! -f "./backend/data/products.json" ]; then
    echo "❌ Products file not found at ./backend/data/products.json"
    echo "   Please ensure the products catalog is available."
    exit 1
fi

echo "✅ Products catalog found"
echo ""

# Function to start services
start_services() {
    local services=$1
    local description=$2
    
    echo "🔄 Starting $description..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d $services
    else
        docker compose up -d $services
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ $description started successfully"
    else
        echo "❌ Failed to start $description"
        exit 1
    fi
}

# Parse command line arguments
case "${1:-all}" in
    "postgres")
        start_services "postgres" "PostgreSQL Database"
        ;;
    "curation")
        start_services "postgres curation" "PostgreSQL + Curation Service (Rule-based)"
        ;;
    "full")
        start_services "" "All Services (PostgreSQL + Curation + Ollama LLM)"
        ;;
    "all")
        start_services "" "All Services (PostgreSQL + Curation + Ollama LLM)"
        ;;
    *)
        echo "Usage: $0 [postgres|curation|full|all]"
        echo ""
        echo "Options:"
        echo "  postgres  - Start only PostgreSQL database"
        echo "  curation  - Start PostgreSQL + Curation service (rule-based only)"
        echo "  full      - Start all services including LLM"
        echo "  all       - Start all services (default)"
        exit 1
        ;;
esac

echo ""
echo "🌐 Service URLs:"
echo "   - Curation API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Health Check: http://localhost:8000/health"
echo "   - Ollama LLM: http://localhost:11434 (if started)"
echo ""

echo "📋 Useful Commands:"
echo "   - View logs: docker compose logs -f [service_name]"
echo "   - Stop services: docker compose down"
echo "   - Test curation: python curation-service/test_service.py"
echo "   - Run examples: python curation-service/example_usage.py"
echo ""

echo "🎉 Services are ready!"
