import { OnboardingSession, OnboardingSessionStatus } from '../entities/OnboardingSession';

export interface IOnboardingRepository {
  findById(id: string): Promise<OnboardingSession | null>;
  findByCustomerId(customerId: string): Promise<OnboardingSession | null>;
  findByStatus(status: OnboardingSessionStatus): Promise<OnboardingSession[]>;
  save(session: OnboardingSession): Promise<OnboardingSession>;
  update(id: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | null>;
  delete(id: string): Promise<boolean>;
  findAbandonedSessions(olderThan: Date): Promise<OnboardingSession[]>;
  findExpiredSessions(): Promise<OnboardingSession[]>;
}
