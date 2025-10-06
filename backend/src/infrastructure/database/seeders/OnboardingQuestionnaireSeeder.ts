import { getDataSource } from '../connection';
import { Questionnaire, QuestionnaireStatus } from '../entities/Questionnaire';
import { Question, QuestionType, QuestionStatus } from '../entities/Question';
import { logger } from '@/shared/utils/logger';

export class OnboardingQuestionnaireSeeder {
  static async seedOnboardingQuestionnaire(): Promise<void> {
    try {
      const dataSource = getDataSource();
      const questionnaireRepository = dataSource.getRepository(Questionnaire);
      const questionRepository = dataSource.getRepository(Question);

      // Check if onboarding questionnaire already exists
      const existingQuestionnaire = await questionnaireRepository.findOne({ 
        where: { title: 'New Customer Onboarding' }
      });

      if (existingQuestionnaire) {
        logger.info('Onboarding questionnaire already exists, skipping...');
        return;
      }

      const onboardingQuestionnaire = {
        title: 'New Customer Onboarding',
        description: 'Comprehensive onboarding questionnaire for new customers to understand their business needs and preferences',
        status: QuestionnaireStatus.ACTIVE,
        isActive: true,
        createdBy: 'system',
        questions: [
          // Step 1: Business Information
          {
            title: 'What type of business do you operate?',
            description: 'Select the category that best describes your business',
            type: QuestionType.DROPDOWN,
            options: [
              'Fine Dining Restaurant',
              'Casual Restaurant',
              'Bar/Pub',
              'Hotel',
              'Cafe',
              'Nightclub',
              'Catering Service',
              'Retail Store',
              'Other'
            ],
            isRequired: true,
            isHidden: false,
            order: 1,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          },
          {
            title: 'How many employees do you have?',
            description: 'This helps us understand your business scale',
            type: QuestionType.RADIO,
            options: [
              '1-5 employees',
              '6-20 employees',
              '21-50 employees',
              '51-100 employees',
              '100+ employees'
            ],
            isRequired: true,
            isHidden: false,
            order: 2,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          },
          {
            title: 'What are your primary product categories?',
            description: 'Select all that apply',
            type: QuestionType.CHECKBOX,
            options: [
              'Spirits (Whiskey, Vodka, Gin, etc.)',
              'Wine (Red, White, Sparkling)',
              'Beer (Craft, Import, Domestic)',
              'Champagne & Sparkling Wine',
              'Premium Spirits',
              'Cocktail Mixers',
              'Non-Alcoholic Beverages',
              'Bar Accessories'
            ],
            isRequired: true,
            isHidden: false,
            order: 3,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          },
          {
            title: 'What is your typical price range per bottle?',
            description: 'Select the range that best fits your customer base',
            type: QuestionType.RADIO,
            options: [
              'Under $20',
              '$20 - $50',
              '$50 - $100',
              '$100 - $200',
              '$200+',
              'Mixed range'
            ],
            isRequired: true,
            isHidden: false,
            order: 4,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          },
          {
            title: 'What is your estimated monthly alcohol purchase volume?',
            description: 'This helps us recommend appropriate quantities',
            type: QuestionType.DROPDOWN,
            options: [
              'Under $1,000',
              '$1,000 - $5,000',
              '$5,000 - $10,000',
              '$10,000 - $25,000',
              '$25,000 - $50,000',
              '$50,000+'
            ],
            isRequired: true,
            isHidden: false,
            order: 5,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          },
          {
            title: 'What are your delivery preferences?',
            description: 'Select all that apply',
            type: QuestionType.CHECKBOX,
            options: [
              'Standard delivery (3-5 business days)',
              'Express delivery (1-2 business days)',
              'Scheduled delivery',
              'Pickup available',
              'Bulk delivery discounts'
            ],
            isRequired: false,
            isHidden: false,
            order: 6,
            status: QuestionStatus.ACTIVE,
            validationRules: {}
          },
          {
            title: 'How would you prefer to be contacted?',
            description: 'Select your preferred communication method',
            type: QuestionType.RADIO,
            options: [
              'Email',
              'Phone',
              'Text message',
              'In-person meeting',
              'Video call'
            ],
            isRequired: true,
            isHidden: false,
            order: 7,
            status: QuestionStatus.ACTIVE,
            validationRules: {
              required: true
            }
          }
        ]
      };

      // Create the questionnaire with questions (cascade will handle questions)
      const questionnaire = questionnaireRepository.create(onboardingQuestionnaire);
      await questionnaireRepository.save(questionnaire);

      logger.info('✅ Onboarding questionnaire seeded successfully');
    } catch (error) {
      logger.error('❌ Error seeding onboarding questionnaire:', error);
      throw error;
    }
  }
}
