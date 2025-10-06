export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  supplier: Supplier;
  pricing: ProductPricing;
  inventory: Inventory;
  specifications: ProductSpecifications;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ProductCategory {
  SPIRITS = 'spirits',
  WINE = 'wine',
  BEER = 'beer',
  CHAMPAGNE = 'champagne',
  COCKTAIL_INGREDIENTS = 'cocktail_ingredients',
  NON_ALCOHOLIC = 'non_alcoholic',
  BAR_EQUIPMENT = 'bar_equipment'
}

export interface Supplier {
  id: string;
  name: string;
  tier: SupplierTier;
  contactInfo: ContactInfo;
  isActive: boolean;
}

export enum SupplierTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface ProductPricing {
  basePrice: number;
  currency: string;
  volumeDiscounts: VolumeDiscount[];
  tierPricing: TierPricing[];
}

export interface VolumeDiscount {
  minQuantity: number;
  discountPercentage: number;
}

export interface TierPricing {
  customerTier: string;
  priceMultiplier: number;
}

export interface Inventory {
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  isInStock: boolean;
}

export interface ProductSpecifications {
  volume: number;
  alcoholContent?: number;
  origin?: string;
  vintage?: number;
  packaging: string;
  shelfLife?: number;
}

export interface SearchProductsRequest {
  query?: string;
  category?: ProductCategory;
  supplierTier?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}
