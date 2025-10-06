import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCustomerIndexes1700000005006 implements MigrationInterface {
  name = 'FixCustomerIndexes1700000005006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop any existing problematic indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_tier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_venueType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_location_city"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_location_state"`);
    
    // Drop old indexes if they exist
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_tier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_venueType"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the indexes if needed
    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_tier" 
      ON "customers" USING GIN (("businessProfile"->>'tier'))
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_venueType" 
      ON "customers" USING GIN (("businessProfile"->>'venueType'))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_location_city" 
      ON "customers" USING GIN (("businessProfile"->'location'->>'city'))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_location_state" 
      ON "customers" USING GIN (("businessProfile"->'location'->>'state'))
    `);
  }
}
