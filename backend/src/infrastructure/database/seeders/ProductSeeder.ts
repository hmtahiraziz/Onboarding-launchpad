import { ProductModel } from '../models/ProductModel';
import { Product, ProductCategory, SupplierTier } from '@/domain/entities/Product';

export class ProductSeeder {
  static async seedProducts(): Promise<void> {
    const products: Partial<Product>[] = [
      // Spirits
      {
        id: 'prod-001',
        name: 'Grey Goose Vodka 700ml',
        description: 'Premium French vodka made from soft winter wheat and pure spring water',
        category: ProductCategory.SPIRITS,
        subcategory: 'Vodka',
        supplier: {
          id: 'supp-001',
          name: 'Pernod Ricard',
          tier: SupplierTier.PLATINUM,
          contactInfo: {
            email: 'contact@pernod-ricard.com',
            phone: '+61 2 9876 5432',
            address: '123 Business St, Sydney NSW 2000'
          },
          isActive: true
        },
        pricing: {
          basePrice: 65.99,
          currency: 'AUD',
          volumeDiscounts: [
            { minQuantity: 12, discountPercentage: 5 },
            { minQuantity: 24, discountPercentage: 10 }
          ],
          tierPricing: [
            { customerTier: 'bronze', priceMultiplier: 1.0 },
            { customerTier: 'silver', priceMultiplier: 0.95 },
            { customerTier: 'gold', priceMultiplier: 0.90 },
            { customerTier: 'platinum', priceMultiplier: 0.85 }
          ]
        },
        inventory: {
          currentStock: 150,
          minimumStock: 20,
          maximumStock: 200,
          reorderPoint: 30,
          isInStock: true
        },
        specifications: {
          volume: 700,
          alcoholContent: 40,
          origin: 'France',
          packaging: 'Glass bottle',
          shelfLife: 3650
        },
        tags: ['premium', 'vodka', 'french', 'wheat'],
        isActive: true
      },
      {
        id: 'prod-002',
        name: 'Johnnie Walker Black Label 700ml',
        description: 'Premium blended Scotch whisky with rich, complex flavors',
        category: ProductCategory.SPIRITS,
        subcategory: 'Whisky',
        supplier: {
          id: 'supp-002',
          name: 'Diageo Australia',
          tier: SupplierTier.PLATINUM,
          contactInfo: {
            email: 'contact@diageo.com.au',
            phone: '+61 3 9876 5432',
            address: '456 Corporate Ave, Melbourne VIC 3000'
          },
          isActive: true
        },
        pricing: {
          basePrice: 89.99,
          currency: 'AUD',
          volumeDiscounts: [
            { minQuantity: 12, discountPercentage: 8 },
            { minQuantity: 24, discountPercentage: 15 }
          ],
          tierPricing: [
            { customerTier: 'bronze', priceMultiplier: 1.0 },
            { customerTier: 'silver', priceMultiplier: 0.95 },
            { customerTier: 'gold', priceMultiplier: 0.90 },
            { customerTier: 'platinum', priceMultiplier: 0.85 }
          ]
        },
        inventory: {
          currentStock: 85,
          minimumStock: 15,
          maximumStock: 150,
          reorderPoint: 25,
          isInStock: true
        },
        specifications: {
          volume: 700,
          alcoholContent: 40,
          origin: 'Scotland',
          packaging: 'Glass bottle',
          shelfLife: 3650
        },
        tags: ['premium', 'scotch', 'whisky', 'blended'],
        isActive: true
      },
      // Wine
      {
        id: 'prod-003',
        name: 'Penfolds Grange 2018 750ml',
        description: 'Australia\'s most celebrated wine, a Shiraz blend of exceptional quality',
        category: ProductCategory.WINE,
        subcategory: 'Red Wine',
        supplier: {
          id: 'supp-003',
          name: 'Treasury Wine Estates',
          tier: SupplierTier.GOLD,
          contactInfo: {
            email: 'contact@twe.com.au',
            phone: '+61 8 9876 5432',
            address: '789 Wine St, Adelaide SA 5000'
          },
          isActive: true
        },
        pricing: {
          basePrice: 899.99,
          currency: 'AUD',
          volumeDiscounts: [
            { minQuantity: 6, discountPercentage: 10 },
            { minQuantity: 12, discountPercentage: 20 }
          ],
          tierPricing: [
            { customerTier: 'bronze', priceMultiplier: 1.0 },
            { customerTier: 'silver', priceMultiplier: 0.95 },
            { customerTier: 'gold', priceMultiplier: 0.90 },
            { customerTier: 'platinum', priceMultiplier: 0.85 }
          ]
        },
        inventory: {
          currentStock: 25,
          minimumStock: 5,
          maximumStock: 50,
          reorderPoint: 8,
          isInStock: true
        },
        specifications: {
          volume: 750,
          alcoholContent: 14.5,
          origin: 'Australia',
          vintage: 2018,
          packaging: 'Glass bottle',
          shelfLife: 3650
        },
        tags: ['premium', 'shiraz', 'australian', 'collectible'],
        isActive: true
      },
      // Beer
      {
        id: 'prod-004',
        name: 'Carlton Draught 24x375ml',
        description: 'Classic Australian lager, crisp and refreshing',
        category: ProductCategory.BEER,
        subcategory: 'Lager',
        supplier: {
          id: 'supp-004',
          name: 'Carlton & United Breweries',
          tier: SupplierTier.SILVER,
          contactInfo: {
            email: 'contact@cub.com.au',
            phone: '+61 3 9876 5432',
            address: '321 Brewery Rd, Melbourne VIC 3000'
          },
          isActive: true
        },
        pricing: {
          basePrice: 45.99,
          currency: 'AUD',
          volumeDiscounts: [
            { minQuantity: 5, discountPercentage: 5 },
            { minQuantity: 10, discountPercentage: 10 }
          ],
          tierPricing: [
            { customerTier: 'bronze', priceMultiplier: 1.0 },
            { customerTier: 'silver', priceMultiplier: 0.95 },
            { customerTier: 'gold', priceMultiplier: 0.90 },
            { customerTier: 'platinum', priceMultiplier: 0.85 }
          ]
        },
        inventory: {
          currentStock: 200,
          minimumStock: 50,
          maximumStock: 500,
          reorderPoint: 75,
          isInStock: true
        },
        specifications: {
          volume: 9000, // 24 x 375ml
          alcoholContent: 4.6,
          origin: 'Australia',
          packaging: 'Cardboard case',
          shelfLife: 365
        },
        tags: ['lager', 'australian', 'popular', 'case'],
        isActive: true
      }
    ];

    try {
      // Clear existing products
      await ProductModel.deleteMany({});
      
      // Insert new products
      await ProductModel.insertMany(products);
      
      console.log('✅ Products seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    }
  }
}
