import { 
  OnboardingSession, 
  StartOnboardingRequest, 
  SubmitOnboardingResponseRequest,
  OnboardingProgress,
  OnboardingQuestion,
  CuratedProductSet
} from '@/domain/entities/OnboardingSession';
import { IOnboardingRepository } from '@/domain/repositories/IOnboardingRepository';
import { apiClient } from '../api/apiClient';

export class OnboardingRepository implements IOnboardingRepository {
  async startOnboarding(request: StartOnboardingRequest): Promise<OnboardingSession> {
    const response = await apiClient.post<OnboardingSession>('/onboarding/start', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to start onboarding');
    }
    return response.data;
  }

  async getOnboardingSession(sessionId: string): Promise<OnboardingSession> {
    const response = await apiClient.get<OnboardingSession>(`/onboarding/session/${sessionId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Onboarding session not found');
    }
    return response.data;
  }

  async submitResponse(request: SubmitOnboardingResponseRequest): Promise<OnboardingSession> {
    const response = await apiClient.post<OnboardingSession>('/onboarding/response', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit response');
    }
    return response.data;
  }

  async getOnboardingProgress(sessionId: string): Promise<OnboardingProgress> {
    const response = await apiClient.get<OnboardingProgress>(`/onboarding/session/${sessionId}/progress`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get onboarding progress');
    }
    return response.data;
  }

  async getNextQuestion(sessionId: string): Promise<OnboardingQuestion> {
    const response = await apiClient.get<OnboardingQuestion>(`/onboarding/session/${sessionId}/next-question`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get next question');
    }
    return response.data;
  }

  async generateCuratedProducts(sessionId: string): Promise<CuratedProductSet> {
    const response = await apiClient.post<CuratedProductSet>(`/onboarding/session/${sessionId}/curated-products`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate curated products');
    }
    return response.data;
  }

  async completeOnboarding(sessionId: string): Promise<OnboardingSession> {
    const response = await apiClient.post<OnboardingSession>(`/onboarding/session/${sessionId}/complete`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to complete onboarding');
    }
    return response.data;
  }

  async abandonOnboarding(sessionId: string): Promise<OnboardingSession> {
    const response = await apiClient.post<OnboardingSession>(`/onboarding/session/${sessionId}/abandon`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to abandon onboarding');
    }
    return response.data;
  }
}
