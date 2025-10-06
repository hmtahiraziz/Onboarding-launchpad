import { Repository, LessThan } from 'typeorm';
import { OnboardingSession, OnboardingSessionStatus } from '@/domain/entities/OnboardingSession';
import { IOnboardingRepository } from '@/domain/repositories/IOnboardingRepository';
import { OnboardingSession as OnboardingSessionEntity } from '../database/entities/OnboardingSession';
import { getDataSource } from '../database/connection';

export class OnboardingRepository implements IOnboardingRepository {
  private repository: Repository<OnboardingSessionEntity> | null = null;

  private getRepository(): Repository<OnboardingSessionEntity> {
    if (!this.repository) {
      this.repository = getDataSource().getRepository(OnboardingSessionEntity);
    }
    return this.repository;
  }

  async findById(id: string): Promise<OnboardingSession | null> {
    const session = await this.getRepository().findOne({ where: { id } });
    return session ? this.mapToDomain(session) : null;
  }

  async findByCustomerId(customerId: string): Promise<OnboardingSession | null> {
    const session = await this.getRepository().findOne({ 
      where: { customerId } 
    });
    return session ? this.mapToDomain(session) : null;
  }

  async findByStatus(status: OnboardingSessionStatus): Promise<OnboardingSession[]> {
    const sessions = await this.getRepository().find({ where: { status } });
    return sessions.map(session => this.mapToDomain(session));
  }

  async save(session: OnboardingSession): Promise<OnboardingSession> {
    const sessionEntity = this.getRepository().create(session);
    const savedSession = await this.getRepository().save(sessionEntity);
    return this.mapToDomain(savedSession);
  }

  async update(id: string, updates: Partial<OnboardingSession>): Promise<OnboardingSession | null> {
    // Extract only the fields that can be safely updated
    const { curatedProducts, ...safeUpdates } = updates;
    const updateData: any = { ...safeUpdates, lastActivityAt: new Date() };
    
    // Handle curatedProducts separately if it exists
    if (curatedProducts !== undefined) {
      updateData.curatedProducts = curatedProducts;
    }
    
    await this.getRepository().update(id, updateData);
    const updatedSession = await this.getRepository().findOne({ where: { id } });
    return updatedSession ? this.mapToDomain(updatedSession) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.getRepository().delete(id);
    return (result.affected || 0) > 0;
  }

  async findAbandonedSessions(olderThan: Date): Promise<OnboardingSession[]> {
    const sessions = await this.getRepository().find({
      where: {
        status: OnboardingSessionStatus.ACTIVE,
        lastActivityAt: LessThan(olderThan)
      }
    });
    
    return sessions.map(session => this.mapToDomain(session));
  }

  async findExpiredSessions(): Promise<OnboardingSession[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sessions = await this.getRepository().find({
      where: {
        status: OnboardingSessionStatus.ACTIVE,
        startedAt: LessThan(thirtyDaysAgo)
      }
    });
    
    return sessions.map(session => this.mapToDomain(session));
  }

  private mapToDomain(sessionEntity: OnboardingSessionEntity): OnboardingSession {
    return {
      id: sessionEntity.id,
      customerId: sessionEntity.customerId,
      currentStep: sessionEntity.currentStep,
      responses: sessionEntity.responses,
      curatedProducts: sessionEntity.curatedProducts || [],
      status: sessionEntity.status,
      startedAt: sessionEntity.startedAt,
      completedAt: sessionEntity.completedAt,
      lastActivityAt: sessionEntity.lastActivityAt
    };
  }
}
