import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Customer } from '../infrastructure/database/entities/Customer';
import { OnboardingSession } from '../infrastructure/database/entities/OnboardingSession';
import { Questionnaire } from '../infrastructure/database/entities/Questionnaire';
import { Question } from '../infrastructure/database/entities/Question';
import { QuestionnaireResponse } from '../infrastructure/database/entities/QuestionnaireResponse';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'paramount_launchpad',
  entities: [Customer, OnboardingSession, Questionnaire, Question, QuestionnaireResponse],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();

    console.log('🚀 Running migrations...');
    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('✅ No new migrations to run');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    }

    console.log('🎉 Migration process completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigrations();
