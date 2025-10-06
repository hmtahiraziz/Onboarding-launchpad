import { Customer, VenueType } from './Customer';
import { Product } from './Product';

export interface OnboardingSession {
  id: string;
  customerId: string;
  currentStep: OnboardingStep;
  responses: OnboardingResponse[];
  curatedProducts: Product[];
  status: OnboardingSessionStatus;
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
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
  timestamp: Date;
}

export interface OnboardingQuestion {
  step: OnboardingStep;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'location';
  options?: string[];
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface CuratedProductSet {
  customerId: string;
  products: Product[];
  reasoning: string[];
  confidence: number;
  generatedAt: Date;
}
