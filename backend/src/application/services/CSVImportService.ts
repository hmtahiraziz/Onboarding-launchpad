import { Questionnaire, Question } from '../../domain/entities/Questionnaire';
import { CreateQuestionnaireRequest } from '../../domain/entities/Questionnaire';
import { CustomError } from '../../shared/middleware/errorHandler';

export interface CSVQuestionRow {
    title: string;
    description: string;
    type: string;
    options: string;
    isRequired: string;
    order: string;
}

export class CSVImportService {
    /**
     * Parse CSV content and convert to questionnaire format
     */
    static parseCSVContent(csvContent: string): CreateQuestionnaireRequest {
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new CustomError('CSV must have at least a header row and one data row', 400);
        }

        const headers = this.parseCSVLine(lines[0]);
        const questions: Question[] = [];

        // Process each data row
        for (let i = 1; i < lines.length; i++) {
            const row = this.parseCSVLine(lines[i]);
            const question = this.parseQuestionRow(row, headers);
            questions.push(question);
        }

        if (questions.length === 0) {
            throw new CustomError('No valid questions found in CSV', 400);
        }

        return {
            title: 'Imported Questionnaire',
            description: 'Questionnaire imported from CSV file',
            questions: questions,
            status: 'draft' as any
        };
    }

    /**
     * Parse a single CSV line, handling quoted fields
     */
    private static parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Parse a single question row from CSV
     */
    private static parseQuestionRow(row: string[], headers: string[]): Question {
        const questionData: any = {};
        
        // Map CSV columns to question properties
        headers.forEach((header, index) => {
            if (row[index] !== undefined) {
                questionData[header.trim()] = row[index].trim();
            }
        });

        // Validate required fields
        if (!questionData.title) {
            throw new CustomError('Question title is required', 400);
        }

        if (!questionData.type) {
            throw new CustomError('Question type is required', 400);
        }

        // Validate question type
        const validTypes = ['text', 'textarea', 'radio', 'checkbox', 'dropdown', 'number', 'date'];
        if (!validTypes.includes(questionData.type)) {
            throw new CustomError(`Invalid question type: ${questionData.type}. Valid types are: ${validTypes.join(', ')}`, 400);
        }

        // Parse options for select-type questions
        let options: string[] = [];
        if (['radio', 'checkbox', 'dropdown'].includes(questionData.type)) {
            if (questionData.options) {
                options = questionData.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt);
            }
            if (options.length === 0) {
                throw new CustomError(`Options are required for question type: ${questionData.type}`, 400);
            }
        }

        // Parse boolean fields
        const isRequired = questionData.isRequired === 'true' || questionData.isRequired === '1';
        const order = parseInt(questionData.order) || 0;

        return {
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate temporary ID
            questionnaireId: '', // Will be set when questionnaire is created
            title: questionData.title,
            description: questionData.description || '',
            type: questionData.type as any,
            options: options,
            isRequired: isRequired,
            order: order,
            status: 'active',
            isHidden: false,
            conditionalLogic: null as any,
            validationRules: {
                required: isRequired
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    /**
     * Validate CSV structure
     */
    static validateCSVStructure(csvContent: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        try {
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                errors.push('CSV must have at least a header row and one data row');
                return { isValid: false, errors };
            }

            const headers = this.parseCSVLine(lines[0]);
            const requiredHeaders = ['title', 'type'];
            
            for (const requiredHeader of requiredHeaders) {
                if (!headers.includes(requiredHeader)) {
                    errors.push(`Missing required header: ${requiredHeader}`);
                }
            }

            // Validate each data row
            for (let i = 1; i < lines.length; i++) {
                try {
                    const row = this.parseCSVLine(lines[i]);
                    this.parseQuestionRow(row, headers);
                } catch (error) {
                    errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
                }
            }

            return { isValid: errors.length === 0, errors };
        } catch (error) {
            errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return { isValid: false, errors };
        }
    }
}
