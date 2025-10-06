import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateOnboardingSessionsTable1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE onboarding_step AS ENUM ('welcome', 'venue_type', 'cuisine_style', 'location', 'preferences', 'product_selection', 'completion');
    `);
    
    await queryRunner.query(`
      CREATE TYPE onboarding_session_status AS ENUM ('active', 'completed', 'abandoned', 'expired');
    `);

    // Create onboarding_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'onboarding_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'customerId',
            type: 'uuid',
          },
          {
            name: 'currentStep',
            type: 'onboarding_step',
            default: "'welcome'",
          },
          {
            name: 'responses',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'curatedProducts',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'status',
            type: 'onboarding_session_status',
            default: "'active'",
          },
          {
            name: 'startedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lastActivityAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE onboarding_sessions 
      ADD CONSTRAINT FK_onboarding_sessions_customer 
      FOREIGN KEY ("customerId") 
      REFERENCES customers(id) 
      ON DELETE CASCADE
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IDX_onboarding_sessions_customer_id 
      ON onboarding_sessions ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_onboarding_sessions_status 
      ON onboarding_sessions (status)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_onboarding_sessions_last_activity 
      ON onboarding_sessions ("lastActivityAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('onboarding_sessions');
    
    await queryRunner.query('DROP TYPE IF EXISTS onboarding_step CASCADE');
    await queryRunner.query('DROP TYPE IF EXISTS onboarding_session_status CASCADE');
  }
}
