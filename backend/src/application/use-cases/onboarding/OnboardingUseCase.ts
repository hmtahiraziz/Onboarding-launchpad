import { v4 as uuidv4 } from 'uuid';
import { 
  OnboardingSession, 
  OnboardingStep, 
  OnboardingSessionStatus,
  OnboardingResponse,
  CuratedProductSet
} from '@/domain/entities/OnboardingSession';
import { IOnboardingRepository } from '@/domain/repositories/IOnboardingRepository';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IOnboardingService, StartOnboardingRequest, SubmitOnboardingResponseRequest } from '@/domain/services/IOnboardingService';
import { IAIProductCurationService } from '@/domain/services/IAIProductCurationService';
import { CustomError } from '@/shared/middleware/errorHandler';

export class OnboardingUseCase implements IOnboardingService {
  constructor(
    private onboardingRepository: IOnboardingRepository,
    private customerRepository: ICustomerRepository,
    private productRepository: IProductRepository,
    private aiCurationService: IAIProductCurationService
  ) {}

  async startOnboarding(request: StartOnboardingRequest): Promise<OnboardingSession> {
    // Check if customer exists
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    // Check if there's already an active session
    const existingSession = await this.onboardingRepository.findByCustomerId(request.customerId);
    if (existingSession && existingSession.status === OnboardingSessionStatus.ACTIVE) {
      return existingSession;
    }

    // Create new onboarding session
    const session: OnboardingSession = {
      id: uuidv4(),
      customerId: request.customerId,
      currentStep: OnboardingStep.WELCOME,
      responses: [],
      curatedProducts: [],
      status: OnboardingSessionStatus.ACTIVE,
      startedAt: new Date(),
      lastActivityAt: new Date()
    };

    return await this.onboardingRepository.save(session);
  }

  async getOnboardingSession(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingRepository.findById(sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }
    return session;
  }

  async submitResponse(request: SubmitOnboardingResponseRequest): Promise<OnboardingSession> {
    const session = await this.onboardingRepository.findById(request.sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    if (session.status !== OnboardingSessionStatus.ACTIVE) {
      throw new CustomError('Onboarding session is not active', 400);
    }

    // Create response object
    const response: OnboardingResponse = {
      step: request.step,
      question: this.getQuestionForStep(request.step),
      answer: request.answer,
      timestamp: new Date()
    };

    // Update session
    const updatedSession = {
      ...session,
      responses: [...session.responses, response],
      currentStep: this.getNextStep(request.step),
      lastActivityAt: new Date()
    };

    // If this is the last step, generate curated products
    if (this.getNextStep(request.step) === OnboardingStep.COMPLETION) {
      const curatedProducts = await this.generateCuratedProducts(session.customerId);
      updatedSession.curatedProducts = curatedProducts.products;
    }

    const result = await this.onboardingRepository.update(request.sessionId, updatedSession);
    if (!result) {
      throw new CustomError('Failed to update onboarding session', 500);
    }
    return result;
  }

  async generateCuratedProducts(customerId: string): Promise<CuratedProductSet> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    // Get the onboarding session to access responses
    const session = await this.onboardingRepository.findByCustomerId(customerId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    // Use AI to curate products based on business profile
    const curationResult = await this.aiCurationService.curateProducts({
      customer,
      maxProducts: 100
    });

    return {
      customerId,
      products: curationResult.curatedProducts,
      reasoning: curationResult.reasoning,
      confidence: curationResult.confidence,
      generatedAt: curationResult.generatedAt
    };
  }

  async completeOnboarding(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingRepository.findById(sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    const updatedSession = {
      ...session,
      status: OnboardingSessionStatus.COMPLETED,
      completedAt: new Date(),
      lastActivityAt: new Date()
    };

    // Update customer onboarding status
    await this.customerRepository.update(session.customerId, {
      onboardingStatus: 'completed' as any
    });

    const result = await this.onboardingRepository.update(sessionId, updatedSession);
    if (!result) {
      throw new CustomError('Failed to complete onboarding session', 500);
    }
    return result;
  }

  async abandonOnboarding(sessionId: string): Promise<OnboardingSession> {
    const session = await this.onboardingRepository.findById(sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    const updatedSession = {
      ...session,
      status: OnboardingSessionStatus.ABANDONED,
      lastActivityAt: new Date()
    };

    const result = await this.onboardingRepository.update(sessionId, updatedSession);
    if (!result) {
      throw new CustomError('Failed to abandon onboarding session', 500);
    }
    return result;
  }

  async getOnboardingProgress(sessionId: string): Promise<{
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    progressPercentage: number;
  }> {
    const session = await this.onboardingRepository.findById(sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    const allSteps = Object.values(OnboardingStep);
    const completedSteps = session.responses.map(r => r.step);
    const progressPercentage = (completedSteps.length / allSteps.length) * 100;

    return {
      currentStep: session.currentStep,
      completedSteps,
      progressPercentage
    };
  }

  async getNextQuestion(sessionId: string): Promise<{
    step: OnboardingStep;
    question: string;
    type: 'single' | 'multiple' | 'text' | 'location';
    options?: string[];
  }> {
    const session = await this.onboardingRepository.findById(sessionId);
    if (!session) {
      throw new CustomError('Onboarding session not found', 404);
    }

    return this.getQuestionForStep(session.currentStep);
  }

  private getNextStep(currentStep: OnboardingStep): OnboardingStep {
    const steps = Object.values(OnboardingStep);
    const currentIndex = steps.indexOf(currentStep);
    return steps[currentIndex + 1] || OnboardingStep.COMPLETION;
  }

  private getQuestionForStep(step: OnboardingStep): any {
    const questions = {
      [OnboardingStep.WELCOME]: {
        step,
        question: 'Welcome to Paramount Launchpad! Let\'s get you set up with a personalized product selection.',
        type: 'text' as const
      },
      [OnboardingStep.VENUE_TYPE]: {
        step,
        question: 'What type of venue do you operate?',
        type: 'single' as const,
        options: ['restaurant', 'bar', 'hotel', 'nightclub', 'cafe', 'catering']
      },
      [OnboardingStep.CUISINE_STYLE]: {
        step,
        question: 'What cuisine style best describes your venue?',
        type: 'single' as const,
        options: ['fine dining', 'casual dining', 'fast casual', 'pub food', 'international', 'fusion', 'other']
      },
      [OnboardingStep.LOCATION]: {
        step,
        question: 'Please provide your venue location details.',
        type: 'location' as const
      },
      [OnboardingStep.PREFERENCES]: {
        step,
        question: 'What are your main product preferences?',
        type: 'multiple' as const,
        options: ['spirits', 'wine', 'beer', 'champagne', 'cocktail ingredients', 'non-alcoholic']
      },
      [OnboardingStep.PRODUCT_SELECTION]: {
        step,
        question: 'Review your curated product selection.',
        type: 'multiple' as const
      },
      [OnboardingStep.COMPLETION]: {
        step,
        question: 'Onboarding complete! Your personalized product catalog is ready.',
        type: 'text' as const
      }
    };

    return questions[step];
  }
}
