#!/usr/bin/env python3
"""
Test script for the recommended products API with the new curation service integration.
"""
import requests
import json
import time


def test_recommended_products_api():
    """Test the recommended products API with the specified customer ID."""
    customer_id = "b03d74bc-89b2-48e3-8edc-9a66a8d3f03c"
    
    # Test URLs
    backend_url = "http://localhost:3000"
    curation_url = "http://localhost:8000"
    
    print("🧪 Testing Recommended Products API Integration")
    print("=" * 60)
    
    # First, check if curation service is running
    print("1. Checking Curation Service...")
    try:
        curation_response = requests.get(f"{curation_url}/health", timeout=5)
        if curation_response.status_code == 200:
            print("   ✅ Curation service is running")
            curation_data = curation_response.json()
            print(f"   📊 Products loaded: {curation_data.get('products_loaded', 'Unknown')}")
        else:
            print(f"   ❌ Curation service health check failed: {curation_response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Curation service not available: {e}")
        print("   💡 Please start the curation service first:")
        print("      cd /home/majid/Workspace/hackathon/curation-service")
        print("      python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
        return
    
    print()
    
    # Check if backend is running
    print("2. Checking Backend Service...")
    try:
        backend_response = requests.get(f"{backend_url}/health", timeout=5)
        if backend_response.status_code == 200:
            print("   ✅ Backend service is running")
        else:
            print(f"   ❌ Backend service health check failed: {backend_response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Backend service not available: {e}")
        print("   💡 Please start the backend first:")
        print("      cd /home/majid/Workspace/hackathon/backend")
        print("      npm run dev")
        return
    
    print()
    
    # Test the recommended products API
    print("3. Testing Recommended Products API...")
    try:
        api_url = f"{backend_url}/api/products/recommended/{customer_id}"
        params = {
            "limit": 10,
            "useAI": "true"
        }
        
        print(f"   🔗 Calling: {api_url}")
        print(f"   📋 Params: {params}")
        
        response = requests.get(api_url, params=params, timeout=30)
        
        if response.status_code == 200:
            print("   ✅ API call successful!")
            data = response.json()
            
            print(f"   📊 Response data:")
            print(f"      - Success: {data.get('success', 'Unknown')}")
            
            if 'data' in data:
                curated_skus = data['data'].get('curatedSkus', [])
                curation_info = data['data'].get('curationInfo', {})
                
                print(f"      - Curated SKUs returned: {len(curated_skus)}")
                print(f"      - Reasoning: {len(curation_info.get('reasoning', []))} items")
                print(f"      - Confidence: {curation_info.get('confidence', 'Unknown')}")
                print(f"      - Platinum SKUs: {len(curation_info.get('platinumSkus', []))}")
                print(f"      - Bundled SKUs: {len(curation_info.get('bundledSkus', []))}")
                print(f"      - Local favorites SKUs: {len(curation_info.get('localFavoritesSkus', []))}")
                
                if curated_skus:
                    print(f"   🏷️  Curated SKUs: {curated_skus[:5]}{'...' if len(curated_skus) > 5 else ''}")
                
                if curation_info.get('platinumSkus'):
                    print(f"   💎 Platinum SKUs: {curation_info['platinumSkus'][:3]}{'...' if len(curation_info['platinumSkus']) > 3 else ''}")
                
                if curation_info.get('bundledSkus'):
                    print(f"   📦 Bundled SKUs: {curation_info['bundledSkus'][:3]}{'...' if len(curation_info['bundledSkus']) > 3 else ''}")
                
                if curation_info.get('reasoning'):
                    print(f"   💭 Reasoning:")
                    for reason in curation_info['reasoning'][:3]:
                        print(f"      - {reason}")
            
        else:
            print(f"   ❌ API call failed: {response.status_code}")
            print(f"   📄 Error response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ API test error: {e}")
    
    print()
    print("🏁 Test complete!")


def test_direct_curation_service():
    """Test the curation service directly."""
    print("4. Testing Curation Service Directly...")
    
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
    
    try:
        response = requests.post(
            "http://localhost:8000/curate",
            json={"profile": test_profile, "maxProducts": 5},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            print("   ✅ Direct curation service test successful!")
            result = response.json()
            print(f"   📊 Curated products: {len(result.get('curatedProductIds', []))}")
            print(f"   🎯 Sample SKUs: {result.get('curatedProductIds', [])[:3]}")
        else:
            print(f"   ❌ Direct curation service test failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Direct curation service test error: {e}")


if __name__ == "__main__":
    test_recommended_products_api()
    print()
    test_direct_curation_service()
