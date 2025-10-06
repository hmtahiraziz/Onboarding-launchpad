import { OnboardingUseCase } from '../../src/application/use-cases/onboarding/OnboardingUseCase';
import { IOnboardingRepository } from '../../src/domain/repositories/IOnboardingRepository';
import { ICustomerRepository } from '../../src/domain/repositories/ICustomerRepository';
import { IProductRepository } from '../../src/domain/repositories/IProductRepository';
import { IAIProductCurationService } from '../../src/domain/services/IAIProductCurationService';
import { CustomerSegmentationUseCase } from '../../src/application/use-cases/segmentation/CustomerSegmentationUseCase';
import { Customer, CustomerTier, VenueType } from '../../src/domain/entities/Customer';
import { OnboardingSession, OnboardingStep, OnboardingSessionStatus } from '../../src/domain/entities/OnboardingSession';
import { CustomerSegment } from '../../src/domain/entities/CustomerSegment';
import { Product, ProductCategory, SupplierTier } from '../../src/domain/entities/Product';
import { CustomError } from '../../src/shared/middleware/errorHandler';

describe('OnboardingUseCase', () => {
  let onboardingUseCase: OnboardingUseCase;
  let mockOnboardingRepository: jest.Mocked<IOnboardingRepository>;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockAICurationService: jest.Mocked<IAIProductCurationService>;
  let mockSegmentationService: jest.Mocked<CustomerSegmentationUseCase>;

  beforeEach(() => {
    mockOnboardingRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    };

    mockCustomerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    };

    mockProductRepository = {
      findById: jest.fn(),
      findActiveProducts: jest.fn(),
      findByCategory: jest.fn(),
      findBySupplier: jest.fn(),
      findBySupplierTier: jest.fn(),
      findInStockProducts: jest.fn(),
      searchProducts: jest.fn(),
      findRecommendedProducts: jest.fn(),
      findTrendingProducts: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockAICurationService = {
      curateProducts: jest.fn(),
      determineCustomerSegment: jest.fn(),
      identifyBundledPacks: jest.fn(),
      identifyLocalFavorites: jest.fn()
    };

    mockSegmentationService = {
      determineCustomerSegment: jest.fn(),
      getSegmentsByCriteria: jest.fn(),
      createSegment: jest.fn(),
      updateSegment: jest.fn(),
      deleteSegment: jest.fn()
    };

    onboardingUseCase = new OnboardingUseCase(
      mockOnboardingRepository,
      mockCustomerRepository,
      mockProductRepository,
      mockAICurationService,
      mockSegmentationService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any open handles
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('startOnboarding', () => {
    it('should create a new onboarding session', async () => {
      const customerId = 'customer1';
      const mockCustomer: Customer = {
        id: customerId,
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
        onboardingStatus: 'not_started' as any,
        preferences: {
          preferredSuppliers: [],
          budgetRange: { min: 1000, max: 10000 },
          productCategories: ['wine'],
          deliveryFrequency: 'weekly'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockOnboardingRepository.findByCustomerId.mockResolvedValue(null);
      mockOnboardingRepository.save.mockImplementation(async (session) => session);

      const result = await onboardingUseCase.startOnboarding({ customerId });

      expect(result.customerId).toBe(customerId);
      expect(result.currentStep).toBe(OnboardingStep.WELCOME);
      expect(result.status).toBe(OnboardingSessionStatus.ACTIVE);
      expect(mockOnboardingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        customerId,
        currentStep: OnboardingStep.WELCOME,
        status: OnboardingSessionStatus.ACTIVE
      }));
    });

    it('should return existing active session if found', async () => {
      const customerId = 'customer1';
      const existingSession: OnboardingSession = {
        id: 'session1',
        customerId,
        currentStep: OnboardingStep.VENUE_TYPE,
        responses: [],
        curatedProducts: [],
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      const mockCustomer: Customer = {
        id: customerId,
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
        onboardingStatus: 'in_progress' as any,
        preferences: {
          preferredSuppliers: [],
          budgetRange: { min: 1000, max: 10000 },
          productCategories: ['wine'],
          deliveryFrequency: 'weekly'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockOnboardingRepository.findByCustomerId.mockResolvedValue(existingSession);

      const result = await onboardingUseCase.startOnboarding({ customerId });

      expect(result).toBe(existingSession);
      expect(mockOnboardingRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if customer not found', async () => {
      const customerId = 'nonexistent';
      mockCustomerRepository.findById.mockResolvedValue(null);

      await expect(onboardingUseCase.startOnboarding({ customerId }))
        .rejects.toThrow(CustomError);
    });
  });

  describe('generateCuratedProducts', () => {
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

    it('should generate curated products using AI', async () => {
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockOnboardingRepository.findByCustomerId.mockResolvedValue(mockSession);
      mockProductRepository.findActiveProducts.mockResolvedValue(mockProducts);
      mockSegmentationService.getSegmentsByCriteria.mockResolvedValue([mockSegment]);
      
      mockAICurationService.determineCustomerSegment.mockResolvedValue({
        recommendedSegment: mockSegment,
        reasoning: 'Perfect match for fine dining restaurant',
        confidence: 0.95,
        alternativeSegments: []
      });

      mockAICurationService.curateProducts.mockResolvedValue({
        curatedProducts: mockProducts,
        reasoning: ['Perfect for fine dining restaurant', 'Platinum supplier quality'],
        confidence: 0.9,
        platinumSupplierProducts: mockProducts,
        bundledPacks: [],
        localFavorites: [],
        generatedAt: new Date()
      });

      const result = await onboardingUseCase.generateCuratedProducts('customer1');

      expect(result.customerId).toBe('customer1');
      expect(result.products).toEqual(mockProducts);
      expect(result.reasoning).toContain('Perfect for fine dining restaurant');
      expect(result.confidence).toBe(0.9);
      expect(mockAICurationService.determineCustomerSegment).toHaveBeenCalledWith({
        customer: mockCustomer,
        onboardingSession: mockSession,
        allSegments: [mockSegment]
      });
      expect(mockAICurationService.curateProducts).toHaveBeenCalledWith({
        customer: mockCustomer,
        onboardingSession: mockSession,
        customerSegment: mockSegment,
        allProducts: mockProducts,
        maxProducts: 100
      });
    });

    it('should throw error if customer not found', async () => {
      mockCustomerRepository.findById.mockResolvedValue(null);

      await expect(onboardingUseCase.generateCuratedProducts('nonexistent'))
        .rejects.toThrow(CustomError);
    });

    it('should throw error if onboarding session not found', async () => {
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockOnboardingRepository.findByCustomerId.mockResolvedValue(null);

      await expect(onboardingUseCase.generateCuratedProducts('customer1'))
        .rejects.toThrow(CustomError);
    });
  });

  describe('submitResponse', () => {
    it('should submit response and update session', async () => {
      const sessionId = 'session1';
      const mockSession: OnboardingSession = {
        id: sessionId,
        customerId: 'customer1',
        currentStep: OnboardingStep.VENUE_TYPE,
        responses: [],
        curatedProducts: [],
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      mockOnboardingRepository.findById.mockResolvedValue(mockSession);
      mockOnboardingRepository.update.mockImplementation(async (id, session) => session);

      const result = await onboardingUseCase.submitResponse({
        sessionId,
        step: OnboardingStep.VENUE_TYPE,
        answer: 'restaurant'
      });

      expect(result.responses).toHaveLength(1);
      expect(result.responses[0].step).toBe(OnboardingStep.VENUE_TYPE);
      expect(result.responses[0].answer).toBe('restaurant');
      expect(mockOnboardingRepository.update).toHaveBeenCalledWith(sessionId, expect.any(Object));
    });

    it('should generate curated products on last step', async () => {
      const sessionId = 'session1';
      const mockSession: OnboardingSession = {
        id: sessionId,
        customerId: 'customer1',
        currentStep: OnboardingStep.PRODUCT_SELECTION,
        responses: [],
        curatedProducts: [],
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

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
        onboardingStatus: 'in_progress' as any,
        preferences: {
          preferredSuppliers: [],
          budgetRange: { min: 1000, max: 10000 },
          productCategories: ['wine'],
          deliveryFrequency: 'weekly'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockOnboardingRepository.findById.mockResolvedValue(mockSession);
      mockOnboardingRepository.update.mockImplementation(async (id, session) => session);
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockOnboardingRepository.findByCustomerId.mockResolvedValue(mockSession);
      mockProductRepository.findActiveProducts.mockResolvedValue([]);
      mockSegmentationService.getSegmentsByCriteria.mockResolvedValue([]);
      
      mockAICurationService.determineCustomerSegment.mockResolvedValue({
        recommendedSegment: {} as CustomerSegment,
        reasoning: 'Test reasoning',
        confidence: 0.8,
        alternativeSegments: []
      });

      mockAICurationService.curateProducts.mockResolvedValue({
        curatedProducts: [],
        reasoning: ['Test reasoning'],
        confidence: 0.8,
        platinumSupplierProducts: [],
        bundledPacks: [],
        localFavorites: [],
        generatedAt: new Date()
      });

      const result = await onboardingUseCase.submitResponse({
        sessionId,
        step: OnboardingStep.PRODUCT_SELECTION,
        answer: 'selected'
      });

      expect(result.currentStep).toBe(OnboardingStep.COMPLETION);
      expect(mockAICurationService.curateProducts).toHaveBeenCalled();
    });

    it('should throw error if session not found', async () => {
      mockOnboardingRepository.findById.mockResolvedValue(null);

      await expect(onboardingUseCase.submitResponse({
        sessionId: 'nonexistent',
        step: OnboardingStep.VENUE_TYPE,
        answer: 'restaurant'
      })).rejects.toThrow(CustomError);
    });

    it('should throw error if session is not active', async () => {
      const mockSession: OnboardingSession = {
        id: 'session1',
        customerId: 'customer1',
        currentStep: OnboardingStep.VENUE_TYPE,
        responses: [],
        curatedProducts: [],
        status: OnboardingSessionStatus.COMPLETED,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      mockOnboardingRepository.findById.mockResolvedValue(mockSession);

      await expect(onboardingUseCase.submitResponse({
        sessionId: 'session1',
        step: OnboardingStep.VENUE_TYPE,
        answer: 'restaurant'
      })).rejects.toThrow(CustomError);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding and update customer status', async () => {
      const sessionId = 'session1';
      const mockSession: OnboardingSession = {
        id: sessionId,
        customerId: 'customer1',
        currentStep: OnboardingStep.COMPLETION,
        responses: [],
        curatedProducts: [],
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      mockOnboardingRepository.findById.mockResolvedValue(mockSession);
      mockOnboardingRepository.update.mockImplementation(async (id, session) => session);
      mockCustomerRepository.update.mockResolvedValue({} as Customer);

      const result = await onboardingUseCase.completeOnboarding(sessionId);

      expect(result.status).toBe(OnboardingSessionStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
      expect(mockCustomerRepository.update).toHaveBeenCalledWith('customer1', {
        onboardingStatus: 'completed'
      });
    });
  });

  describe('getOnboardingProgress', () => {
    it('should return progress information', async () => {
      const sessionId = 'session1';
      const mockSession: OnboardingSession = {
        id: sessionId,
        customerId: 'customer1',
        currentStep: OnboardingStep.CUISINE_STYLE,
        responses: [
          {
            step: OnboardingStep.VENUE_TYPE,
            question: 'What type of venue do you operate?',
            answer: 'restaurant',
            timestamp: new Date()
          }
        ],
        curatedProducts: [],
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: new Date(),
        lastActivityAt: new Date()
      };

      mockOnboardingRepository.findById.mockResolvedValue(mockSession);

      const result = await onboardingUseCase.getOnboardingProgress(sessionId);

      expect(result.currentStep).toBe(OnboardingStep.CUISINE_STYLE);
      expect(result.completedSteps).toContain(OnboardingStep.VENUE_TYPE);
      expect(result.progressPercentage).toBeGreaterThan(0);
    });
  });
});
