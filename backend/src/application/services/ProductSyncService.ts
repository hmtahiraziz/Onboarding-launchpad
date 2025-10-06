import axios, { AxiosInstance } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { IProductSyncService } from '@/domain/services/IProductSyncService';
import { ParamountProduct, ProductAttributes } from '@/domain/entities/ParamountProduct';
import { logger } from '../../shared/utils/logger';

export class ProductSyncService implements IProductSyncService {
  private readonly API_URL = process.env.PARAMOUNT_API_BASE_URL + '/product/getAllProduct';
  private readonly DATA_DIR = path.join(process.cwd(), 'data');
  private readonly PRODUCTS_FILE = path.join(this.DATA_DIR, 'products.json');
  private readonly ATTRIBUTES_FILE = path.join(this.DATA_DIR, 'attributes.json');
  private axiosInstance: AxiosInstance | null = null;

  constructor() {
    this.ensureDataDirectory();
  }

  private getAxiosInstance(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        timeout: 120000, // 2 minutes timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Paramount-Launchpad/1.0.0',
        },
        // Configure for proper connection management
        httpAgent: new (require('http').Agent)({ 
          keepAlive: false,
          maxSockets: 1,
          timeout: 120000
        }),
        httpsAgent: new (require('https').Agent)({ 
          keepAlive: false,
          maxSockets: 1,
          timeout: 120000
        })
      });
    }
    return this.axiosInstance;
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.DATA_DIR);
    } catch {
      await fs.mkdir(this.DATA_DIR, { recursive: true });
      logger.info(`Created data directory: ${this.DATA_DIR}`);
    }
  }

  async fetchProductsFromAPI(): Promise<ParamountProduct[]> {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Fetching products from Paramount Liquor API... (Attempt ${attempt}/${maxRetries})`);
        logger.info(`API URL: ${this.API_URL}`);
        
        const response = await this.getAxiosInstance().get<ParamountProduct[]>(this.API_URL);

        if (response.status !== 200) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const products = response.data;
        logger.info(`Successfully fetched ${products.length} products from API`);
        
        return products;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isTimeoutError = error instanceof Error && (
          error.message.includes('timeout') || 
          error.message.includes('ECONNABORTED') ||
          error.message.includes('ETIMEDOUT')
        );
        
        logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        if (isTimeoutError && !isLastAttempt) {
          logger.info(`Timeout detected. Retrying in ${retryDelay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        if (isLastAttempt) {
          logger.error('All retry attempts failed. Final error:', error);
          throw new Error(`Failed to fetch products after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // For non-timeout errors, don't retry
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in fetchProductsFromAPI');
  }

  extractUniqueAttributes(products: ParamountProduct[]): ProductAttributes {
    logger.info('Extracting unique attributes from products...');
    
    const attributes: ProductAttributes = {
      brands: [],
      item_container_types: [],
      countries: [],
      regions: [],
      category_level_1: [],
      category_level_2: [],
      category_level_3: [],
      category_level_4: [],
      varietals: [],
      liquor_styles: [],
    };

    // Use Sets to ensure uniqueness
    const brandSet = new Set<string>();
    const itemContainerTypeSet = new Set<string>();
    const countrySet = new Set<string>();
    const regionSet = new Set<string>();
    const categoryLevel1Set = new Set<string>();
    const categoryLevel2Set = new Set<string>();
    const categoryLevel3Set = new Set<string>();
    const categoryLevel4Set = new Set<string>();
    const varietalSet = new Set<string>();
    const liquorStyleSet = new Set<string>();

    products.forEach(product => {
      // Extract and add unique values, filtering out null/undefined/empty values
      if (product.brand?.trim()) brandSet.add(product.brand.trim());
      if (product.item_container_type?.trim()) itemContainerTypeSet.add(product.item_container_type.trim());
      if (product.country?.trim()) countrySet.add(product.country.trim());
      if (product.region?.trim()) regionSet.add(product.region.trim());
      if (product.category_level_1?.trim()) categoryLevel1Set.add(product.category_level_1.trim());
      if (product.category_level_2?.trim()) categoryLevel2Set.add(product.category_level_2.trim());
      if (product.category_level_3?.trim()) categoryLevel3Set.add(product.category_level_3.trim());
      if (product.category_level_4?.trim()) categoryLevel4Set.add(product.category_level_4.trim());
      if (product.varietal?.trim()) varietalSet.add(product.varietal.trim());
      if (product.liquor_style?.trim()) liquorStyleSet.add(product.liquor_style.trim());
    });

    // Convert Sets to sorted arrays
    attributes.brands = Array.from(brandSet).sort();
    attributes.item_container_types = Array.from(itemContainerTypeSet).sort();
    attributes.countries = Array.from(countrySet).sort();
    attributes.regions = Array.from(regionSet).sort();
    attributes.category_level_1 = Array.from(categoryLevel1Set).sort();
    attributes.category_level_2 = Array.from(categoryLevel2Set).sort();
    attributes.category_level_3 = Array.from(categoryLevel3Set).sort();
    attributes.category_level_4 = Array.from(categoryLevel4Set).sort();
    attributes.varietals = Array.from(varietalSet).sort();
    attributes.liquor_styles = Array.from(liquorStyleSet).sort();

    logger.info(`Extracted unique attributes: ${Object.keys(attributes).map(key => `${key}: ${attributes[key as keyof ProductAttributes].length}`).join(', ')}`);
    
    return attributes;
  }

  async saveProductsToFile(products: ParamountProduct[]): Promise<void> {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        totalProducts: products.length,
        products: products
      };

      await fs.writeFile(this.PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf8');
      logger.info(`Saved ${products.length} products to ${this.PRODUCTS_FILE}`);
    } catch (error) {
      logger.error('Failed to save products to file:', error);
      throw new Error(`Failed to save products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveAttributesToFile(attributes: ProductAttributes): Promise<void> {
    try {
      const data = {
        lastUpdated: new Date().toISOString(),
        attributes: attributes
      };

      await fs.writeFile(this.ATTRIBUTES_FILE, JSON.stringify(data, null, 2), 'utf8');
      logger.info(`Saved product attributes to ${this.ATTRIBUTES_FILE}`);
    } catch (error) {
      logger.error('Failed to save attributes to file:', error);
      throw new Error(`Failed to save attributes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async syncProducts(): Promise<{
    success: boolean;
    productsCount: number;
    attributesCount: number;
    error?: string;
  }> {
    try {
      logger.info('Starting product sync process...');
      
      // Fetch products from API
      const products = await this.fetchProductsFromAPI();
      
      // Extract unique attributes
      const attributes = this.extractUniqueAttributes(products);
      
      // Save to files
      await this.saveProductsToFile(products);
      await this.saveAttributesToFile(attributes);
      
      const totalAttributes = Object.values(attributes).reduce((sum, arr) => sum + arr.length, 0);
      
      logger.info(`Product sync completed successfully. Products: ${products.length}, Total attributes: ${totalAttributes}`);
      
      return {
        success: true,
        productsCount: products.length,
        attributesCount: totalAttributes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Product sync failed:', errorMessage);
      
      return {
        success: false,
        productsCount: 0,
        attributesCount: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Test API connectivity without fetching full data
   */
  async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      logger.info('Testing API connection...');
      const startTime = Date.now();
      
      // Make a HEAD request to test connectivity
      const response = await this.getAxiosInstance().head(this.API_URL, {
        timeout: 10000 // 10 seconds for connection test
      });
      
      const responseTime = Date.now() - startTime;
      
      logger.info(`API connection test successful. Response time: ${responseTime}ms`);
      
      return {
        success: true,
        message: `API is accessible. Response time: ${responseTime}ms`,
        responseTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('API connection test failed:', errorMessage);
      
      return {
        success: false,
        message: `API connection failed: ${errorMessage}`
      };
    }
  }

  /**
   * Cleanup method to close any open connections
   * This should be called when the service is no longer needed
   */
  async cleanup(): Promise<void> {
    try {
      if (this.axiosInstance) {
        // Close the HTTP agents to prevent open handles
        const httpAgent = this.axiosInstance.defaults.httpAgent as any;
        const httpsAgent = this.axiosInstance.defaults.httpsAgent as any;
        
        if (httpAgent && typeof httpAgent.destroy === 'function') {
          httpAgent.destroy();
        }
        if (httpsAgent && typeof httpsAgent.destroy === 'function') {
          httpsAgent.destroy();
        }
        
        // Clear the instance reference
        this.axiosInstance = null;
      }
      
      logger.info('ProductSyncService cleanup completed');
    } catch (error) {
      logger.error('Error during ProductSyncService cleanup:', error);
    }
  }
}
