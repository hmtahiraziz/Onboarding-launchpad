import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateQuestionnairesTable1700000003000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for questionnaires
        await queryRunner.query(`
      CREATE TYPE questionnaire_status AS ENUM ('draft', 'active', 'inactive', 'archived');
    `);

        await queryRunner.query(`
      CREATE TYPE question_type AS ENUM ('dropdown', 'radio', 'checkbox');
    `);

        await queryRunner.query(`
      CREATE TYPE question_status AS ENUM ('active', 'inactive');
    `);

        await queryRunner.query(`
      CREATE TYPE conditional_operator AS ENUM ('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty');
    `);

        // Create questionnaires table
        await queryRunner.createTable(
            new Table({
                name: 'questionnaires',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'questionnaire_status',
                        default: "'draft'",
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'createdBy',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
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

        // Create questions table
        await queryRunner.createTable(
            new Table({
                name: 'questions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'questionnaireId',
                        type: 'uuid',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '500',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'question_type',
                    },
                    {
                        name: 'options',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'",
                    },
                    {
                        name: 'isRequired',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'status',
                        type: 'question_status',
                        default: "'active'",
                    },
                    {
                        name: 'isHidden',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'order',
                        type: 'integer',
                        default: 0,
                    },
                    {
                        name: 'conditionalLogic',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'validationRules',
                        type: 'jsonb',
                        default: "'{}'",
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

        // Create questionnaire_responses table for storing user responses
        await queryRunner.createTable(
            new Table({
                name: 'questionnaire_responses',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'questionnaireId',
                        type: 'uuid',
                    },
                    {
                        name: 'customerId',
                        type: 'uuid',
                    },
                    {
                        name: 'responses',
                        type: 'jsonb',
                        default: "'[]'",
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'in_progress'",
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

        // Create foreign key constraints
        await queryRunner.query(`
      ALTER TABLE questions 
      ADD CONSTRAINT FK_questions_questionnaire 
      FOREIGN KEY ("questionnaireId") 
      REFERENCES questionnaires(id) 
      ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE questionnaire_responses 
      ADD CONSTRAINT FK_questionnaire_responses_questionnaire 
      FOREIGN KEY ("questionnaireId") 
      REFERENCES questionnaires(id) 
      ON DELETE CASCADE
    `);

        await queryRunner.query(`
      ALTER TABLE questionnaire_responses 
      ADD CONSTRAINT FK_questionnaire_responses_customer 
      FOREIGN KEY ("customerId") 
      REFERENCES customers(id) 
      ON DELETE CASCADE
    `);

        // Create indexes for performance
        await queryRunner.query(`
      CREATE INDEX IDX_questionnaires_status 
      ON questionnaires (status)
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaires_created_by 
      ON questionnaires ("createdBy")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaires_created_at 
      ON questionnaires ("createdAt")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questions_questionnaire_id 
      ON questions ("questionnaireId")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questions_order 
      ON questions ("questionnaireId", "order")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questions_status 
      ON questions (status)
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_questionnaire_id 
      ON questionnaire_responses ("questionnaireId")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_customer_id 
      ON questionnaire_responses ("customerId")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_status 
      ON questionnaire_responses (status)
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_started_at 
      ON questionnaire_responses ("startedAt")
    `);

        // Create composite indexes for common queries
        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_customer_questionnaire 
      ON questionnaire_responses ("customerId", "questionnaireId")
    `);

        // Create JSONB indexes for better query performance
        await queryRunner.query(`
      CREATE INDEX IDX_questions_options_gin 
      ON questions USING GIN (options)
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questions_conditional_logic_gin 
      ON questions USING GIN ("conditionalLogic")
    `);

        await queryRunner.query(`
      CREATE INDEX IDX_questionnaire_responses_responses_gin 
      ON questionnaire_responses USING GIN (responses)
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query('ALTER TABLE questions DROP CONSTRAINT IF EXISTS FK_questions_questionnaire');
        await queryRunner.query('ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS FK_questionnaire_responses_questionnaire');
        await queryRunner.query('ALTER TABLE questionnaire_responses DROP CONSTRAINT IF EXISTS FK_questionnaire_responses_customer');

        // Drop tables in reverse order due to foreign key constraints
        await queryRunner.dropTable('questionnaire_responses');
        await queryRunner.dropTable('questions');
        await queryRunner.dropTable('questionnaires');

        // Drop enum types
        await queryRunner.query('DROP TYPE IF EXISTS questionnaire_status CASCADE');
        await queryRunner.query('DROP TYPE IF EXISTS question_type CASCADE');
        await queryRunner.query('DROP TYPE IF EXISTS question_status CASCADE');
        await queryRunner.query('DROP TYPE IF EXISTS conditional_operator CASCADE');
    }
}
