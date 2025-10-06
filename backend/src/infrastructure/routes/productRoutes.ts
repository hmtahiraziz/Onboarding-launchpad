import { Router, Request, Response } from 'express';
import { ProductRepository } from '@/infrastructure/repositories/ProductRepository';
import { CustomerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { OnboardingRepository } from '@/infrastructure/repositories/OnboardingRepository';
import { AIProductCurationService } from '@/application/services/AIProductCurationService';
import { CustomError } from '@/shared/middleware/errorHandler';
import Joi from 'joi';

const router = Router();

// Lazy instantiation to ensure database is connected
let productRepository: ProductRepository;
let customerRepository: CustomerRepository;
let onboardingRepository: OnboardingRepository;
let aiCurationService: AIProductCurationService;

function getRepositories() {
  if (!productRepository) {
    productRepository = new ProductRepository();
    customerRepository = new CustomerRepository();
    onboardingRepository = new OnboardingRepository();
    aiCurationService = new AIProductCurationService(customerRepository);
  }
  return { productRepository, customerRepository, onboardingRepository, aiCurationService };
}

// Validation schemas
const searchProductsSchema = Joi.object({
  query: Joi.string().optional(),
  category: Joi.string().valid(
    'spirits', 'wine', 'beer', 'champagne', 
    'cocktail_ingredients', 'non_alcoholic', 'bar_equipment'
  ).optional(),
  supplierTier: Joi.string().valid('bronze', 'silver', 'gold', 'platinum').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  inStock: Joi.boolean().optional(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0)
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { productRepository } = getRepositories();
    const { id } = req.params;
    const product = await productRepository.findById(id);
    
    if (!product) {
      throw new CustomError('Product not found', 404);
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Search products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { productRepository } = getRepositories();
    const { error, value } = searchProductsSchema.validate(req.query);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    let products;

    if (value.query) {
      products = await productRepository.searchProducts(value.query);
    } else if (value.category) {
      products = await productRepository.findByCategory(value.category);
    } else if (value.supplierTier) {
      products = await productRepository.findBySupplierTier(value.supplierTier);
    } else if (value.inStock) {
      products = await productRepository.findInStockProducts();
    } else {
      products = await productRepository.findActiveProducts();
    }

    // Apply additional filters
    if (value.minPrice || value.maxPrice) {
      products = products.filter(product => {
        const price = product.pricing.basePrice;
        if (value.minPrice && price < value.minPrice) return false;
        if (value.maxPrice && price > value.maxPrice) return false;
        return true;
      });
    }

    // Apply pagination
    const offset = value.offset || 0;
    const limit = value.limit || 20;
    const paginatedProducts = products.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        total: products.length,
        offset,
        limit,
        hasMore: offset + limit < products.length
      }
    });
  } catch (error) {
    console.log("error",error)
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get products by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { productRepository } = getRepositories();
    const { category } = req.params;
    const products = await productRepository.findByCategory(category as any);
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get products by supplier
router.get('/supplier/:supplierId', async (req: Request, res: Response) => {
  try {
    const { productRepository } = getRepositories();
    const { supplierId } = req.params;
    const products = await productRepository.findBySupplier(supplierId);
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get recommended products for customer (AI-powered with fallback)
router.get('/recommended/:customerId', async (req: Request, res: Response) => {
  try {
    const { productRepository, customerRepository, aiCurationService } = getRepositories();
    const { customerId } = req.params;
    const { limit = 20, useAI = 'true' } = req.query;
    
    // Get customer for additional context
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    let responseData: any = {};

    if (useAI === 'true') {
      try {
        // Use AI curation service for intelligent recommendations
        const curationResult = await aiCurationService.curateProducts({
          customer,
          maxProducts: parseInt(limit as string)
        });

        responseData = {
          curatedProducts: curationResult.curatedProducts,
          curatedSkus: curationResult.curatedSkus, // Keep for backward compatibility
          curationInfo: {
            reasoning: curationResult.reasoning,
            confidence: curationResult.confidence,
            platinumProducts: curationResult.platinumSupplierProducts,
            platinumSkus: curationResult.platinumSkus, // Keep for backward compatibility
            bundledProducts: curationResult.bundledPacks,
            bundledSkus: curationResult.bundledSkus, // Keep for backward compatibility
            localFavoriteProducts: curationResult.localFavorites,
            localFavoritesSkus: curationResult.localFavoritesSkus, // Keep for backward compatibility
            businessInsights: curationResult.businessInsights,
            nextSteps: curationResult.nextSteps,
            generatedAt: curationResult.generatedAt,
            method: 'AI_CURATION'
          }
        };
      } catch (aiError) {
        console.warn('AI curation failed, using fallback:', aiError);
        // Fallback to rule-based recommendations
        const products = await productRepository.findRecommendedProducts(
          customerId, 
          parseInt(limit as string),
          false // useAI = false
        );
        responseData = {
          products,
          curationInfo: {
            method: 'RULE_BASED_FALLBACK',
            message: 'AI curation unavailable, using rule-based recommendations'
          }
        };
      }
    } else {
      // Direct rule-based recommendations
      const products = await productRepository.findRecommendedProducts(
        customerId, 
        parseInt(limit as string),
        false // useAI = false
      );
      responseData = {
        products,
        curationInfo: {
          method: 'RULE_BASED',
          message: 'Using rule-based recommendations as requested'
        }
      };
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get trending products
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { productRepository } = getRepositories();
    const { limit = 20 } = req.query;
    const products = await productRepository.findTrendingProducts(parseInt(limit as string));
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// AI Curation Endpoints

// Get AI-curated starter range for customer
router.get('/ai-curated/:customerId', async (req: Request, res: Response) => {
  try {
    const { productRepository, customerRepository, aiCurationService } = getRepositories();
    const { customerId } = req.params;
    const { maxProducts = 100 } = req.query;

    // Get customer
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    // Use AI to curate products based on business profile
    const curationResult = await aiCurationService.curateProducts({
      customer,
      maxProducts: parseInt(maxProducts as string)
    });

    res.json({
      success: true,
      data: {
        curatedProducts: curationResult.curatedProducts,
        curatedSkus: curationResult.curatedSkus, // Keep for backward compatibility
        reasoning: curationResult.reasoning,
        confidence: curationResult.confidence,
        platinumProducts: curationResult.platinumSupplierProducts,
        platinumSkus: curationResult.platinumSkus, // Keep for backward compatibility
        bundledProducts: curationResult.bundledPacks,
        bundledSkus: curationResult.bundledSkus, // Keep for backward compatibility
        localFavoriteProducts: curationResult.localFavorites,
        localFavoritesSkus: curationResult.localFavoritesSkus, // Keep for backward compatibility
        businessInsights: curationResult.businessInsights,
        nextSteps: curationResult.nextSteps,
        generatedAt: curationResult.generatedAt
      }
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get AI-identified bundled packs
// Note: Bundled packs are now identified by the curation service
// This endpoint has been removed as the functionality is integrated into the main curation process

// Note: Local favorites are now identified by the curation service
// This endpoint has been removed as the functionality is integrated into the main curation process


export { router as productRoutes };
