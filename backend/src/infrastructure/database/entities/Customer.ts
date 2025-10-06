import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OnboardingSession } from './OnboardingSession';
import {
  CustomerTier,
  VenueType,
  OnboardingStatus,
  Location,
  CustomerPreferences,
  BusinessProfile,
  AIResponse,
} from '@/domain/entities/Customer';

@Entity('customers')
@Index(['email'], { unique: true })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column('jsonb')
  businessProfile!: BusinessProfile;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.NOT_STARTED,
  })
  onboardingStatus!: OnboardingStatus;

  @Column('jsonb')
  preferences!: CustomerPreferences;

  @Column('jsonb', { nullable: true })
  aiResponse?: AIResponse;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => OnboardingSession, (session) => session.customer)
  onboardingSessions!: OnboardingSession[];
}
