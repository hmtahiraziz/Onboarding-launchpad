import { QuestionnaireResponse, CreateQuestionnaireResponseRequest, UpdateQuestionnaireResponseRequest } from '../entities/QuestionnaireResponse';

export interface IQuestionnaireResponseRepository {
    findById(id: string): Promise<QuestionnaireResponse | null>;
    findByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]>;
    findByCustomerId(customerId: string): Promise<QuestionnaireResponse[]>;
    findByCustomerAndQuestionnaire(customerId: string, questionnaireId: string): Promise<QuestionnaireResponse | null>;
    findByStatus(status: string): Promise<QuestionnaireResponse[]>;
    create(data: CreateQuestionnaireResponseRequest): Promise<QuestionnaireResponse>;
    update(id: string, data: UpdateQuestionnaireResponseRequest): Promise<QuestionnaireResponse | null>;
    delete(id: string): Promise<boolean>;
    exists(id: string): Promise<boolean>;
}
