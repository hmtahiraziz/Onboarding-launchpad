#!/usr/bin/env python3
"""
Verification script for the consolidated Paramount Launchpad setup.
"""
import requests
import time
import subprocess
import sys


def check_docker_compose():
    """Check if Docker Compose is available."""
    try:
        result = subprocess.run(['docker', 'compose', 'ps'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker Compose is available")
            return True
        else:
            print("❌ Docker Compose not working properly")
            return False
    except FileNotFoundError:
        print("❌ Docker Compose not found")
        return False


def check_services():
    """Check if services are running."""
    services = {
        'postgres': {'port': 5432, 'name': 'PostgreSQL'},
        'curation': {'port': 8000, 'name': 'Curation Service'},
        'ollama': {'port': 11434, 'name': 'Ollama LLM'}
    }
    
    running_services = []
    
    for service, config in services.items():
        try:
            response = requests.get(f"http://localhost:{config['port']}", timeout=2)
            running_services.append(service)
            print(f"✅ {config['name']} is running on port {config['port']}")
        except requests.exceptions.RequestException:
            print(f"⚠️  {config['name']} not responding on port {config['port']}")
    
    return running_services


def test_curation_api():
    """Test the curation API."""
    try:
        # Test health endpoint
        health_response = requests.get("http://localhost:8000/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Curation service health check passed")
            health_data = health_response.json()
            print(f"   Products loaded: {health_data.get('products_loaded', 'Unknown')}")
            print(f"   LLM enabled: {health_data.get('llm_enabled', 'Unknown')}")
        else:
            print(f"❌ Curation service health check failed: {health_response.status_code}")
            return False
        
        # Test stats endpoint
        stats_response = requests.get("http://localhost:8000/stats", timeout=5)
        if stats_response.status_code == 200:
            print("✅ Curation service stats endpoint working")
            stats_data = stats_response.json()
            print(f"   Total products: {stats_data['products']['total']}")
            print(f"   Visible products: {stats_data['products']['visible']}")
        else:
            print(f"❌ Curation service stats failed: {stats_response.status_code}")
            return False
        
        # Test curation endpoint
        test_profile = {
            "tier": "bronze",
            "location": {
                "city": "Sydney",
                "state": "NSW",
                "country": "Australia"
            },
            "venueType": "restaurant",
            "cuisineStyle": "fine dining"
        }
        
        curation_response = requests.post(
            "http://localhost:8000/curate",
            json={"profile": test_profile, "maxProducts": 5},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if curation_response.status_code == 200:
            print("✅ Curation API test passed")
            result = curation_response.json()
            print(f"   Curated products: {len(result['curatedProductIds'])}")
            print(f"   Confidence: {result['confidence']}")
            return True
        else:
            print(f"❌ Curation API test failed: {curation_response.status_code}")
            print(f"   Error: {curation_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Curation API test error: {e}")
        return False


def main():
    """Run verification checks."""
    print("🔍 Paramount Launchpad - Setup Verification")
    print("=" * 50)
    print()
    
    # Check Docker Compose
    if not check_docker_compose():
        print("\n❌ Please install Docker and Docker Compose first")
        sys.exit(1)
    
    print()
    
    # Check running services
    print("🔍 Checking running services...")
    running_services = check_services()
    print()
    
    if not running_services:
        print("❌ No services are running. Please start them first:")
        print("   docker compose up -d")
        sys.exit(1)
    
    # Test curation service if it's running
    if 'curation' in running_services:
        print("🧪 Testing Curation Service...")
        if test_curation_api():
            print("✅ Curation service is working correctly!")
        else:
            print("❌ Curation service has issues")
            sys.exit(1)
    else:
        print("⚠️  Curation service not running - skipping API tests")
    
    print()
    print("🎉 Setup verification complete!")
    print()
    print("📋 Next steps:")
    print("   - Backend: cd backend && npm install && npm run dev")
    print("   - Frontend: cd frontend && npm install && npm run dev")
    print("   - Test curation: python curation-service/example_usage.py")
    print("   - View API docs: http://localhost:8000/docs")


if __name__ == "__main__":
    main()
