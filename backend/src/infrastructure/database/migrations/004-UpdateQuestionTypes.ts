import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuestionTypes1700000004000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // The enum already has the correct values, so we just need to ensure
        // the options column is properly configured
        
        // Ensure options column is NOT NULL
        await queryRunner.query(`
            ALTER TABLE questions 
            ALTER COLUMN options SET NOT NULL
        `);

        // Update any questions with empty options to have default options
        await queryRunner.query(`
            UPDATE questions 
            SET options = '["Option 1", "Option 2"]'::jsonb
            WHERE options = '[]'::jsonb OR options IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes
        await queryRunner.query(`
            ALTER TABLE questions 
            ALTER COLUMN options DROP NOT NULL
        `);
    }
}
