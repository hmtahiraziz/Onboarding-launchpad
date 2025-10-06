import { connectDatabase } from '../infrastructure/database/connection';
import { OnboardingQuestionnaireSeeder } from '../infrastructure/database/seeders/OnboardingQuestionnaireSeeder';
import { logger } from '../shared/utils/logger';

async function seedOnboardingOnly() {
  try {
    console.log('🚀 Starting onboarding questionnaire seeder...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');
    
    // Seed onboarding questionnaire
    await OnboardingQuestionnaireSeeder.seedOnboardingQuestionnaire();
    
    console.log('🎉 Onboarding questionnaire seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding onboarding questionnaire:', error);
    process.exit(1);
  }
}

seedOnboardingOnly();
