import { 
  OnboardingSession, 
  StartOnboardingRequest, 
  SubmitOnboardingResponseRequest,
  OnboardingProgress,
  OnboardingQuestion,
  CuratedProductSet
} from '../entities/OnboardingSession';

export interface IOnboardingRepository {
  startOnboarding(request: StartOnboardingRequest): Promise<OnboardingSession>;
  getOnboardingSession(sessionId: string): Promise<OnboardingSession>;
  submitResponse(request: SubmitOnboardingResponseRequest): Promise<OnboardingSession>;
  getOnboardingProgress(sessionId: string): Promise<OnboardingProgress>;
  getNextQuestion(sessionId: string): Promise<OnboardingQuestion>;
  generateCuratedProducts(sessionId: string): Promise<CuratedProductSet>;
  completeOnboarding(sessionId: string): Promise<OnboardingSession>;
  abandonOnboarding(sessionId: string): Promise<OnboardingSession>;
}
