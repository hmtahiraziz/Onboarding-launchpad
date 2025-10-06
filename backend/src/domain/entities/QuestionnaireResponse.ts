export enum ResponseStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
    EXPIRED = 'expired',
}

export interface QuestionResponse {
    questionId: string;
    questionTitle: string;
    answer: string | string[] | number | boolean;
    answeredAt: Date;
    timeSpent?: number; // in seconds
}

export interface QuestionnaireResponse {
    id: string;
    questionnaireId: string;
    customerId: string;
    responses: QuestionResponse[];
    status: ResponseStatus;
    startedAt: Date;
    completedAt?: Date;
    lastActivityAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateQuestionnaireResponseRequest {
    questionnaireId: string;
    customerId: string;
    responses: QuestionResponse[];
    status?: ResponseStatus;
}

export interface UpdateQuestionnaireResponseRequest {
    id: string;
    responses: QuestionResponse[];
    status?: ResponseStatus;
}

export interface SubmitAnswerRequest {
    responseId: string;
    questionId: string;
    answer: string | string[] | number | boolean;
    timeSpent?: number;
}
