import { Product, ProductCategory, SupplierTier, Supplier, ContactInfo, ProductPricing, Inventory, ProductSpecifications } from '@/domain/entities/Product';

import { IProductRepository } from '@/domain/repositories/IProductRepository';
import fs from 'fs/promises';
import path from 'path';
import { CustomerRepository } from './CustomerRepository';
import { AIProductCurationService } from '@/application/services/AIProductCurationService';
import { Customer } from '@/domain/entities/Customer';
import { logger } from '@/shared/utils/logger';

interface JsonProduct {
  id: string;
  sku: string;
  name: string;
  product_web_description: string;
  image: string;
  supplier: string;
  supplier_id: string;
  visibility: string;
  product_rank: string;
  wholesale_units_per_case: string;
  loyalty_points: string;
  points_excluded_from_retail: string | null;
  supplier_points: string;
  bonus_points: string;
  brand: string;
  item_container_type: string;
  country: string;
  region: string;
  sell_by_type: string;
  category_level_1: string;
  category_level_2: string;
  category_level_3: string;
  category_level_4: string | null;
  mirakl_product: string;
  sold_at_cairns: string;
  sold_at_brisbane: string;
  sold_at_adelaide: string;
  sold_at_melbourne: string;
  sold_at_sydney: string;
  is3_pl_only: string;
  varietal: string;
  liquor_style: string;
  consumable_units_per_case: string;
  en_created: string;
  redeemable: string;
  marketing_tags: string | null;
  wet_tax: string;
  long_term_oos_locations: string;
  core_range_locations: string | null;
  hide_on_public: string;
  abv: string;
  split_pack_size: string;
}

interface ProductsData {
  lastUpdated: string;
  totalProducts: number;
  products: JsonProduct[];
}

export class ProductRepository implements IProductRepository {
  private productsData: ProductsData | null = null;
  private readonly dataPath = path.join(__dirname, '../../../data/products.json');
  private aiCurationService: AIProductCurationService | null = null;

  private async loadProducts(): Promise<ProductsData> {
    if (!this.productsData) {
      try {
        const fileContent = await fs.readFile(this.dataPath, 'utf-8');
        this.productsData = JSON.parse(fileContent);

      } catch (error) {
        throw new Error(`Failed to load products data: ${error}`);
      }
    }
    return this.productsData!;
  }

  private getAICurationService(): AIProductCurationService {
    if (!this.aiCurationService) {
      const customerRepository = new CustomerRepository();
      this.aiCurationService = new AIProductCurationService(customerRepository);
    }
    return this.aiCurationService;
  }

  private mapJsonToDomain(jsonProduct: JsonProduct): Product {
    // Map category levels to our domain categories
    const categoryMap: { [key: string]: ProductCategory } = {
      'Wine': ProductCategory.WINE,
      'Spirits': ProductCategory.SPIRITS,
      'Beer': ProductCategory.BEER,
      'Champagne': ProductCategory.CHAMPAGNE,
      'Cocktail Ingredients': ProductCategory.COCKTAIL_INGREDIENTS,
      'Non Alcoholic': ProductCategory.NON_ALCOHOLIC,
      'Bar Equipment': ProductCategory.BAR_EQUIPMENT
    };

    // Determine supplier tier based on supplier points or other criteria
    const supplierPoints = parseFloat(jsonProduct.supplier_points) || 0;
    let supplierTier: SupplierTier = SupplierTier.BRONZE;
    if (supplierPoints >= 100) supplierTier = SupplierTier.PLATINUM;
    else if (supplierPoints >= 50) supplierTier = SupplierTier.GOLD;
    else if (supplierPoints >= 20) supplierTier = SupplierTier.SILVER;

    // Calculate base price from loyalty points (simplified calculation)
    const basePrice = parseFloat(jsonProduct.loyalty_points) * 0.1; // Rough conversion

    return {
      id: jsonProduct.id,
      sku: jsonProduct.sku,
      name: jsonProduct.name,
      description: jsonProduct.product_web_description || '',
      category: categoryMap[jsonProduct.category_level_1] || ProductCategory.SPIRITS,
      subcategory: jsonProduct.category_level_2 || '',
      supplier: {
        id: jsonProduct.supplier_id,
        name: jsonProduct.supplier,
        tier: supplierTier,
        contactInfo: {
          email: `${(jsonProduct.supplier || 'supplier').toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '+61 2 1234 5678',
          address: '123 Supplier Street, Sydney NSW 2000'
        },
        isActive: true
      },
      pricing: {
        basePrice: basePrice,
        currency: 'AUD',
        volumeDiscounts: [
          { minQuantity: 10, discountPercentage: 5 },
          { minQuantity: 50, discountPercentage: 10 },
          { minQuantity: 100, discountPercentage: 15 }
        ],
        tierPricing: [
          { customerTier: 'bronze', priceMultiplier: 1.0 },
          { customerTier: 'silver', priceMultiplier: 0.95 },
          { customerTier: 'gold', priceMultiplier: 0.90 },
          { customerTier: 'platinum', priceMultiplier: 0.85 }
        ]
      },
      inventory: {
        currentStock: parseInt(jsonProduct.wholesale_units_per_case) || 0,
        minimumStock: 5,
        maximumStock: 1000,
        reorderPoint: 10,
        isInStock: jsonProduct.hide_on_public === '0'
      },
      specifications: {
        volume: 750, // Default 750ml
        alcoholContent: parseFloat(jsonProduct.abv) || 0,
        origin: jsonProduct.country,
        packaging: jsonProduct.item_container_type,
        shelfLife: 365 // 1 year default
      },
      tags: [
        jsonProduct.brand,
        jsonProduct.country,
        jsonProduct.region,
        jsonProduct.varietal,
        jsonProduct.liquor_style
      ].filter(Boolean),
      isActive: jsonProduct.hide_on_public === '0',
      createdAt: new Date(jsonProduct.en_created),
      updatedAt: new Date(jsonProduct.en_created)
    };
  }

  async findById(id: string): Promise<Product | null> {
    const data = await this.loadProducts();
    const jsonProduct = data.products.find(p => p.id === id);
    return jsonProduct ? this.mapJsonToDomain(jsonProduct) : null;
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    const data = await this.loadProducts();
    const categoryMap: { [key: string]: string } = {
      'wine': 'Wine',
      'spirits': 'Spirits',
      'beer': 'Beer',
      'champagne': 'Champagne',
      'cocktail_ingredients': 'Cocktail Ingredients',
      'non_alcoholic': 'Non Alcoholic',
      'bar_equipment': 'Bar Equipment'
    };

    const categoryLevel1 = categoryMap[category];
    const filteredProducts = data.products.filter(p => 
      p.category_level_1 === categoryLevel1 && p.hide_on_public === '0'
    );
    
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async findBySupplier(supplierId: string): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => 
      p.supplier_id === supplierId && p.hide_on_public === '0'
    );
    
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async findBySupplierTier(tier: SupplierTier): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => {
      if (p.hide_on_public !== '0') return false;
      
      const supplierPoints = parseFloat(p.supplier_points) || 0;
      let productTier: SupplierTier = SupplierTier.BRONZE;
      if (supplierPoints >= 100) productTier = SupplierTier.PLATINUM;
      else if (supplierPoints >= 50) productTier = SupplierTier.GOLD;
      else if (supplierPoints >= 20) productTier = SupplierTier.SILVER;
      
      return productTier === tier;
    });
    
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async findActiveProducts(): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => p.hide_on_public === '0');
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async findInStockProducts(): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => 
      p.hide_on_public === '0' && p.long_term_oos_locations === 'null'
    );
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const data = await this.loadProducts();
    const searchTerm = query.toLowerCase();
    
    const filteredProducts = data.products.filter(p => {
      if (p.hide_on_public !== '0') return false;
      
      return (
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.product_web_description || '').toLowerCase().includes(searchTerm) ||
        (p.brand || '').toLowerCase().includes(searchTerm) ||
        (p.varietal || '').toLowerCase().includes(searchTerm) ||
        (p.liquor_style || '').toLowerCase().includes(searchTerm) ||
        (p.country || '').toLowerCase().includes(searchTerm) ||
        (p.region || '').toLowerCase().includes(searchTerm)
      );
    });
    
    return filteredProducts.map(p => this.mapJsonToDomain(p));
  }

  async save(product: Product): Promise<Product> {
    // JSON service is read-only for now
    throw new Error('Save operation not supported in JSON repository');
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    // JSON service is read-only for now
    throw new Error('Update operation not supported in JSON repository');
  }

  async delete(id: string): Promise<boolean> {
    // JSON service is read-only for now
    throw new Error('Delete operation not supported in JSON repository');
  }

  async findRecommendedProducts(customerId: string, limit: number = 20, useAI: boolean = true): Promise<Product[]> {
    const customerRepo = new CustomerRepository();
    const customer = await customerRepo.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (!useAI) {
      // Direct rule-based recommendations
      return this.getFallbackRecommendations(customer, limit);
    }

    try {
      // Use AI curation service for intelligent product recommendations
      const aiCurationService = this.getAICurationService();
      
      const curationResult = await aiCurationService.curateProducts({
        customer,
        maxProducts: limit
      });

      // Return the complete products from curation service
      return curationResult.curatedProducts;
    } catch (error) {
      // Fallback to rule-based recommendations if AI fails
      console.warn('AI curation failed, falling back to rule-based recommendations:', error);
      return this.getFallbackRecommendations(customer, limit);
    }
  }

  private async getFallbackRecommendations(customer: Customer, limit: number): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => p.hide_on_public === '0');

    // Apply basic filtering based on business profile
    let filteredByProfile = filteredProducts;
    
    logger.info(`Initial products: ${filteredProducts.length}`);
    logger.info(`Customer venue type: ${customer.businessProfile.venueType}`);
    logger.info(`Customer cuisine style: ${customer.businessProfile.cuisineStyle}`);
    
    // Filter by venue type if available
    if (customer.businessProfile.venueType) {
      const beforeCount = filteredByProfile.length;
      filteredByProfile = this.filterByVenueType(filteredByProfile, customer.businessProfile.venueType);
      logger.info(`After venue type filtering: ${filteredByProfile.length} (was ${beforeCount})`);
    }

    // Filter by cuisine style if available
    if (customer.businessProfile.cuisineStyle) {
      const beforeCount = filteredByProfile.length;
      filteredByProfile = this.filterByCuisineStyle(filteredByProfile, customer.businessProfile.cuisineStyle);
      logger.info(`After cuisine style filtering: ${filteredByProfile.length} (was ${beforeCount})`);
    }

    // Filter by location/region if available
    if (customer.businessProfile.location?.city || customer.businessProfile.location?.state) {
      const beforeCount = filteredByProfile.length;
      filteredByProfile = this.filterByLocation(filteredByProfile, customer.businessProfile.location);
      logger.info(`After location filtering: ${filteredByProfile.length} (was ${beforeCount})`);
    }

    // If no products match the criteria, fall back to basic filtering
    if (filteredByProfile.length === 0) {
      logger.info('No products match criteria, falling back to basic filtering');
      filteredByProfile = filteredProducts;
    }

    // Sort by supplier tier (platinum first) and product rank
    const sortedProducts = filteredByProfile.sort((a, b) => {
      const aPoints = parseFloat(a.supplier_points) || 0;
      const bPoints = parseFloat(b.supplier_points) || 0;
      
      if (aPoints !== bPoints) return bPoints - aPoints;
      return parseInt(a.product_rank) - parseInt(b.product_rank);
    });
    
    return sortedProducts
      .slice(0, limit)
      .map(p => this.mapJsonToDomain(p));
  }

  private filterByVenueType(products: JsonProduct[], venueType: string): JsonProduct[] {
    const venueTypeKeywords: { [key: string]: string[] } = {
      'restaurant': ['wine', 'spirits', 'champagne', 'cocktail'],
      'bar': ['spirits', 'beer', 'cocktail', 'liquor'],
      'hotel': ['wine', 'spirits', 'champagne', 'beer', 'cocktail'],
      'nightclub': ['spirits', 'beer', 'cocktail', 'liquor'],
      'cafe': ['coffee', 'tea', 'non-alcoholic', 'wine'],
      'catering': ['wine', 'spirits', 'champagne', 'beer']
    };

    const keywords = venueTypeKeywords[venueType.toLowerCase()] || [];
    
    return products.filter(product => {
      const category = product.category_level_1?.toLowerCase() || '';
      const description = product.product_web_description?.toLowerCase() || '';
      const name = product.name?.toLowerCase() || '';
      
      return keywords.some(keyword => 
        category.includes(keyword) || 
        description.includes(keyword) || 
        name.includes(keyword)
      );
    });
  }

  private filterByCuisineStyle(products: JsonProduct[], cuisineStyle: string): JsonProduct[] {
    const cuisineKeywords: { [key: string]: string[] } = {
      'fine dining': ['premium', 'vintage', 'reserve', 'champagne', 'wine', 'spirits'],
      'casual dining': ['beer', 'wine', 'spirits', 'cocktail'],
      'fast food': ['beer', 'soft drinks', 'non-alcoholic'],
      'italian': ['wine', 'prosecco', 'grappa', 'limoncello'],
      'asian': ['sake', 'soju', 'wine', 'beer'],
      'mexican': ['tequila', 'mezcal', 'beer', 'wine'],
      'indian': ['wine', 'beer', 'spirits'],
      'mediterranean': ['wine', 'ouzo', 'raki', 'beer']
    };

    const keywords = cuisineKeywords[cuisineStyle.toLowerCase()] || [];
    
    return products.filter(product => {
      const description = product.product_web_description?.toLowerCase() || '';
      const name = product.name?.toLowerCase() || '';
      const brand = product.brand?.toLowerCase() || '';
      const country = product.country?.toLowerCase() || '';
      
      return keywords.some(keyword => 
        description.includes(keyword) || 
        name.includes(keyword) ||
        brand.includes(keyword) ||
        country.includes(keyword)
      );
    });
  }

  private filterByLocation(products: JsonProduct[], location: any): JsonProduct[] {
    const locationKeywords = [
      location.city?.toLowerCase(),
      location.state?.toLowerCase(),
      'australian',
      'local',
      'regional'
    ].filter(Boolean);

    return products.filter(product => {
      const country = product.country?.toLowerCase() || '';
      const region = product.region?.toLowerCase() || '';
      const description = product.product_web_description?.toLowerCase() || '';
      const name = product.name?.toLowerCase() || '';
      
      return locationKeywords.some(keyword => 
        country.includes(keyword) || 
        region.includes(keyword) ||
        description.includes(keyword) ||
        name.includes(keyword)
      );
    });
  }

  async findTrendingProducts(limit: number = 20): Promise<Product[]> {
    const data = await this.loadProducts();
    const filteredProducts = data.products.filter(p => p.hide_on_public === '0');
    
    // Sort by supplier tier and recent creation
    const sortedProducts = filteredProducts.sort((a, b) => {
      const aPoints = parseFloat(a.supplier_points) || 0;
      const bPoints = parseFloat(b.supplier_points) || 0;
      
      if (aPoints !== bPoints) return bPoints - aPoints;
      return new Date(b.en_created).getTime() - new Date(a.en_created).getTime();
    });
    
    return sortedProducts
      .slice(0, limit)
      .map(p => this.mapJsonToDomain(p));
  }
}
