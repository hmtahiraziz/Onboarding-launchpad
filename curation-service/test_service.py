#!/usr/bin/env python3
"""
Test script for the curation service.
"""
import requests
import json
import time


def test_health():
    """Test health endpoint."""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Status: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")


def test_stats():
    """Test stats endpoint."""
    try:
        response = requests.get("http://localhost:8000/stats")
        if response.status_code == 200:
            print("✅ Stats endpoint passed")
            stats = response.json()
            print(f"   Products loaded: {stats['products']['total']}")
            print(f"   Visible products: {stats['products']['visible']}")
            print(f"   LLM enabled: {stats['config']['llm_enabled']}")
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")


def test_curation():
    """Test curation endpoint."""
    test_profile = {
        "tier": "bronze",
        "location": {
            "city": "Sydney",
            "state": "NSW",
            "address": "123 Test St",
            "country": "Australia",
            "postcode": "2000"
        },
        "venueType": "restaurant",
        "cuisineStyle": "fine dining"
    }
    
    test_request = {
        "profile": test_profile,
        "maxProducts": 10
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/curate",
            json=test_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Curation endpoint passed")
            result = response.json()
            print(f"   Curated products: {len(result['curatedProductIds'])}")
            print(f"   Confidence: {result['confidence']}")
            print(f"   Reasoning: {len(result['reasoning'])} items")
            print(f"   Generated at: {result['generatedAt']}")
        else:
            print(f"❌ Curation endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Curation endpoint error: {e}")


def main():
    """Run all tests."""
    print("🧪 Testing Curation Service")
    print("=" * 40)
    
    # Wait a moment for service to be ready
    print("⏳ Waiting for service to be ready...")
    time.sleep(2)
    
    test_health()
    print()
    
    test_stats()
    print()
    
    test_curation()
    print()
    
    print("🏁 Testing complete!")


if __name__ == "__main__":
    main()
