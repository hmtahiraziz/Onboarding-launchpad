import { Product } from './Product';

export interface OnboardingSession {
  id: string;
  customerId: string;
  currentStep: OnboardingStep;
  responses: OnboardingResponse[];
  curatedProducts: Product[];
  status: OnboardingSessionStatus;
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
}

export enum OnboardingStep {
  WELCOME = 'welcome',
  VENUE_TYPE = 'venue_type',
  CUISINE_STYLE = 'cuisine_style',
  LOCATION = 'location',
  PREFERENCES = 'preferences',
  PRODUCT_SELECTION = 'product_selection',
  COMPLETION = 'completion'
}

export enum OnboardingSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired'
}

export interface OnboardingResponse {
  step: OnboardingStep;
  question: string;
  answer: string | string[];
  timestamp: string;
}

export interface OnboardingQuestion {
  step: OnboardingStep;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'location' | 'rating' | 'budget';
  options?: string[];
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  category?: string;
  priority?: number;
  supplierTier?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    venueType?: string[];
    cuisineStyle?: string[];
    budgetRange?: {
      min: number;
      max: number;
    };
    location?: {
      states?: string[];
      cities?: string[];
    };
  };
  productTemplate: string[];
  priority: number;
}

export interface CuratedProductSet {
  customerId: string;
  products: Product[];
  reasoning: string[];
  confidence: number;
  generatedAt: string;
}

export interface StartOnboardingRequest {
  customerId: string;
}

export interface SubmitOnboardingResponseRequest {
  sessionId: string;
  step: OnboardingStep;
  answer: string | string[];
}

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  progressPercentage: number;
}
