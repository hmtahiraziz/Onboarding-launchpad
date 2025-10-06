import { Product, ProductCategory, SupplierTier } from '../entities/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCategory(category: ProductCategory): Promise<Product[]>;
  findBySupplier(supplierId: string): Promise<Product[]>;
  findBySupplierTier(tier: SupplierTier): Promise<Product[]>;
  findActiveProducts(): Promise<Product[]>;
  findInStockProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  findRecommendedProducts(customerId: string, limit?: number): Promise<Product[]>;
  findTrendingProducts(limit?: number): Promise<Product[]>;
}
