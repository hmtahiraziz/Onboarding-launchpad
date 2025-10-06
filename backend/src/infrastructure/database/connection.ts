import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { logger } from '../../shared/utils/logger';
import { Customer } from './entities/Customer';
import { OnboardingSession } from './entities/OnboardingSession';
import { Product } from './entities/Product';
import { Questionnaire } from './entities/Questionnaire';
import { Question } from './entities/Question';
import { QuestionnaireResponse } from './entities/QuestionnaireResponse';

let dataSource: DataSource;

export async function connectDatabase(): Promise<DataSource> {
  try {
    if (dataSource && dataSource.isInitialized) {
      return dataSource;
    }

    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'paramount_launchpad',
      entities: [Customer, OnboardingSession, Product, Questionnaire, Question, QuestionnaireResponse],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      migrations: ['src/infrastructure/database/migrations/*.ts'],
      migrationsRun: false,
    });

    await dataSource.initialize();

    logger.info('✅ Connected to PostgreSQL successfully');

    return dataSource;

  } catch (error) {
    logger.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

export function getDataSource(): DataSource {
  if (!dataSource || !dataSource.isInitialized) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return dataSource;
}

export async function disconnectDatabase(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    logger.info('Disconnected from PostgreSQL');
  }
}
