"""
LLM client for OpenAI-compatible API finalization.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.models import Profile, LLMRequest, LLMResponse

logger = logging.getLogger(__name__)


class LLMClient:
    """Client for OpenAI-compatible LLM API."""
    
    def __init__(self):
        self.base_url = os.getenv("LLM_BASE_URL", "http://ollama:11434/v1")
        self.api_key = os.getenv("LLM_API_KEY", "ollama")
        self.model = os.getenv("LLM_MODEL", "llama3.1")
        self.temperature = float(os.getenv("LLM_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "1800"))
        
        # HTTP client with timeout
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def finalize_candidates(
        self, 
        profile: Profile, 
        candidates: List[Dict[str, Any]], 
        max_products: int
    ) -> Optional[LLMResponse]:
        """
        Finalize product candidates using LLM.
        
        Args:
            profile: Business profile
            candidates: List of candidate products
            max_products: Maximum number of products to return
            
        Returns:
            LLM response or None if failed
        """
        try:
            # Create compact request
            request_data = LLMRequest(
                profile=profile,
                candidates=candidates,
                maxProducts=max_products
            )
            
            # Generate prompt
            prompt = self._generate_prompt(request_data)
            
            # Call LLM API
            response = await self._call_llm_api(prompt)
            
            if response:
                return self._parse_llm_response(response, max_products)
            else:
                return None
                
        except Exception as e:
            logger.error(f"LLM finalization failed: {e}")
            return None
    
    def _generate_prompt(self, request: LLMRequest) -> str:
        """Generate prompt for LLM."""
        profile = request.profile
        
        # Extract location information (handles both nested and flat structures)
        location = {}
        if hasattr(profile, 'location') and profile.location:
            location = {
                "city": profile.location.city,
                "state": profile.location.state,
                "country": profile.location.country
            }
        else:
            location = {
                "city": getattr(profile, 'city', None),
                "state": getattr(profile, 'state', None),
                "country": getattr(profile, 'country', None)
            }
        
        # Format profile
        profile_text = f"""
Business Profile:
- Venue Type: {profile.venueType}
- Cuisine Style: {profile.cuisineStyle or 'Not specified'}
- Tier: {profile.tier or 'Not specified'}
- Location: {location.get('city', 'Not specified')}, {location.get('state', 'Not specified')}, {location.get('country', 'Not specified')}
- Budget Band: {profile.budgetBand or 'Not specified'}
"""
        
        # Format candidates (limit to top 50 for token efficiency)
        candidates_text = "Product Candidates:\n"
        for i, candidate in enumerate(request.candidates[:50]):
            candidates_text += f"""
{i+1}. {candidate['name']} (SKU: {candidate['sku']})
   - Category: {candidate['category_level_1']} / {candidate['category_level_2']}
   - Brand: {candidate['brand']}
   - Supplier: {candidate['supplier']} (Tier: {candidate['supplier_tier'] or 'Unknown'})
   - Origin: {candidate['origin'] or 'Unknown'}
   - Bundle: {'Yes' if candidate['is_bundle'] else 'No'}
   - Score: {candidate['composite_score']}
"""
        
        prompt = f"""
You are a product curation expert for a liquor wholesale business. Your task is to curate the best products from the given candidates based on the business profile.

{profile_text}

{candidates_text}

Please return a JSON response with the following structure:
{{
    "curatedProductIds": ["sku1", "sku2", ...],  // Array of product SKUs (max {request.maxProducts})
    "reasoning": ["reason1", "reason2", ...],  // Array of reasoning strings
    "confidence": 0.85,  // Confidence score (0.0-1.0)
    "platinumSupplierProducts": ["sku1", "sku2", ...],  // Platinum supplier products
    "bundledPacks": ["sku1", "sku2", ...],  // Bundle products
    "localFavorites": ["sku1", "sku2", ...],  // Local/regional favorites
    "businessInsights": ["insight1", "insight2", ...],  // Business insights
    "nextSteps": ["step1", "step2", ...]  // Next steps for the business
}}

Guidelines:
1. Select products that best match the venue type and cuisine style
2. Prioritize products available in the specified location
3. Include a good mix of categories appropriate for the venue
4. Consider supplier tiers (platinum > gold > silver > bronze)
5. Include some bundle products for variety
6. Ensure the selection is diverse and not dominated by one brand
7. Keep reasoning concise and business-focused
8. Provide actionable insights and next steps

Return only the JSON response, no additional text.
"""
        
        return prompt
    
    async def _call_llm_api(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call the LLM API."""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
                "stream": False
            }
            
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                return data
            else:
                logger.error(f"LLM API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return None
    
    def _parse_llm_response(self, response: Dict[str, Any], max_products: int) -> Optional[LLMResponse]:
        """Parse LLM response and validate."""
        try:
            # Extract content from response
            if "choices" not in response or not response["choices"]:
                logger.error("No choices in LLM response")
                return None
            
            content = response["choices"][0].get("message", {}).get("content", "")
            if not content:
                logger.error("Empty content in LLM response")
                return None
            
            # Parse JSON
            try:
                data = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in LLM response: {e}")
                return None
            
            # Validate required fields
            required_fields = ["curatedProductIds", "reasoning", "confidence"]
            for field in required_fields:
                if field not in data:
                    logger.error(f"Missing required field: {field}")
                    return None
            
            # Validate types
            if not isinstance(data["curatedProductIds"], list):
                logger.error("curatedProductIds must be a list")
                return None
            
            if not isinstance(data["reasoning"], list):
                logger.error("reasoning must be a list")
                return None
            
            if not isinstance(data["confidence"], (int, float)):
                logger.error("confidence must be a number")
                return None
            
            # Ensure confidence is in valid range
            confidence = float(data["confidence"])
            if confidence < 0.0 or confidence > 1.0:
                confidence = max(0.0, min(1.0, confidence))
            
            # Limit curated products to max_products
            curated_ids = data["curatedProductIds"][:max_products]
            
            # Create response object
            llm_response = LLMResponse(
                curatedProductIds=curated_ids,
                reasoning=data["reasoning"],
                confidence=confidence,
                platinumSupplierProducts=data.get("platinumSupplierProducts", []),
                bundledPacks=data.get("bundledPacks", []),
                localFavorites=data.get("localFavorites", []),
                businessInsights=data.get("businessInsights", []),
                nextSteps=data.get("nextSteps", [])
            )
            
            logger.info(f"LLM finalization successful: {len(curated_ids)} products selected")
            return llm_response
            
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
