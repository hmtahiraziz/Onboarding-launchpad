import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomerStructure1700000005005 implements MigrationInterface {
  name = 'UpdateCustomerStructure1700000005005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "customers" 
      ADD COLUMN "businessProfile" jsonb,
      ADD COLUMN "aiResponse" jsonb
    `);

    // Migrate existing data to new structure
    await queryRunner.query(`
      UPDATE "customers" 
      SET "businessProfile" = jsonb_build_object(
        'tier', "tier",
        'venueType', "venueType",
        'cuisineStyle', "cuisineStyle",
        'location', "location"
      )
      WHERE "businessProfile" IS NULL
    `);

    // Make businessProfile NOT NULL after migration
    await queryRunner.query(`
      ALTER TABLE "customers" 
      ALTER COLUMN "businessProfile" SET NOT NULL
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE "customers" 
      DROP COLUMN "tier",
      DROP COLUMN "venueType", 
      DROP COLUMN "cuisineStyle",
      DROP COLUMN "location"
    `);

    // Drop old indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_tier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_venueType"`);

    // Create new indexes for JSONB columns
    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_tier" 
      ON "customers" (("businessProfile"->>'tier'))
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_venueType" 
      ON "customers" (("businessProfile"->>'venueType'))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_location_city" 
      ON "customers" (("businessProfile"->'location'->>'city'))
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_businessProfile_location_state" 
      ON "customers" (("businessProfile"->'location'->>'state'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back old columns
    await queryRunner.query(`
      ALTER TABLE "customers" 
      ADD COLUMN "tier" character varying,
      ADD COLUMN "venueType" character varying,
      ADD COLUMN "cuisineStyle" character varying,
      ADD COLUMN "location" jsonb
    `);

    // Migrate data back to old structure
    await queryRunner.query(`
      UPDATE "customers" 
      SET 
        "tier" = "businessProfile"->>'tier',
        "venueType" = "businessProfile"->>'venueType',
        "cuisineStyle" = "businessProfile"->>'cuisineStyle',
        "location" = "businessProfile"->'location'
      WHERE "businessProfile" IS NOT NULL
    `);

    // Make old columns NOT NULL
    await queryRunner.query(`
      ALTER TABLE "customers" 
      ALTER COLUMN "tier" SET NOT NULL,
      ALTER COLUMN "venueType" SET NOT NULL,
      ALTER COLUMN "location" SET NOT NULL
    `);

    // Drop new columns
    await queryRunner.query(`
      ALTER TABLE "customers" 
      DROP COLUMN "businessProfile",
      DROP COLUMN "aiResponse"
    `);

    // Drop new indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_tier"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_venueType"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_location_city"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_businessProfile_location_state"`);

    // Recreate old indexes
    await queryRunner.query(`CREATE INDEX "IDX_customers_tier" ON "customers" ("tier")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_venueType" ON "customers" ("venueType")`);
  }
}
