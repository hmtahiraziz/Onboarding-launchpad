import { config } from 'dotenv';
import { connectDatabase } from '../infrastructure/database/connection';
import { runSeeders } from '../infrastructure/database/seeders';

// Load environment variables
config();

async function seedDummyData() {
  try {
    console.log('🚀 Starting dummy data seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Run all seeders
    await runSeeders();
    
    console.log('🎉 Dummy data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDummyData();
