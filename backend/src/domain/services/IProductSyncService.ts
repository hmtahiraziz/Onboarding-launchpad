import { ParamountProduct, ProductAttributes } from '../entities/ParamountProduct';

export interface IProductSyncService {
  fetchProductsFromAPI(): Promise<ParamountProduct[]>;
  extractUniqueAttributes(products: ParamountProduct[]): ProductAttributes;
  saveProductsToFile(products: ParamountProduct[]): Promise<void>;
  saveAttributesToFile(attributes: ProductAttributes): Promise<void>;
  syncProducts(): Promise<{
    success: boolean;
    productsCount: number;
    attributesCount: number;
    error?: string;
  }>;
}



