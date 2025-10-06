import { Product, ProductCategory, SearchProductsRequest } from '../entities/Product';

export interface IProductRepository {
  getProductById(id: string): Promise<Product>;
  searchProducts(request: SearchProductsRequest): Promise<{
    data: Product[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }>;
  getProductsByCategory(category: ProductCategory): Promise<Product[]>;
  getRecommendedProducts(customerId: string, limit?: number): Promise<Product[]>;
  getTrendingProducts(limit?: number): Promise<Product[]>;
  getCuratedProducts(customerId: string): Promise<Product[]>;
}
