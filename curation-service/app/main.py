"""
FastAPI main application for the curation service.
"""
import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app.models import (
    CurateRequest, CurateResponse, Profile, Product, 
    LLMRequest, LLMResponse
)
from app.loader import load_products, get_products_summary
from app.scoring import ProductScorer
from app.llm_client import LLMClient


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
PRODUCTS_JSON = os.getenv("PRODUCTS_JSON", "/app/data/products.json")
DEFAULT_MAX_PRODUCTS = int(os.getenv("DEFAULT_MAX_PRODUCTS", "100"))
TOP_K_PRESELECT = int(os.getenv("TOP_K_PRESELECT", "250"))
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

# Global variables
products: List[Product] = []
scorer = ProductScorer()
llm_client: Optional[LLMClient] = None

# Initialize FastAPI app
app = FastAPI(
    title="Product Curation Service",
    description="AI-powered product curation microservice for liquor wholesale",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize the service on startup."""
    global products, llm_client
    
    try:
        # Load products
        logger.info(f"Loading products from {PRODUCTS_JSON}")
        products = load_products(PRODUCTS_JSON)
        
        # Get summary statistics
        summary = get_products_summary(products)
        logger.info(f"Loaded {summary['total']} products ({summary['visible']} visible, {summary['bundles']} bundles)")
        
        # Initialize LLM client if enabled
        if USE_LLM:
            llm_client = LLMClient()
            logger.info("LLM client initialized")
        else:
            logger.info("LLM disabled - using rule-based scoring only")
        
        logger.info(f"Service initialized with TOP_K_PRESELECT={TOP_K_PRESELECT}, USE_LLM={USE_LLM}")
        
    except Exception as e:
        logger.error(f"Failed to initialize service: {e}")
        raise


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "products_loaded": len(products),
        "llm_enabled": USE_LLM,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/stats")
async def get_stats():
    """Get service statistics."""
    if not products:
        raise HTTPException(status_code=503, detail="Products not loaded")
    
    summary = get_products_summary(products)
    return {
        "products": summary,
        "config": {
            "top_k_preselect": TOP_K_PRESELECT,
            "default_max_products": DEFAULT_MAX_PRODUCTS,
            "llm_enabled": USE_LLM
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/curate", response_model=CurateResponse)
async def curate_products(request: CurateRequest):
    """
    Curate products based on business profile.
    
    Args:
        request: Curation request with profile and max products
        
    Returns:
        Curated product response with reasoning
    """
    if not products:
        raise HTTPException(status_code=503, detail="Products not loaded")
    
    try:
        # Use provided max products or default
        max_products = request.maxProducts or DEFAULT_MAX_PRODUCTS
        
        # Run rule-based scoring
        logger.info(f"Scoring products for profile: {request.profile.venueType}")
        scored_products = scorer.score_products(products, request.profile)
        
        # Select candidates
        candidates = scorer.select_candidates(scored_products, TOP_K_PRESELECT)
        logger.info(f"Selected {len(candidates)} candidates")
        
        # Prepare base response with complete products
        curated_products = candidates[:max_products]
        platinum_products = [p for p in candidates if p.supplier_tier == "platinum"][:10]
        bundled_products = [p for p in candidates if p.is_bundle][:10]
        local_favorite_products = _get_local_favorite_products(candidates, request.profile)[:10]
        
        response_data = {
            "curatedProductIds": [p.sku or p.id for p in curated_products],  # Keep for backward compatibility
            "curatedProducts": curated_products,  # New field with complete products
            "reasoning": _generate_rule_based_reasoning(request.profile, curated_products),
            "confidence": 0.8,  # High confidence for rule-based
            "platinumSupplierProducts": [p.sku or p.id for p in platinum_products],  # Keep for backward compatibility
            "platinumProducts": platinum_products,  # New field with complete products
            "bundledPacks": [p.sku or p.id for p in bundled_products],  # Keep for backward compatibility
            "bundledProducts": bundled_products,  # New field with complete products
            "localFavorites": [p.sku or p.id for p in local_favorite_products],  # Keep for backward compatibility
            "localFavoriteProducts": local_favorite_products,  # New field with complete products
            "businessInsights": _generate_business_insights(request.profile, candidates),
            "nextSteps": _generate_next_steps(request.profile),
            "generatedAt": datetime.utcnow()
        }
        
        # Apply LLM finalization if enabled
        if USE_LLM and llm_client:
            try:
                logger.info("Applying LLM finalization")
                llm_response = await llm_client.finalize_candidates(
                    request.profile, 
                    scorer.create_compact_candidates(candidates),
                    max_products
                )
                
                if llm_response:
                    # For LLM response, we need to map the SKUs back to full products
                    llm_curated_products = _map_skus_to_products(llm_response.curatedProductIds, candidates)
                    llm_platinum_products = _map_skus_to_products(llm_response.platinumSupplierProducts, candidates)
                    llm_bundled_products = _map_skus_to_products(llm_response.bundledPacks, candidates)
                    llm_local_products = _map_skus_to_products(llm_response.localFavorites, candidates)
                    
                    # Merge LLM response with base response
                    response_data.update({
                        "curatedProductIds": llm_response.curatedProductIds[:max_products],
                        "curatedProducts": llm_curated_products[:max_products],
                        "reasoning": llm_response.reasoning,
                        "confidence": llm_response.confidence,
                        "platinumSupplierProducts": llm_response.platinumSupplierProducts,
                        "platinumProducts": llm_platinum_products,
                        "bundledPacks": llm_response.bundledPacks,
                        "bundledProducts": llm_bundled_products,
                        "localFavorites": llm_response.localFavorites,
                        "localFavoriteProducts": llm_local_products,
                        "businessInsights": llm_response.businessInsights,
                        "nextSteps": llm_response.nextSteps
                    })
                    logger.info("LLM finalization completed successfully")
                else:
                    logger.warning("LLM finalization failed, using rule-based results")
                    
            except Exception as e:
                logger.error(f"LLM finalization error: {e}")
                logger.info("Falling back to rule-based results")
        
        return CurateResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Curation error: {e}")
        raise HTTPException(status_code=500, detail=f"Curation failed: {str(e)}")


def _get_location_from_profile(profile: Profile) -> Dict[str, str]:
    """Extract location information from profile (handles both nested and flat structures)."""
    location = {}
    
    # Check if location is nested
    if profile.location:
        location = {
            "city": profile.location.city,
            "state": profile.location.state,
            "country": profile.location.country,
            "address": profile.location.address,
            "postcode": profile.location.postcode
        }
    else:
        # Extract from flat profile structure
        location = {
            "city": getattr(profile, 'city', None),
            "state": getattr(profile, 'state', None),
            "country": getattr(profile, 'country', None),
            "address": getattr(profile, 'address', None),
            "postcode": getattr(profile, 'postcode', None)
        }
    
    return location


def _generate_rule_based_reasoning(profile: Profile, products: List[Product]) -> List[str]:
    """Generate reasoning for rule-based curation."""
    reasoning = []
    
    # Venue type reasoning
    reasoning.append(f"Curated for {profile.venueType} venue type")
    
    # Location reasoning
    location = _get_location_from_profile(profile)
    if location.get('city'):
        reasoning.append(f"Prioritized products available in {location['city']}")
    
    # Category reasoning
    venue_type = profile.venueType.lower()
    if venue_type in ["restaurant", "fine dining"]:
        reasoning.append("Emphasized wine and champagne selections for dining experience")
    elif venue_type == "bar":
        reasoning.append("Focused on spirits and beer for bar service")
    
    # Bundle reasoning
    bundle_count = sum(1 for p in products if p.is_bundle)
    if bundle_count > 0:
        reasoning.append(f"Included {bundle_count} curated bundles for variety")
    
    # Supplier reasoning
    platinum_count = sum(1 for p in products if p.supplier_tier == "platinum")
    if platinum_count > 0:
        reasoning.append(f"Featured {platinum_count} platinum supplier products")
    
    return reasoning


def _get_local_favorites(products: List[Product], profile: Profile) -> List[str]:
    """Get local favorite products based on location."""
    local_favorites = []
    location = _get_location_from_profile(profile)
    
    for product in products:
        if location.get('city'):
            city_lower = location['city'].lower()
            if (city_lower == "sydney" and product.sold_at_sydney == 1) or \
               (city_lower == "melbourne" and product.sold_at_melbourne == 1) or \
               (city_lower == "brisbane" and product.sold_at_brisbane == 1) or \
               (city_lower == "adelaide" and product.sold_at_adelaide == 1) or \
               (city_lower == "cairns" and product.sold_at_cairns == 1):
                local_favorites.append(product.sku or product.id)
    
    return local_favorites


def _get_local_favorite_products(products: List[Product], profile: Profile) -> List[Product]:
    """Get local favorite products as complete Product objects based on location."""
    local_favorites = []
    location = _get_location_from_profile(profile)
    
    for product in products:
        if location.get('city'):
            city_lower = location['city'].lower()
            if (city_lower == "sydney" and product.sold_at_sydney == 1) or \
               (city_lower == "melbourne" and product.sold_at_melbourne == 1) or \
               (city_lower == "brisbane" and product.sold_at_brisbane == 1) or \
               (city_lower == "adelaide" and product.sold_at_adelaide == 1) or \
               (city_lower == "cairns" and product.sold_at_cairns == 1):
                local_favorites.append(product)
    
    return local_favorites


def _map_skus_to_products(skus: List[str], candidates: List[Product]) -> List[Product]:
    """Map SKU IDs back to complete Product objects."""
    sku_to_product = {p.sku or p.id: p for p in candidates}
    return [sku_to_product[sku] for sku in skus if sku in sku_to_product]


def _generate_business_insights(profile: Profile, products: List[Product]) -> List[str]:
    """Generate business insights based on curation."""
    insights = []
    
    # Category distribution
    categories = {}
    for product in products:
        cat = product.category_level_1 or "Unknown"
        categories[cat] = categories.get(cat, 0) + 1
    
    top_category = max(categories.items(), key=lambda x: x[1]) if categories else ("Unknown", 0)
    insights.append(f"Top category: {top_category[0]} ({top_category[1]} products)")
    
    # Supplier diversity
    suppliers = set(p.supplier for p in products if p.supplier)
    insights.append(f"Products from {len(suppliers)} different suppliers")
    
    # Bundle ratio
    bundle_ratio = sum(1 for p in products if p.is_bundle) / len(products) if products else 0
    if bundle_ratio > 0.1:
        insights.append(f"High bundle ratio ({bundle_ratio:.1%}) - good for variety")
    
    return insights


def _generate_next_steps(profile: Profile) -> List[str]:
    """Generate next steps for the business."""
    steps = []
    
    steps.append("Review curated product list and select initial order")
    steps.append("Contact suppliers for pricing and availability")
    
    if profile.venueType.lower() in ["restaurant", "fine dining"]:
        steps.append("Consider wine pairing recommendations for your menu")
        steps.append("Plan staff training on product knowledge")
    
    if profile.tier == "bronze":
        steps.append("Explore upgrade opportunities to access premium products")
    
    steps.append("Set up regular reordering schedule")
    steps.append("Monitor customer preferences and adjust selections")
    
    return steps


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=os.getenv("UVICORN_HOST", "0.0.0.0"),
        port=int(os.getenv("UVICORN_PORT", "8000")),
        reload=False
    )
