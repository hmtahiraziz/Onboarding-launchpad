import { IQuestionnaireRepository } from '../../../domain/repositories/IQuestionnaireRepository';
import { IQuestionnaireResponseRepository } from '../../../domain/repositories/IQuestionnaireResponseRepository';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { Questionnaire, CreateQuestionnaireRequest, UpdateQuestionnaireRequest } from '../../../domain/entities/Questionnaire';
import { QuestionnaireResponse, CreateQuestionnaireResponseRequest, UpdateQuestionnaireResponseRequest, SubmitAnswerRequest, ResponseStatus } from '../../../domain/entities/QuestionnaireResponse';
import { CustomError } from '../../../shared/middleware/errorHandler';

export class QuestionnaireUseCase {
    constructor(
        private questionnaireRepository: IQuestionnaireRepository,
        private questionnaireResponseRepository: IQuestionnaireResponseRepository,
        private customerRepository: ICustomerRepository
    ) { }

    async createQuestionnaire(data: CreateQuestionnaireRequest): Promise<Questionnaire> {
        try {
            // Validate required fields
            if (!data.title || data.title.trim().length === 0) {
                throw new CustomError('Questionnaire title is required', 400);
            }

            if (!data.questions || data.questions.length === 0) {
                throw new CustomError('At least one question is required', 400);
            }

            // Validate questions
            for (const question of data.questions) {
                if (!question.title || question.title.trim().length === 0) {
                    throw new CustomError('Question title is required', 400);
                }

                if (['dropdown', 'radio', 'checkbox'].includes(question.type) && (!question.options || question.options.length === 0)) {
                    throw new CustomError(`Question "${question.title}" requires options for type ${question.type}`, 400);
                }

                // Validate conditional logic
                if (question.conditionalLogic) {
                    if (!question.conditionalLogic.showIf || !question.conditionalLogic.condition) {
                        throw new CustomError(`Invalid conditional logic for question "${question.title}"`, 400);
                    }
                }
            }

            return await this.questionnaireRepository.create(data);
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to create questionnaire', 500);
        }
    }

    async getQuestionnaire(id: string): Promise<Questionnaire> {
        const questionnaire = await this.questionnaireRepository.findById(id);
        if (!questionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }
        return questionnaire;
    }

    async getAllQuestionnaires(): Promise<Questionnaire[]> {
        return await this.questionnaireRepository.findAll();
    }

    async getActiveQuestionnaires(): Promise<Questionnaire[]> {
        return await this.questionnaireRepository.findActive();
    }

    async getActiveQuestionnaire(): Promise<Questionnaire | null> {
        const activeQuestionnaires = await this.questionnaireRepository.findActive();
        // Return the first active questionnaire (there should only be one)
        return activeQuestionnaires.length > 0 ? activeQuestionnaires[0] : null;
    }

    async updateQuestionnaire(id: string, data: UpdateQuestionnaireRequest): Promise<Questionnaire> {
        const existingQuestionnaire = await this.questionnaireRepository.findById(id);
        if (!existingQuestionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        try {
            // Validate required fields
            if (!data.title || data.title.trim().length === 0) {
                throw new CustomError('Questionnaire title is required', 400);
            }

            if (!data.questions || data.questions.length === 0) {
                throw new CustomError('At least one question is required', 400);
            }

            // Validate questions
            for (const question of data.questions) {
                if (!question.title || question.title.trim().length === 0) {
                    throw new CustomError('Question title is required', 400);
                }

                if (['dropdown', 'radio', 'checkbox'].includes(question.type) && (!question.options || question.options.length === 0)) {
                    throw new CustomError(`Question "${question.title}" requires options for type ${question.type}`, 400);
                }

                // Validate conditional logic
                if (question.conditionalLogic) {
                    if (!question.conditionalLogic.showIf || !question.conditionalLogic.condition) {
                        throw new CustomError(`Invalid conditional logic for question "${question.title}"`, 400);
                    }
                }
            }

            const updatedQuestionnaire = await this.questionnaireRepository.update(id, data);
            if (!updatedQuestionnaire) {
                throw new CustomError('Failed to update questionnaire', 500);
            }

            return updatedQuestionnaire;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to update questionnaire', 500);
        }
    }

    async updateQuestionnaireStatus(id: string, status: string): Promise<Questionnaire> {
        const existingQuestionnaire = await this.questionnaireRepository.findById(id);
        if (!existingQuestionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        // If trying to activate a questionnaire, ensure no other questionnaire is active
        if (status === 'active') {
            const activeQuestionnaires = await this.questionnaireRepository.findActive();
            const otherActiveQuestionnaires = activeQuestionnaires.filter(q => q.id !== id);
            
            if (otherActiveQuestionnaires.length > 0) {
                // Deactivate all other active questionnaires
                for (const questionnaire of otherActiveQuestionnaires) {
                    const deactivateData: UpdateQuestionnaireRequest = {
                        ...questionnaire,
                        status: 'inactive' as any
                    };
                    await this.questionnaireRepository.update(questionnaire.id, deactivateData);
                    console.log(`Deactivated questionnaire ${questionnaire.id} to make room for ${id}`);
                }
            }
        }

        const updateData: UpdateQuestionnaireRequest = {
            ...existingQuestionnaire,
            status: status as any
        };

        const updatedQuestionnaire = await this.questionnaireRepository.update(id, updateData);
        if (!updatedQuestionnaire) {
            throw new CustomError('Failed to update questionnaire status', 500);
        }

        return updatedQuestionnaire;
    }

    async deleteQuestionnaire(id: string): Promise<boolean> {
        const existingQuestionnaire = await this.questionnaireRepository.findById(id);
        if (!existingQuestionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        return await this.questionnaireRepository.delete(id);
    }

    async startQuestionnaireResponse(questionnaireId: string, customerId: string): Promise<QuestionnaireResponse> {
        // Validate questionnaire exists
        const questionnaire = await this.questionnaireRepository.findById(questionnaireId);
        if (!questionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        // Validate customer exists
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new CustomError('Customer not found', 404);
        }

        // Check if customer already has an active response for this questionnaire
        const existingResponse = await this.questionnaireResponseRepository.findByCustomerAndQuestionnaire(customerId, questionnaireId);
        if (existingResponse && existingResponse.status === 'in_progress') {
            return existingResponse;
        }

        // Create new response
        const responseData: CreateQuestionnaireResponseRequest = {
            questionnaireId,
            customerId,
            responses: [],
            status: ResponseStatus.IN_PROGRESS
        };

        return await this.questionnaireResponseRepository.create(responseData);
    }

    async submitAnswer(data: SubmitAnswerRequest): Promise<QuestionnaireResponse> {
        const response = await this.questionnaireResponseRepository.findById(data.responseId);
        if (!response) {
            throw new CustomError('Questionnaire response not found', 404);
        }

        if (response.status !== 'in_progress') {
            throw new CustomError('Cannot submit answer to completed questionnaire', 400);
        }

        // Get questionnaire to validate question exists
        const questionnaire = await this.questionnaireRepository.findById(response.questionnaireId);
        if (!questionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        const question = questionnaire.questions.find(q => q.id === data.questionId);
        if (!question) {
            throw new CustomError('Question not found', 404);
        }

        // Update or add response
        const existingResponseIndex = response.responses.findIndex(r => r.questionId === data.questionId);
        const questionResponse = {
            questionId: data.questionId,
            questionTitle: question.title,
            answer: data.answer,
            answeredAt: new Date(),
            timeSpent: data.timeSpent
        };

        if (existingResponseIndex >= 0) {
            response.responses[existingResponseIndex] = questionResponse;
        } else {
            response.responses.push(questionResponse);
        }

        const updateData: UpdateQuestionnaireResponseRequest = {
            id: data.responseId,
            responses: response.responses,
            status: ResponseStatus.IN_PROGRESS
        };

        const updatedResponse = await this.questionnaireResponseRepository.update(data.responseId, updateData);
        if (!updatedResponse) {
            throw new CustomError('Failed to update response', 500);
        }

        return updatedResponse;
    }

    async completeQuestionnaireResponse(responseId: string): Promise<QuestionnaireResponse> {
        const response = await this.questionnaireResponseRepository.findById(responseId);
        if (!response) {
            throw new CustomError('Questionnaire response not found', 404);
        }

        if (response.status !== 'in_progress') {
            throw new CustomError('Questionnaire response is already completed', 400);
        }

        const updateData: UpdateQuestionnaireResponseRequest = {
            id: responseId,
            responses: response.responses,
            status: ResponseStatus.COMPLETED
        };

        const updatedResponse = await this.questionnaireResponseRepository.update(responseId, updateData);
        if (!updatedResponse) {
            throw new CustomError('Failed to complete response', 500);
        }

        return updatedResponse;
    }

    async getQuestionnaireResponse(responseId: string): Promise<QuestionnaireResponse> {
        const response = await this.questionnaireResponseRepository.findById(responseId);
        if (!response) {
            throw new CustomError('Questionnaire response not found', 404);
        }
        return response;
    }

    async getCustomerResponses(customerId: string): Promise<QuestionnaireResponse[]> {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new CustomError('Customer not found', 404);
        }

        return await this.questionnaireResponseRepository.findByCustomerId(customerId);
    }

    async getQuestionnaireResponses(questionnaireId: string): Promise<QuestionnaireResponse[]> {
        const questionnaire = await this.questionnaireRepository.findById(questionnaireId);
        if (!questionnaire) {
            throw new CustomError('Questionnaire not found', 404);
        }

        return await this.questionnaireResponseRepository.findByQuestionnaireId(questionnaireId);
    }
}
