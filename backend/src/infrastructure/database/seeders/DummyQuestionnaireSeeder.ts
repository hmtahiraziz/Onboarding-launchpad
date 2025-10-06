import { QuestionnaireUseCase } from '@/application/use-cases/questionnaire/QuestionnaireUseCase';
import { QuestionnaireRepository } from '@/infrastructure/repositories/QuestionnaireRepository';
import { CustomerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { QuestionnaireResponseRepository } from '@/infrastructure/repositories/QuestionnaireResponseRepository';
import { QuestionnaireStatus } from '@/domain/entities/Questionnaire';

export class DummyQuestionnaireSeeder {
  static async seedDummyQuestionnaires(): Promise<void> {
    try {
      const questionnaireRepository = new QuestionnaireRepository();
      const customerRepository = new CustomerRepository();
      const questionnaireResponseRepository = new QuestionnaireResponseRepository();
      const questionnaireUseCase = new QuestionnaireUseCase(questionnaireRepository, questionnaireResponseRepository, customerRepository);

      // Clear existing questionnaires
      console.log('🧹 Clearing existing questionnaires...');
      // Note: You might want to add a clear method to your repository

      // Create dummy onboarding questionnaire
      const onboardingQuestionnaire = {
        title: 'Paramount Launchpad - Customer Onboarding',
        description: 'Comprehensive onboarding questionnaire to understand customer needs and preferences for personalized product recommendations.',
        status: QuestionnaireStatus.ACTIVE,
        isActive: true,
        createdBy: 'system',
        questions: [
          {
            title: 'What type of venue do you operate?',
            description: 'This helps us understand your business model and recommend appropriate products.',
            type: 'dropdown' as const,
            options: [
              'Restaurant',
              'Bar',
              'Hotel',
              'Nightclub',
              'Cafe',
              'Catering Service',
              'Event Venue',
              'Other'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 1,
            validationRules: {
              required: true,
              customMessage: 'Please select your venue type'
            }
          },
          {
            title: 'What cuisine style best describes your venue?',
            description: 'Understanding your cuisine helps us recommend relevant products.',
            type: 'dropdown' as const,
            options: [
              'Fine Dining',
              'Casual Dining',
              'Fast Casual',
              'Pub Food',
              'International',
              'Asian',
              'Italian',
              'Mexican',
              'American',
              'Fusion',
              'Other'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 2,
            validationRules: {
              required: true,
              customMessage: 'Please select your cuisine style'
            }
          },
          {
            title: 'What is your estimated monthly beverage budget?',
            description: 'This helps us recommend products within your budget range.',
            type: 'radio' as const,
            options: [
              '$1,000 - $5,000',
              '$5,000 - $10,000',
              '$10,000 - $25,000',
              '$25,000 - $50,000',
              '$50,000+',
              'Prefer not to say'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 3,
            validationRules: {
              required: true,
              customMessage: 'Please select your budget range'
            }
          },
          {
            title: 'Which product categories are most important to your business?',
            description: 'Select all that apply to help us prioritize recommendations.',
            type: 'checkbox' as const,
            options: [
              'Spirits & Liquor',
              'Wine',
              'Beer & Cider',
              'Champagne & Sparkling',
              'Cocktail Ingredients',
              'Non-Alcoholic Beverages',
              'Bar Equipment',
              'Glassware'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 4,
            validationRules: {
              required: true,
              customMessage: 'Please select at least one product category'
            }
          },
          {
            title: 'How many customers do you serve per day on average?',
            description: 'This helps us understand your volume needs.',
            type: 'dropdown' as const,
            options: [
              'Under 50',
              '50 - 100',
              '100 - 200',
              '200 - 500',
              '500 - 1000',
              '1000+'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 5,
            validationRules: {
              required: true,
              customMessage: 'Please select your daily customer volume'
            }
          },
          {
            title: 'What is your preferred delivery frequency?',
            description: 'This helps us plan your delivery schedule.',
            type: 'radio' as const,
            options: [
              'Weekly',
              'Bi-weekly',
              'Monthly',
              'As needed',
              'Seasonal'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 6,
            validationRules: {
              required: true,
              customMessage: 'Please select your preferred delivery frequency'
            }
          },
          {
            title: 'Do you have any specific supplier preferences?',
            description: 'Let us know if you have preferred suppliers or brands.',
            type: 'textarea' as const,
            isRequired: false,
            status: 'active' as const,
            isHidden: false,
            order: 7,
            validationRules: {
              maxLength: 500,
              customMessage: 'Please keep your response under 500 characters'
            }
          },
          {
            title: 'What are your biggest challenges with current suppliers?',
            description: 'Help us understand how we can better serve you.',
            type: 'checkbox' as const,
            options: [
              'Product availability',
              'Delivery reliability',
              'Pricing',
              'Product quality',
              'Customer service',
              'Ordering process',
              'Payment terms',
              'None of the above'
            ],
            isRequired: false,
            status: 'active' as const,
            isHidden: false,
            order: 8,
            validationRules: {}
          }
        ]
      };

      console.log('📝 Creating onboarding questionnaire...');
      const createdQuestionnaire = await questionnaireUseCase.createQuestionnaire(onboardingQuestionnaire);
      console.log(`✅ Created questionnaire: ${createdQuestionnaire.title} (ID: ${createdQuestionnaire.id})`);

      // Create a simple feedback questionnaire
      const feedbackQuestionnaire = {
        title: 'Customer Feedback Survey',
        description: 'Quick feedback survey to improve our service.',
        status: QuestionnaireStatus.ACTIVE,
        isActive: true,
        createdBy: 'system',
        questions: [
          {
            title: 'How would you rate your overall experience with Paramount?',
            description: 'Your feedback helps us improve our service.',
            type: 'radio' as const,
            options: [
              'Excellent',
              'Very Good',
              'Good',
              'Fair',
              'Poor'
            ],
            isRequired: true,
            status: 'active' as const,
            isHidden: false,
            order: 1,
            validationRules: {
              required: true,
              customMessage: 'Please rate your experience'
            }
          },
          {
            title: 'What could we improve?',
            description: 'Select areas where we can do better.',
            type: 'checkbox' as const,
            options: [
              'Product selection',
              'Delivery speed',
              'Customer service',
              'Website experience',
              'Pricing',
              'Product quality',
              'Ordering process',
              'Nothing - everything is great!'
            ],
            isRequired: false,
            status: 'active' as const,
            isHidden: false,
            order: 2,
            validationRules: {}
          },
          {
            title: 'Additional comments or suggestions',
            description: 'Any other feedback you\'d like to share?',
            type: 'textarea' as const,
            isRequired: false,
            status: 'active' as const,
            isHidden: false,
            order: 3,
            validationRules: {
              maxLength: 1000,
              customMessage: 'Please keep your response under 1000 characters'
            }
          }
        ]
      };

      console.log('📝 Creating feedback questionnaire...');
      const createdFeedback = await questionnaireUseCase.createQuestionnaire(feedbackQuestionnaire);
      console.log(`✅ Created questionnaire: ${createdFeedback.title} (ID: ${createdFeedback.id})`);

      console.log('🎉 Dummy questionnaires seeded successfully!');
      
    } catch (error) {
      console.error('❌ Error seeding dummy questionnaires:', error);
      throw error;
    }
  }
}
