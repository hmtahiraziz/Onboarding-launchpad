import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateCustomersTable1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
    `);
    
    await queryRunner.query(`
      CREATE TYPE venue_type AS ENUM ('restaurant', 'bar', 'hotel', 'nightclub', 'cafe', 'catering');
    `);
    
    await queryRunner.query(`
      CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
    `);

    // Create customers table
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'tier',
            type: 'customer_tier',
            default: "'bronze'",
          },
          {
            name: 'venueType',
            type: 'venue_type',
          },
          {
            name: 'cuisineStyle',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'jsonb',
          },
          {
            name: 'onboardingStatus',
            type: 'onboarding_status',
            default: "'not_started'",
          },
          {
            name: 'preferences',
            type: 'jsonb',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX IDX_customers_email 
      ON customers (email)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_customers_tier 
      ON customers (tier)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_customers_venue_type 
      ON customers ("venueType")
    `);

    // Note: JSONB indexes for location fields would be created separately if needed
    // await queryRunner.createIndex(
    //   'customers',
    //   new Index('IDX_customers_location', ['(location->>\'city\')', '(location->>\'state\')'])
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
    
    await queryRunner.query('DROP TYPE IF EXISTS customer_tier CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS venue_type CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS onboarding_status CASCADE');
  }
}
