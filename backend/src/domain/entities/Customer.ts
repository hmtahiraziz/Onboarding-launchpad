export interface Customer {
  id: string;
  email: string;
  name: string;
  businessProfile: BusinessProfile;
  onboardingStatus: OnboardingStatus;
  preferences: CustomerPreferences;
  aiResponse?: AIResponse;
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomerTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export enum VenueType {
  RESTAURANT = 'restaurant',
  BAR = 'bar',
  HOTEL = 'hotel',
  NIGHTCLUB = 'nightclub',
  CAFE = 'cafe',
  CATERING = 'catering'
}

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export interface Location {
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface BusinessProfile extends Record<string, any> {
  // Completely flexible - can contain any business-related data
  // Common fields that might be used:
  // tier?: string;
  // venueType?: string;
  // cuisineStyle?: string;
  // location?: any;
  // businessName?: string;
  // Any other custom fields can be added dynamically
}

export interface AIResponse {
  recommendedProducts?: string[];
  personalizedMessage?: string;
  businessInsights?: string[];
  nextSteps?: string[];
  confidenceScore?: number;
  generatedAt: Date;
}

export interface CustomerPreferences {
  preferredSuppliers: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  productCategories: string[];
  deliveryFrequency: 'weekly' | 'bi-weekly' | 'monthly';
}
