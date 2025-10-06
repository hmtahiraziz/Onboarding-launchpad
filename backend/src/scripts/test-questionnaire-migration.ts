import 'reflect-metadata';
import { connectDatabase, getDataSource } from '../infrastructure/database/connection';
import { QuestionnaireRepository } from '../infrastructure/repositories/QuestionnaireRepository';
import { QuestionnaireResponseRepository } from '../infrastructure/repositories/QuestionnaireResponseRepository';
import { CustomerRepository } from '../infrastructure/repositories/CustomerRepository';
import { v4 as uuidv4 } from 'uuid';

async function testQuestionnaireMigration() {
  try {
    console.log('🔄 Testing Questionnaire migration...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');
    
    // Test Questionnaire operations
    console.log('🧪 Testing Questionnaire operations...');
    const questionnaireRepo = new QuestionnaireRepository();
    
    const testQuestionnaire = {
      title: 'Test Questionnaire',
      description: 'A test questionnaire for migration testing',
      status: 'draft' as any,
      isActive: true,
      createdBy: 'test@example.com',
      questions: [
        {
          title: 'What is your name?',
          description: 'Please enter your full name',
          type: 'text' as any,
          options: [],
          isRequired: true,
          status: 'active' as any,
          isHidden: false,
          order: 0,
          validationRules: {
            required: true,
            minLength: 2,
            maxLength: 100
          }
        },
        {
          title: 'What type of venue do you operate?',
          description: 'Select the type that best describes your business',
          type: 'radio' as any,
          options: ['Restaurant', 'Bar', 'Hotel', 'Nightclub', 'Cafe', 'Catering'],
          isRequired: true,
          status: 'active' as any,
          isHidden: false,
          order: 1,
          validationRules: {
            required: true
          }
        }
      ]
    };
    
    // Create questionnaire
    const savedQuestionnaire = await questionnaireRepo.create(testQuestionnaire);
    console.log('✅ Questionnaire created:', savedQuestionnaire.id);
    console.log('✅ Questions created:', savedQuestionnaire.questions.length);
    
    // Test QuestionnaireResponse operations
    console.log('🧪 Testing QuestionnaireResponse operations...');
    const responseRepo = new QuestionnaireResponseRepository();
    const customerRepo = new CustomerRepository();
    
    // Create a test customer first
    const testCustomer = {
      id: uuidv4(),
      email: `test-customer-${Date.now()}@example.com`,
      name: 'Test Customer',
      tier: 'bronze' as any,
      venueType: 'restaurant' as any,
      cuisineStyle: 'fine dining',
      location: {
        address: '123 Test St',
        city: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        country: 'Australia'
      },
      onboardingStatus: 'not_started' as any,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 0, max: 10000 },
        productCategories: [],
        deliveryFrequency: 'monthly' as const
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const savedCustomer = await customerRepo.save(testCustomer);
    console.log('✅ Test customer created:', savedCustomer.id);
    
    // Create questionnaire response
    const testResponse = {
      questionnaireId: savedQuestionnaire.id,
      customerId: savedCustomer.id,
      responses: [
        {
          questionId: savedQuestionnaire.questions[0].id,
          questionTitle: savedQuestionnaire.questions[0].title,
          answer: 'John Doe',
          answeredAt: new Date(),
          timeSpent: 10
        },
        {
          questionId: savedQuestionnaire.questions[1].id,
          questionTitle: savedQuestionnaire.questions[1].title,
          answer: 'Restaurant',
          answeredAt: new Date(),
          timeSpent: 15
        }
      ],
      status: 'completed' as any
    };
    
    const savedResponse = await responseRepo.create(testResponse);
    console.log('✅ Questionnaire response created:', savedResponse.id);
    console.log('✅ Responses saved:', savedResponse.responses.length);
    
    // Test retrieval
    const retrievedQuestionnaire = await questionnaireRepo.findById(savedQuestionnaire.id);
    console.log('✅ Questionnaire retrieved:', retrievedQuestionnaire?.title);
    
    const retrievedResponse = await responseRepo.findById(savedResponse.id);
    console.log('✅ Response retrieved:', retrievedResponse?.id);
    
    // Clean up test data
    await responseRepo.delete(savedResponse.id);
    await questionnaireRepo.delete(savedQuestionnaire.id);
    await customerRepo.delete(savedCustomer.id);
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 Questionnaire migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Questionnaire migration test failed:', error);
    process.exit(1);
  } finally {
    const dataSource = getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

testQuestionnaireMigration();
