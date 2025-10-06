import { AIProductCurationService } from '../../src/application/services/AIProductCurationService';
import { Product, ProductCategory, SupplierTier } from '../../src/domain/entities/Product';
import { Customer, CustomerTier, VenueType } from '../../src/domain/entities/Customer';
import { OnboardingSession, OnboardingStep, OnboardingSessionStatus } from '../../src/domain/entities/OnboardingSession';
import { CustomerSegment } from '../../src/domain/entities/CustomerSegment';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

describe('AIProductCurationService', () => {
  let aiService: AIProductCurationService;
  let mockOpenAI: any;

  beforeEach(() => {
    aiService = new AIProductCurationService();
    mockOpenAI = require('openai').default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('identifyBundledPacks', () => {
    it('should identify products with bundle keywords in name', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Premium Wine Pack',
          description: 'A selection of fine wines',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier1',
            name: 'Test Supplier',
            tier: SupplierTier.PLATINUM,
            contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
            isActive: true
          },
          pricing: { basePrice: 100, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 10, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Regular Wine',
          description: 'A single bottle',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier2',
            name: 'Test Supplier 2',
            tier: SupplierTier.GOLD,
            contactInfo: { email: 'test2@test.com', phone: '456', address: '456 St' },
            isActive: true
          },
          pricing: { basePrice: 50, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 20, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await aiService.identifyBundledPacks(products);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should identify products with bundle keywords in description', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Premium Wine',
          description: 'A great value bundle of wines',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier1',
            name: 'Test Supplier',
            tier: SupplierTier.PLATINUM,
            contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
            isActive: true
          },
          pricing: { basePrice: 100, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 10, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await aiService.identifyBundledPacks(products);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no bundle keywords found', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Regular Wine',
          description: 'A single bottle of wine',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier1',
            name: 'Test Supplier',
            tier: SupplierTier.PLATINUM,
            contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
            isActive: true
          },
          pricing: { basePrice: 100, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 10, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await aiService.identifyBundledPacks(products);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('identifyLocalFavorites', () => {
    const customer: Customer = {
      id: 'customer1',
      email: 'test@test.com',
      name: 'Test Customer',
      tier: CustomerTier.BRONZE,
      venueType: VenueType.RESTAURANT,
      cuisineStyle: 'fine-dining',
      location: {
        address: '123 Main St',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        country: 'Australia'
      },
      onboardingStatus: 'completed' as any,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 1000, max: 10000 },
        productCategories: ['wine'],
        deliveryFrequency: 'weekly'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should identify products with local keywords', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Melbourne Craft Beer',
          description: 'Local brewery specialty',
          category: ProductCategory.BEER,
          subcategory: 'craft',
          supplier: {
            id: 'supplier1',
            name: 'Test Supplier',
            tier: SupplierTier.PLATINUM,
            contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
            isActive: true
          },
          pricing: { basePrice: 10, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 50, minimumStock: 5, maximumStock: 100, reorderPoint: 5, isInStock: true },
          specifications: { volume: 330, packaging: 'bottle', origin: 'Melbourne' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'International Wine',
          description: 'Imported from France',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier2',
            name: 'Test Supplier 2',
            tier: SupplierTier.GOLD,
            contactInfo: { email: 'test2@test.com', phone: '456', address: '456 St' },
            isActive: true
          },
          pricing: { basePrice: 50, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 20, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle', origin: 'France' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await aiService.identifyLocalFavorites(products, customer);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should identify products with Australian origin', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Australian Shiraz',
          description: 'Premium Australian wine',
          category: ProductCategory.WINE,
          subcategory: 'red',
          supplier: {
            id: 'supplier1',
            name: 'Test Supplier',
            tier: SupplierTier.PLATINUM,
            contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
            isActive: true
          },
          pricing: { basePrice: 30, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
          inventory: { currentStock: 25, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
          specifications: { volume: 750, packaging: 'bottle', origin: 'Australia' },
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await aiService.identifyLocalFavorites(products, customer);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('curateProducts', () => {
    const mockCustomer: Customer = {
      id: 'customer1',
      email: 'test@test.com',
      name: 'Test Customer',
      tier: CustomerTier.BRONZE,
      venueType: VenueType.RESTAURANT,
      cuisineStyle: 'fine-dining',
      location: {
        address: '123 Main St',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        country: 'Australia'
      },
      onboardingStatus: 'completed' as any,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 1000, max: 10000 },
        productCategories: ['wine', 'spirits'],
        deliveryFrequency: 'weekly'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockSession: OnboardingSession = {
      id: 'session1',
      customerId: 'customer1',
      currentStep: OnboardingStep.COMPLETION,
      responses: [
        {
          step: OnboardingStep.VENUE_TYPE,
          question: 'What type of venue do you operate?',
          answer: 'restaurant',
          timestamp: new Date()
        },
        {
          step: OnboardingStep.CUISINE_STYLE,
          question: 'What cuisine style best describes your venue?',
          answer: 'fine-dining',
          timestamp: new Date()
        }
      ],
      curatedProducts: [],
      status: OnboardingSessionStatus.COMPLETED,
      startedAt: new Date(),
      lastActivityAt: new Date()
    };

    const mockSegment: CustomerSegment = {
      id: 'segment1',
      name: 'Fine Dining Restaurant',
      description: 'High-end restaurants with premium wine and spirits focus',
      criteria: {
        venueType: ['restaurant'],
        cuisineStyle: ['fine-dining'],
        budgetRange: { min: 10000, max: 50000 },
        preferences: {
          productCategories: ['wine', 'spirits', 'champagne'],
          supplierTiers: ['platinum', 'gold']
        }
      },
      productTemplate: ['wine', 'spirits', 'champagne', 'cocktail_ingredients'],
      priority: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Wine',
        description: 'High-quality wine',
        category: ProductCategory.WINE,
        subcategory: 'red',
        supplier: {
          id: 'supplier1',
          name: 'Platinum Supplier',
          tier: SupplierTier.PLATINUM,
          contactInfo: { email: 'test@test.com', phone: '123', address: '123 St' },
          isActive: true
        },
        pricing: { basePrice: 100, currency: 'AUD', volumeDiscounts: [], tierPricing: [] },
        inventory: { currentStock: 10, minimumStock: 5, maximumStock: 50, reorderPoint: 5, isInStock: true },
        specifications: { volume: 750, packaging: 'bottle' },
        tags: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should use fallback curation when OpenAI fails', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI API error'))
          }
        }
      };
      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const result = await aiService.curateProducts({
        customer: mockCustomer,
        onboardingSession: mockSession,
        customerSegment: mockSegment,
        allProducts: mockProducts,
        maxProducts: 10
      });

      expect(result.curatedProducts).toBeDefined();
      expect(result.reasoning).toContain('Fallback curation used due to AI service unavailability');
      expect(result.confidence).toBe(0.6);
    });

    it('should parse AI response correctly', async () => {
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              curatedProductIds: ['1'],
              reasoning: ['Perfect for fine dining restaurant', 'Platinum supplier quality'],
              confidence: 0.9,
              platinumSupplierProducts: ['1'],
              bundledPacks: [],
              localFavorites: []
            })
          }
        }]
      };

      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockAIResponse)
          }
        }
      };
      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      // Create a new instance to use the mocked OpenAI
      const aiServiceWithMock = new AIProductCurationService();

      const result = await aiServiceWithMock.curateProducts({
        customer: mockCustomer,
        onboardingSession: mockSession,
        customerSegment: mockSegment,
        allProducts: mockProducts,
        maxProducts: 10
      });

      expect(result.curatedProducts).toHaveLength(1);
      expect(result.curatedProducts[0].id).toBe('1');
      expect(result.reasoning).toContain('Perfect for fine dining restaurant');
      expect(result.confidence).toBe(0.9);
      expect(result.platinumSupplierProducts).toHaveLength(1);
    });
  });

  describe('determineCustomerSegment', () => {
    const mockCustomer: Customer = {
      id: 'customer1',
      email: 'test@test.com',
      name: 'Test Customer',
      tier: CustomerTier.BRONZE,
      venueType: VenueType.RESTAURANT,
      cuisineStyle: 'fine-dining',
      location: {
        address: '123 Main St',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        country: 'Australia'
      },
      onboardingStatus: 'completed' as any,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 1000, max: 10000 },
        productCategories: ['wine'],
        deliveryFrequency: 'weekly'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockSession: OnboardingSession = {
      id: 'session1',
      customerId: 'customer1',
      currentStep: OnboardingStep.COMPLETION,
      responses: [
        {
          step: OnboardingStep.VENUE_TYPE,
          question: 'What type of venue do you operate?',
          answer: 'restaurant',
          timestamp: new Date()
        }
      ],
      curatedProducts: [],
      status: OnboardingSessionStatus.COMPLETED,
      startedAt: new Date(),
      lastActivityAt: new Date()
    };

    const mockSegments: CustomerSegment[] = [
      {
        id: 'segment1',
        name: 'Fine Dining Restaurant',
        description: 'High-end restaurants',
        criteria: {
          venueType: ['restaurant'],
          cuisineStyle: ['fine-dining']
        },
        productTemplate: ['wine', 'spirits'],
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should use fallback segmentation when OpenAI fails', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI API error'))
          }
        }
      };
      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const result = await aiService.determineCustomerSegment({
        customer: mockCustomer,
        onboardingSession: mockSession,
        allSegments: mockSegments
      });

      expect(result.recommendedSegment).toBeDefined();
      expect(result.reasoning).toContain('Fallback segmentation used due to AI service unavailability');
      expect(result.confidence).toBe(0.5);
    });

    it('should parse AI segmentation response correctly', async () => {
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendedSegmentId: 'segment1',
              reasoning: 'Perfect match for fine dining restaurant',
              confidence: 0.95,
              alternativeSegmentIds: []
            })
          }
        }]
      };

      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockAIResponse)
          }
        }
      };
      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      // Create a new instance to use the mocked OpenAI
      const aiServiceWithMock = new AIProductCurationService();

      const result = await aiServiceWithMock.determineCustomerSegment({
        customer: mockCustomer,
        onboardingSession: mockSession,
        allSegments: mockSegments
      });

      expect(result.recommendedSegment.id).toBe('segment1');
      expect(result.reasoning).toBe('Perfect match for fine dining restaurant');
      expect(result.confidence).toBe(0.95);
    });
  });
});
