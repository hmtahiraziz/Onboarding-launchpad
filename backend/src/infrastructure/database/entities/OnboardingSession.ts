import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from './Customer';
import {
  OnboardingStep,
  OnboardingSessionStatus,
  OnboardingResponse,
} from '@/domain/entities/OnboardingSession';

@Entity('onboarding_sessions')
@Index(['customerId'])
@Index(['status'])
@Index(['lastActivityAt'])
export class OnboardingSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  customerId!: string;

  @ManyToOne(() => Customer, (customer) => customer.onboardingSessions)
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({
    type: 'enum',
    enum: OnboardingStep,
    default: OnboardingStep.WELCOME,
  })
  currentStep!: OnboardingStep;

  @Column('jsonb', { default: '[]' })
  responses!: OnboardingResponse[];

  @Column('jsonb', { default: '[]' })
  curatedProducts!: any[]; // We'll keep this as any[] since we're not touching Product entities

  @Column({
    type: 'enum',
    enum: OnboardingSessionStatus,
    default: OnboardingSessionStatus.ACTIVE,
  })
  status!: OnboardingSessionStatus;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @UpdateDateColumn()
  lastActivityAt!: Date;
}
