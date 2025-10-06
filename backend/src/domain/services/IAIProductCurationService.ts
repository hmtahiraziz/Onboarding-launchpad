import { Product } from '../entities/Product';
import { Customer } from '../entities/Customer';

export interface AIProductCurationRequest {
  customer: Customer;
  maxProducts?: number;
}

export interface AIProductCurationResponse {
  curatedProducts: Product[]; // Complete product objects from curation service
  curatedSkus: string[]; // Keep for backward compatibility
  reasoning: string[];
  confidence: number;
  platinumSupplierProducts: Product[]; // Complete platinum supplier products
  platinumSkus: string[]; // Keep for backward compatibility
  bundledPacks: Product[]; // Complete bundled pack products
  bundledSkus: string[]; // Keep for backward compatibility
  localFavorites: Product[]; // Complete local favorite products
  localFavoritesSkus: string[]; // Keep for backward compatibility
  generatedAt: Date;
  businessInsights?: string[];
  nextSteps?: string[];
  confidenceScore?: number;
}


export interface IAIProductCurationService {
  /**
   * Uses AI to curate a personalized product set for a customer based on business profile
   * Delegates to the external curation service for intelligent product recommendations
   */
  curateProducts(request: AIProductCurationRequest): Promise<AIProductCurationResponse>;
}
