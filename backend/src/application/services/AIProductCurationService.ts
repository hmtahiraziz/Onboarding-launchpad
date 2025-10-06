import { IAIProductCurationService, AIProductCurationRequest, AIProductCurationResponse } from '../../domain/services/IAIProductCurationService';
import { Product } from '../../domain/entities/Product';
import { Customer, AIResponse } from '../../domain/entities/Customer';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';
import { logger } from '../../shared/utils/logger';

export class AIProductCurationService implements IAIProductCurationService {
  private customerRepository: ICustomerRepository;
  private curationServiceUrl: string;

  constructor(customerRepository: ICustomerRepository) {
    this.customerRepository = customerRepository;
    this.curationServiceUrl = process.env.CURATION_SERVICE_URL || 'http://localhost:8000';
  }

  async curateProducts(request: AIProductCurationRequest): Promise<AIProductCurationResponse> {
    try {
      const { customer, maxProducts = 100 } = request;

      // Call the curation service
      const curationResponse = await this.callCurationService(customer.businessProfile, maxProducts);

      // Map curation service products to domain products
      const curatedProducts = this.mapCurationProductsToDomain(curationResponse.curatedProducts || []);
      const platinumProducts = this.mapCurationProductsToDomain(curationResponse.platinumProducts || []);
      const bundledProducts = this.mapCurationProductsToDomain(curationResponse.bundledProducts || []);
      const localFavoriteProducts = this.mapCurationProductsToDomain(curationResponse.localFavoriteProducts || []);
      
      // Extract SKUs for backward compatibility
      const curatedSkus = curationResponse.curatedProductIds || [];
      const platinumSkus = curationResponse.platinumSupplierProducts || [];
      const bundledSkus = curationResponse.bundledPacks || [];
      const localFavoritesSkus = curationResponse.localFavorites || [];
      
      // Save AI response to customer record
      await this.saveAIResponse(customer.id, {
        recommendedProducts: curatedSkus,
        personalizedMessage: `Curated ${curatedProducts.length} products based on business profile`,
        businessInsights: curationResponse.businessInsights || [],
        nextSteps: curationResponse.nextSteps || [],
        confidenceScore: curationResponse.confidence || 0.8,
        generatedAt: new Date()
      });

      return {
        curatedProducts: curatedProducts, // Complete product objects
        curatedSkus: curatedSkus, // Keep for backward compatibility
        reasoning: curationResponse.reasoning || [],
        confidence: curationResponse.confidence || 0.8,
        platinumSupplierProducts: platinumProducts, // Complete product objects
        platinumSkus: platinumSkus, // Keep for backward compatibility
        bundledPacks: bundledProducts, // Complete product objects
        bundledSkus: bundledSkus, // Keep for backward compatibility
        localFavorites: localFavoriteProducts, // Complete product objects
        localFavoritesSkus: localFavoritesSkus, // Keep for backward compatibility
        businessInsights: curationResponse.businessInsights || [],
        nextSteps: curationResponse.nextSteps || [],
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('Curation service failed:', error);
      // Fallback to rule-based curation
      return await this.fallbackCuration(request);
    }
  }


  // private prepareBusinessProfile(customer: Customer): any {
  //   return {
  //     tier: customer.businessProfile.tier,
  //     location: {
  //       city: customer.businessProfile.location.city,
  //       state: customer.businessProfile.location.state,
  //       address: customer.businessProfile.location.address,
  //       country: customer.businessProfile.location.country,
  //       postcode: customer.businessProfile.location.postcode
  //     },
  //     venueType: customer.businessProfile.venueType,
  //     cuisineStyle: customer.businessProfile.cuisineStyle,
  //     budgetBand: customer.businessProfile.budgetBand
  //   };
  // }

  private async callCurationService(businessProfile: any, maxProducts: number): Promise<any> {
    console.log('${this.curationServiceUrl}/curate',this.curationServiceUrl)
    
    const response = await fetch(`${this.curationServiceUrl}/curate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: businessProfile,
        maxProducts: maxProducts
      })
    });

    if (!response.ok) {
      throw new Error(`Curation service responded with status: ${response.status}`);
    }

    return await response.json();
  }

  private mapCurationProductsToDomain(curationProducts: any[]): Product[] {
    // Map curation service products to domain Product entities
    return curationProducts.map(curationProduct => this.mapCurationProductToDomain(curationProduct));
  }

  private mapCurationProductToDomain(curationProduct: any): Product {
    // Map a single curation service product to domain Product entity
    // This is similar to the mapping in ProductRepository but for curation service format
    
    // Map category levels to our domain categories
    const categoryMap: { [key: string]: any } = {
      'Wine': 'wine',
      'Spirits': 'spirits', 
      'Beer': 'beer',
      'Champagne': 'champagne',
      'Cocktail Ingredients': 'cocktail_ingredients',
      'Non Alcoholic': 'non_alcoholic',
      'Bar Equipment': 'bar_equipment'
    };

    // Determine supplier tier based on supplier points or other criteria
    const supplierPoints = parseFloat(curationProduct.supplier_points) || 0;
    let supplierTier: any = 'bronze';
    if (supplierPoints >= 100) supplierTier = 'platinum';
    else if (supplierPoints >= 50) supplierTier = 'gold';
    else if (supplierPoints >= 20) supplierTier = 'silver';

    // Calculate base price from loyalty points (simplified calculation)
    const basePrice = parseFloat(curationProduct.loyalty_points) * 0.1; // Rough conversion

    return {
      id: curationProduct.id,
      sku: curationProduct.sku,
      name: curationProduct.name,
      description: curationProduct.product_web_description || '',
      category: categoryMap[curationProduct.category_level_1] || 'spirits',
      subcategory: curationProduct.category_level_2 || '',
      supplier: {
        id: curationProduct.supplier_id || curationProduct.id,
        name: curationProduct.supplier || 'Unknown Supplier',
        tier: supplierTier,
        contactInfo: {
          email: `${(curationProduct.supplier || 'supplier').toLowerCase().replace(/\s+/g, '')}@example.com`,
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
        currentStock: parseInt(curationProduct.wholesale_units_per_case) || 0,
        minimumStock: 5,
        maximumStock: 1000,
        reorderPoint: 10,
        isInStock: curationProduct.hide_on_public === '0'
      },
      specifications: {
        volume: 750, // Default 750ml
        alcoholContent: parseFloat(curationProduct.abv) || 0,
        origin: curationProduct.country,
        packaging: curationProduct.item_container_type,
        shelfLife: 365 // 1 year default
      },
      tags: [
        curationProduct.brand,
        curationProduct.country,
        curationProduct.region,
        curationProduct.varietal,
        curationProduct.liquor_style
      ].filter(Boolean),
      isActive: curationProduct.hide_on_public === '0',
      createdAt: new Date(curationProduct.en_created),
      updatedAt: new Date(curationProduct.en_created)
    };
  }

  private async mapSkusToProducts(skus: string[]): Promise<Product[]> {
    // Map SKUs back to Product entities by finding products with matching SKU
    const productRepository = new (await import('../../infrastructure/repositories/ProductRepository')).ProductRepository();
    const allProducts = await productRepository.findActiveProducts();
    
    return allProducts.filter(product => 
      skus.includes(product.sku || product.id)
    );
  }


  private async fallbackCuration(request: AIProductCurationRequest): Promise<AIProductCurationResponse> {
    const { maxProducts = 100 } = request;
    
    // Simple fallback: get some basic products from the repository
    try {
      const productRepository = new (await import('../../infrastructure/repositories/ProductRepository')).ProductRepository();
      const allProducts = await productRepository.findActiveProducts();
    
    // Simple fallback: prioritize platinum suppliers and in-stock products
    const platinumProducts = allProducts.filter(p => p.supplier.tier === 'platinum' && p.inventory.isInStock);
    const otherProducts = allProducts.filter(p => p.supplier.tier !== 'platinum' && p.inventory.isInStock);
    
    const curatedProducts = [
      ...platinumProducts.slice(0, Math.min(30, maxProducts)),
      ...otherProducts.slice(0, Math.max(0, maxProducts - platinumProducts.length))
    ].slice(0, maxProducts);

    return {
        curatedProducts: curatedProducts, // Complete product objects
        curatedSkus: curatedProducts.map(p => p.sku || p.id), // Keep for backward compatibility
        reasoning: ['Fallback curation used due to curation service unavailability', 'Prioritized Platinum suppliers', 'Focused on in-stock products'],
        confidence: 0.6,
        platinumSupplierProducts: platinumProducts.slice(0, 30), // Complete product objects
        platinumSkus: platinumProducts.slice(0, 30).map(p => p.sku || p.id), // Keep for backward compatibility
        bundledPacks: [], // No bundled packs in fallback
        bundledSkus: [], // No bundled packs in fallback
        localFavorites: [], // No local favorites in fallback
        localFavoritesSkus: [], // No SKUs available
        businessInsights: ['Fallback mode: Basic product selection', 'Limited AI insights available'],
        nextSteps: ['Try again later for AI-powered recommendations', 'Contact support if issues persist'],
        generatedAt: new Date()
      };
    } catch (error) {
      // If even fallback fails, return empty response
      return {
        curatedProducts: [], // No products available
        curatedSkus: [], // No SKUs available
        reasoning: ['Fallback curation failed', 'Please try again later'],
        confidence: 0.1,
        platinumSupplierProducts: [], // No products available
        platinumSkus: [], // No SKUs available
        bundledPacks: [], // No products available
        bundledSkus: [], // No SKUs available
        localFavorites: [], // No products available
        localFavoritesSkus: [], // No SKUs available
        businessInsights: ['Service temporarily unavailable'],
        nextSteps: ['Please try again later', 'Contact support if issues persist'],
      generatedAt: new Date()
    };
    }
  }


  private async saveAIResponse(customerId: string, aiResponse: AIResponse): Promise<void> {
    try {
      await this.customerRepository.update(customerId, { aiResponse });
      logger.info(`AI response saved for customer ${customerId}`);
    } catch (error) {
      logger.error(`Failed to save AI response for customer ${customerId}:`, error);
      // Don't throw error as this is not critical to the main flow
    }
  }
}
