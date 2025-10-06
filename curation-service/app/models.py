"""
Pydantic models for the curation service API.
"""
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime


class Location(BaseModel):
    """Location information for business profile."""
    city: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    postcode: Optional[str] = None


class Profile(BaseModel):
    """Business profile for product curation."""
    tier: Optional[str] = None
    location: Optional[Location] = None
    venueType: str
    cuisineStyle: Optional[str] = None
    budgetBand: Optional[str] = Field(None, pattern="^(low|mid|premium)$")
    
    # Allow additional fields for dynamic questionnaire responses
    class Config:
        extra = "allow"


class Product(BaseModel):
    """Product model for internal processing."""
    id: str
    sku: Optional[str] = None
    name: str
    product_web_description: Optional[str] = None
    supplier: Optional[str] = None
    brand: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    visibility: Optional[str] = None
    category_level_1: Optional[str] = None
    category_level_2: Optional[str] = None
    category_level_3: Optional[str] = None
    category_level_4: Optional[str] = None
    sold_at_cairns: Optional[int] = None
    sold_at_brisbane: Optional[int] = None
    sold_at_adelaide: Optional[int] = None
    sold_at_melbourne: Optional[int] = None
    sold_at_sydney: Optional[int] = None
    tags: Optional[List[str]] = None
    origin: Optional[str] = None
    supplier_tier: Optional[str] = None
    
    # Computed fields
    is_bundle: bool = False
    locality_score: float = 0.0
    category_fitness: float = 0.0
    supplier_boost: float = 0.0
    composite_score: float = 0.0


class CurateRequest(BaseModel):
    """Request model for product curation."""
    profile: Profile
    maxProducts: Optional[int] = Field(default=100, ge=1, le=500)


class CurateResponse(BaseModel):
    """Response model for product curation."""
    curatedProductIds: List[str]  # Keep for backward compatibility
    curatedProducts: List[Product]  # New field with complete products
    reasoning: List[str]
    confidence: float = Field(ge=0.0, le=1.0)
    platinumSupplierProducts: List[str] = Field(default_factory=list)  # Keep for backward compatibility
    platinumProducts: List[Product] = Field(default_factory=list)  # New field with complete products
    bundledPacks: List[str] = Field(default_factory=list)  # Keep for backward compatibility
    bundledProducts: List[Product] = Field(default_factory=list)  # New field with complete products
    localFavorites: List[str] = Field(default_factory=list)  # Keep for backward compatibility
    localFavoriteProducts: List[Product] = Field(default_factory=list)  # New field with complete products
    businessInsights: List[str] = Field(default_factory=list)
    nextSteps: List[str] = Field(default_factory=list)
    generatedAt: datetime


class LLMRequest(BaseModel):
    """Request model for LLM finalization."""
    profile: Profile
    candidates: List[Dict[str, Any]]
    maxProducts: int


class LLMResponse(BaseModel):
    """Response model from LLM."""
    curatedProductIds: List[str]
    reasoning: List[str]
    confidence: float
    platinumSupplierProducts: List[str]
    bundledPacks: List[str]
    localFavorites: List[str]
    businessInsights: List[str]
    nextSteps: List[str]
