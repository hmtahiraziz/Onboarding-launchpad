import 'reflect-metadata';
import { v4 as uuidv4 } from 'uuid';
import { connectDatabase, getDataSource } from '../infrastructure/database/connection';
import { CustomerRepository } from '../infrastructure/repositories/CustomerRepository';
import { OnboardingRepository } from '../infrastructure/repositories/OnboardingRepository';
import { CustomerTier, VenueType, OnboardingStatus } from '../domain/entities/Customer';
import { OnboardingStep, OnboardingSessionStatus } from '../domain/entities/OnboardingSession';

async function testMigration() {
  try {
    console.log('🔄 Testing PostgreSQL migration...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');
    
    
    // Test Customer operations
    console.log('🧪 Testing Customer operations...');
    const customerRepo = new CustomerRepository();
    
    const testCustomer = {
      id: uuidv4(),
      email: `test-${Date.now()}@example.com`,
      name: 'Test Customer',
      businessProfile: {
        tier: CustomerTier.BRONZE,
        venueType: VenueType.RESTAURANT,
        cuisineStyle: 'fine dining',
        location: {
          address: '123 Test St',
          city: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          country: 'Australia'
        },
        businessName: 'Test Restaurant',
        businessDescription: 'A fine dining establishment',
        yearsInBusiness: 5,
        staffCount: 20,
        averageMonthlyRevenue: 50000,
        targetCustomerDemographic: 'High-end diners',
        specialRequirements: ['Organic products', 'Local suppliers']
      },
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 0, max: 10000 },
        productCategories: [],
        deliveryFrequency: 'monthly' as const
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save customer
    const savedCustomer = await customerRepo.save(testCustomer);
    console.log('✅ Customer saved:', savedCustomer.id);
    
    // Find customer by email
    const foundCustomer = await customerRepo.findByEmail('test@example.com');
    console.log('✅ Customer found by email:', foundCustomer?.name);
    
    // Test Onboarding operations
    console.log('🧪 Testing Onboarding operations...');
    const onboardingRepo = new OnboardingRepository();
    
    const testSession = {
      id: uuidv4(),
      customerId: savedCustomer.id,
      currentStep: OnboardingStep.WELCOME,
      responses: [],
      curatedProducts: [],
      status: OnboardingSessionStatus.ACTIVE,
      startedAt: new Date(),
      lastActivityAt: new Date()
    };
    
    // Save onboarding session
    const savedSession = await onboardingRepo.save(testSession);
    console.log('✅ Onboarding session saved:', savedSession.id);
    
    // Find session by customer ID
    const foundSession = await onboardingRepo.findByCustomerId(savedCustomer.id);
    console.log('✅ Session found by customer ID:', foundSession?.id);
    
    // Clean up test data - delete onboarding session first due to foreign key constraint
    await onboardingRepo.delete(savedSession.id);
    await customerRepo.delete(savedCustomer.id);
    console.log('✅ Test data cleaned up');
    
    console.log('🎉 Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  } finally {
    const dataSource = getDataSource();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

testMigration();
