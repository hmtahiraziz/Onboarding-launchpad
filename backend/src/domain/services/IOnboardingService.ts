import { OnboardingSession, OnboardingStep, OnboardingResponse, CuratedProductSet } from '../entities/OnboardingSession';
import { Customer } from '../entities/Customer';
import { Product } from '../entities/Product';

export interface StartOnboardingRequest {
  customerId: string;
}

export interface SubmitOnboardingResponseRequest {
  sessionId: string;
  step: OnboardingStep;
  answer: string | string[];
}

export interface IOnboardingService {
  startOnboarding(request: StartOnboardingRequest): Promise<OnboardingSession>;
  getOnboardingSession(sessionId: string): Promise<OnboardingSession>;
  submitResponse(request: SubmitOnboardingResponseRequest): Promise<OnboardingSession>;
  generateCuratedProducts(customerId: string): Promise<CuratedProductSet>;
  completeOnboarding(sessionId: string): Promise<OnboardingSession>;
  abandonOnboarding(sessionId: string): Promise<OnboardingSession>;
  getOnboardingProgress(sessionId: string): Promise<{
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    progressPercentage: number;
  }>;
  getNextQuestion(sessionId: string): Promise<{
    step: OnboardingStep;
    question: string;
    type: 'single' | 'multiple' | 'text' | 'location';
    options?: string[];
  }>;
}
