import { Product, ProductCategory, SearchProductsRequest } from '@/domain/entities/Product';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { apiClient } from '../api/apiClient';

export class ProductRepository implements IProductRepository {
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response;
  }

  async searchProducts(request: SearchProductsRequest): Promise<{
    data: Product[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    const response = await apiClient.get<Product[]>('/products', request);
    return {
      data: response,
      pagination: {
        total: response.length,
        offset: 0,
        limit: request.limit || 20,
        hasMore: false
      }
    };
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/category/${category}`);
    return response;
  }

  async getRecommendedProducts(customerId: string, limit: number = 100, useAI: boolean = true): Promise<Product[]> {
    const url = `/products/recommended/${customerId}`;
    const params = { limit, useAI };
    console.log('ProductRepository: Calling API:', url, 'with params:', params);
    
    const response = await apiClient.get<{success: boolean, data: any}>(url, params);
    console.log('ProductRepository: API response:', response);
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch recommended products');
    }
    
    // Handle different response formats from AI vs rule-based recommendations
    if (response.data.products) {
      // Rule-based recommendations return products directly
      return response.data.products;
    } else if (response.data.curatedProducts) {
      // AI curation returns curatedProducts array
      console.log('AI curation returned products:', response.data.curatedProducts);
      return response.data.curatedProducts;
    } else if (response.data.curatedSkus) {
      // Fallback: AI curation returns SKUs only
      console.log('AI curation returned SKUs:', response.data.curatedSkus);
      return [];
    } else {
      throw new Error('Unexpected response format from recommendations API');
    }
  }

  async getTrendingProducts(limit: number = 20): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products/trending', { limit });
    return response;
  }

  async getCuratedProducts(customerId: string): Promise<Product[]> {
    // This would typically be called through the onboarding flow
    // For now, we'll use recommended products as a fallback
    return this.getRecommendedProducts(customerId);
  }
}
