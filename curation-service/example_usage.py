#!/usr/bin/env python3
"""
Example usage of the curation service.
"""
import requests
import json


def example_restaurant_curation():
    """Example: Curate products for a fine dining restaurant in Sydney."""
    profile = {
        "tier": "bronze",
        "location": {
            "city": "Sydney",
            "state": "NSW",
            "address": "123 Harbour St",
            "country": "Australia",
            "postcode": "2000"
        },
        "venueType": "restaurant",
        "cuisineStyle": "fine dining",
        "budgetBand": "mid"
    }
    
    request_data = {
        "profile": profile,
        "maxProducts": 50
    }
    
    print("🍷 Curating products for fine dining restaurant in Sydney...")
    print(f"Profile: {json.dumps(profile, indent=2)}")
    print()
    
    try:
        response = requests.post(
            "http://localhost:8000/curate",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Curation successful!")
            print(f"📊 Results:")
            print(f"   - Curated products: {len(result['curatedProductIds'])}")
            print(f"   - Confidence: {result['confidence']:.2f}")
            print(f"   - Platinum suppliers: {len(result['platinumSupplierProducts'])}")
            print(f"   - Bundled packs: {len(result['bundledPacks'])}")
            print(f"   - Local favorites: {len(result['localFavorites'])}")
            print()
            
            print("💭 Reasoning:")
            for reason in result['reasoning']:
                print(f"   - {reason}")
            print()
            
            print("💡 Business Insights:")
            for insight in result['businessInsights']:
                print(f"   - {insight}")
            print()
            
            print("📋 Next Steps:")
            for step in result['nextSteps']:
                print(f"   - {step}")
            print()
            
            print(f"🕒 Generated at: {result['generatedAt']}")
            
        else:
            print(f"❌ Curation failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


def example_bar_curation():
    """Example: Curate products for a bar in Melbourne."""
    profile = {
        "tier": "silver",
        "location": {
            "city": "Melbourne",
            "state": "VIC",
            "address": "456 Collins St",
            "country": "Australia",
            "postcode": "3000"
        },
        "venueType": "bar",
        "cuisineStyle": "cocktail bar",
        "budgetBand": "premium"
    }
    
    request_data = {
        "profile": profile,
        "maxProducts": 30
    }
    
    print("🍸 Curating products for cocktail bar in Melbourne...")
    print(f"Profile: {json.dumps(profile, indent=2)}")
    print()
    
    try:
        response = requests.post(
            "http://localhost:8000/curate",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Curation successful!")
            print(f"📊 Results:")
            print(f"   - Curated products: {len(result['curatedProductIds'])}")
            print(f"   - Confidence: {result['confidence']:.2f}")
            print(f"   - Platinum suppliers: {len(result['platinumSupplierProducts'])}")
            print(f"   - Bundled packs: {len(result['bundledPacks'])}")
            print(f"   - Local favorites: {len(result['localFavorites'])}")
            print()
            
            print("💭 Reasoning:")
            for reason in result['reasoning']:
                print(f"   - {reason}")
            print()
            
        else:
            print(f"❌ Curation failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Run example curations."""
    print("🚀 Curation Service Examples")
    print("=" * 50)
    print()
    
    # Test health first
    try:
        health_response = requests.get("http://localhost:8000/health")
        if health_response.status_code != 200:
            print("❌ Service not available. Please start the service first.")
            print("   Run: docker compose up -d")
            return
    except:
        print("❌ Service not available. Please start the service first.")
        print("   Run: docker compose up -d")
        return
    
    print("✅ Service is running!")
    print()
    
    # Example 1: Fine dining restaurant
    example_restaurant_curation()
    print()
    print("-" * 50)
    print()
    
    # Example 2: Cocktail bar
    example_bar_curation()
    print()
    print("🏁 Examples complete!")


if __name__ == "__main__":
    main()
