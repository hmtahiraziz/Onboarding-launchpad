import { Questionnaire, CreateQuestionnaireRequest, UpdateQuestionnaireRequest } from '../entities/Questionnaire';

export interface IQuestionnaireRepository {
    findById(id: string): Promise<Questionnaire | null>;
    findAll(): Promise<Questionnaire[]>;
    findByStatus(status: string): Promise<Questionnaire[]>;
    findByCreatedBy(createdBy: string): Promise<Questionnaire[]>;
    findActive(): Promise<Questionnaire[]>;
    create(data: CreateQuestionnaireRequest): Promise<Questionnaire>;
    update(id: string, data: UpdateQuestionnaireRequest): Promise<Questionnaire | null>;
    delete(id: string): Promise<boolean>;
    exists(id: string): Promise<boolean>;
}
