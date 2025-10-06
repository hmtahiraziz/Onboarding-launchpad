"""
Rule-based scoring system for product curation.
"""
from typing import List, Dict, Any, Set, Tuple
from app.models import Product, Profile


class ProductScorer:
    """Rule-based product scoring and selection."""
    
    def __init__(self):
        # Category fitness weights by venue type
        self.venue_weights = {
            "restaurant": {
                "wine": 1.0,
                "champagne": 0.8,
                "sparkling": 0.8,
                "spirits": 0.3,
                "beer": 0.2,
                "default": 0.5
            },
            "fine dining": {
                "wine": 1.0,
                "champagne": 1.0,  # Extra boost for fine dining
                "sparkling": 0.9,
                "spirits": 0.4,
                "beer": 0.1,
                "default": 0.6
            },
            "bistro": {
                "wine": 0.9,
                "champagne": 0.6,
                "sparkling": 0.7,
                "spirits": 0.4,
                "beer": 0.3,
                "default": 0.5
            },
            "bar": {
                "wine": 0.6,
                "champagne": 0.4,
                "sparkling": 0.5,
                "spirits": 0.9,
                "beer": 0.8,
                "default": 0.7
            },
            "cafe": {
                "wine": 0.3,
                "champagne": 0.2,
                "sparkling": 0.3,
                "spirits": 0.2,
                "beer": 0.4,
                "default": 0.4
            }
        }
        
        # Supplier tier weights
        self.supplier_weights = {
            "platinum": 1.0,
            "gold": 0.8,
            "silver": 0.6,
            "bronze": 0.4,
            "default": 0.5
        }
        
        # Bundle detection keywords
        self.bundle_keywords = [
            "pack", "bundle", "combo", "set", "collection",
            "starter", "sampler", "mixed", "variety", "assortment"
        ]
    
    def score_products(self, products: List[Product], profile: Profile) -> List[Product]:
        """
        Score and rank products based on business profile.
        
        Args:
            products: List of products to score
            profile: Business profile for scoring
            
        Returns:
            List of products sorted by composite score (highest first)
        """
        # Filter visible products first
        visible_products = [p for p in products if p.visibility == "4"]
        
        # Score each product
        for product in visible_products:
            product.locality_score = self._calculate_locality_score(product, profile)
            product.category_fitness = self._calculate_category_fitness(product, profile)
            product.supplier_boost = self._calculate_supplier_boost(product)
            product.composite_score = self._calculate_composite_score(product)
        
        # Sort by composite score, then by supplier tier, then by supplier name
        scored_products = sorted(
            visible_products, 
            key=lambda p: (
                p.composite_score,  # Primary: composite score (descending)
                self.supplier_weights.get(p.supplier_tier or "default", 0),  # Secondary: supplier tier (descending)
                p.supplier or ""  # Tertiary: supplier name (ascending for consistency)
            ), 
            reverse=True
        )
        
        return scored_products
    
    def select_candidates(self, scored_products: List[Product], top_k: int = 250) -> List[Product]:
        """
        Select top-K candidates with diversity constraints.
        
        Args:
            scored_products: Products sorted by score
            top_k: Number of candidates to select
            
        Returns:
            List of diverse candidate products
        """
        candidates = []
        seen_combinations: Set[Tuple[str, str]] = set()
        
        for product in scored_products:
            if len(candidates) >= top_k:
                break
                
            # Create diversity key (brand, category_level_1)
            brand = product.brand or "unknown"
            category = product.category_level_1 or "unknown"
            diversity_key = (brand.lower(), category.lower())
            
            # Apply diversity constraint (max 3 per brand-category combination)
            count = sum(1 for b, c in seen_combinations if b == brand.lower() and c == category.lower())
            if count < 3:
                candidates.append(product)
                seen_combinations.add(diversity_key)
        
        return candidates
    
    def _get_location_from_profile(self, profile: Profile) -> Dict[str, str]:
        """Extract location information from profile (handles both nested and flat structures)."""
        location = {}
        
        # Check if location is nested
        if hasattr(profile, 'location') and profile.location:
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

    def _calculate_locality_score(self, product: Product, profile: Profile) -> float:
        """Calculate locality score based on location preferences."""
        score = 0.0
        location = self._get_location_from_profile(profile)
        
        # City availability boost
        if location.get('city'):
            city_lower = location['city'].lower()
            if city_lower == "sydney" and product.sold_at_sydney == 1:
                score += 0.3
            elif city_lower == "melbourne" and product.sold_at_melbourne == 1:
                score += 0.3
            elif city_lower == "brisbane" and product.sold_at_brisbane == 1:
                score += 0.3
            elif city_lower == "adelaide" and product.sold_at_adelaide == 1:
                score += 0.3
            elif city_lower == "cairns" and product.sold_at_cairns == 1:
                score += 0.3
        
        # Regional/country match boost
        if location.get('state') and product.region:
            if location['state'].lower() in product.region.lower():
                score += 0.2
        
        if location.get('country') and product.country:
            if location['country'].lower() in product.country.lower():
                score += 0.2
        
        # Origin match boost
        if product.origin and location.get('country'):
            if location['country'].lower() in product.origin.lower():
                score += 0.1
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _calculate_category_fitness(self, product: Product, profile: Profile) -> float:
        """Calculate category fitness based on venue type and cuisine style."""
        venue_type = profile.venueType.lower()
        cuisine_style = (profile.cuisineStyle or "").lower()
        
        # Get base weights for venue type
        weights = self.venue_weights.get(venue_type, self.venue_weights["restaurant"])
        
        # Determine product category
        category = self._extract_category(product)
        base_weight = weights.get(category, weights["default"])
        
        # Fine dining champagne boost
        if venue_type == "fine dining" and cuisine_style == "fine dining":
            if category in ["champagne", "sparkling"]:
                base_weight += 0.2
        
        # Bundle boost
        if product.is_bundle:
            base_weight += 0.1
        
        return min(base_weight, 1.0)  # Cap at 1.0
    
    def _calculate_supplier_boost(self, product: Product) -> float:
        """Calculate supplier tier boost."""
        if not product.supplier_tier:
            return self.supplier_weights["default"]
        
        tier = product.supplier_tier.lower()
        return self.supplier_weights.get(tier, self.supplier_weights["default"])
    
    def _calculate_composite_score(self, product: Product) -> float:
        """Calculate final composite score."""
        # Weighted combination of all factors
        locality_weight = 0.3
        category_weight = 0.4
        supplier_weight = 0.2
        bundle_weight = 0.1
        
        score = (
            locality_weight * product.locality_score +
            category_weight * product.category_fitness +
            supplier_weight * product.supplier_boost +
            bundle_weight * (0.1 if product.is_bundle else 0.0)
        )
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _extract_category(self, product: Product) -> str:
        """Extract primary category from product."""
        # Try category levels in order
        for level in [product.category_level_1, product.category_level_2, product.category_level_3]:
            if level:
                category = level.lower()
                # Map to standard categories
                if "wine" in category:
                    return "wine"
                elif "champagne" in category:
                    return "champagne"
                elif "sparkling" in category:
                    return "sparkling"
                elif "spirit" in category:
                    return "spirits"
                elif "beer" in category:
                    return "beer"
                elif "liquor" in category:
                    return "spirits"
        
        return "default"
    
    def create_compact_candidates(self, candidates: List[Product]) -> List[Dict[str, Any]]:
        """
        Create compact representation of candidates for LLM processing.
        
        Args:
            candidates: List of candidate products
            
        Returns:
            List of compact product dictionaries
        """
        compact = []
        for product in candidates:
            compact_product = {
                "id": product.id,
                "sku": product.sku or product.id,
                "name": product.name,
                "category_level_1": product.category_level_1,
                "category_level_2": product.category_level_2,
                "category_level_3": product.category_level_3,
                "category_level_4": product.category_level_4,
                "brand": product.brand,
                "supplier": product.supplier,
                "supplier_tier": product.supplier_tier,
                "origin": product.origin,
                "region": product.region,
                "country": product.country,
                "tags": product.tags or [],
                "is_bundle": product.is_bundle,
                "composite_score": round(product.composite_score, 3),
                "locality_score": round(product.locality_score, 3),
                "category_fitness": round(product.category_fitness, 3),
                "supplier_boost": round(product.supplier_boost, 3)
            }
            compact.append(compact_product)
        
        return compact
