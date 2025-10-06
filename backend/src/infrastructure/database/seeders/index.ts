import { ProductSeeder } from './ProductSeeder';
import { DummyQuestionnaireSeeder } from './DummyQuestionnaireSeeder';
import { OnboardingQuestionnaireSeeder } from './OnboardingQuestionnaireSeeder';

export async function runSeeders(): Promise<void> {
  try {
    console.log('🌱 Starting database seeders...');
    
    await ProductSeeder.seedProducts();
    await DummyQuestionnaireSeeder.seedDummyQuestionnaires();
    await OnboardingQuestionnaireSeeder.seedOnboardingQuestionnaire();
    
    console.log('✅ All seeders completed successfully');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    throw error;
  }
}
