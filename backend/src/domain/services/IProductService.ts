import { Product, ProductCategory } from '../entities/Product';

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

export interface IProductService {
  getProductById(id: string): Promise<Product>;
  searchProducts(request: SearchProductsRequest): Promise<Product[]>;
  getProductsByCategory(category: ProductCategory): Promise<Product[]>;
  getRecommendedProducts(customerId: string, limit?: number): Promise<Product[]>;
  getTrendingProducts(limit?: number): Promise<Product[]>;
  getCuratedProducts(customerId: string): Promise<Product[]>;
  updateProductInventory(productId: string, quantity: number): Promise<Product>;
  getProductPricing(productId: string, customerTier: string): Promise<{
    basePrice: number;
    tierPrice: number;
    volumeDiscounts: any[];
  }>;
}
