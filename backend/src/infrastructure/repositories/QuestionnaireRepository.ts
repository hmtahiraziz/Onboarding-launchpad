import { Repository } from 'typeorm';
import { getDataSource } from '../database/connection';
import { Questionnaire as QuestionnaireEntity } from '../database/entities/Questionnaire';
import { Question as QuestionEntity } from '../database/entities/Question';
import { IQuestionnaireRepository } from '../../domain/repositories/IQuestionnaireRepository';
import { Questionnaire, CreateQuestionnaireRequest, UpdateQuestionnaireRequest } from '../../domain/entities/Questionnaire';

export class QuestionnaireRepository implements IQuestionnaireRepository {
    private async getRepository(): Promise<Repository<QuestionnaireEntity>> {
        const dataSource = getDataSource();
        return dataSource.getRepository(QuestionnaireEntity);
    }

    private async getQuestionRepository(): Promise<Repository<QuestionEntity>> {
        const dataSource = getDataSource();
        return dataSource.getRepository(QuestionEntity);
    }

    async findById(id: string): Promise<Questionnaire | null> {
        const repository = await this.getRepository();
        const questionnaire = await repository.findOne({
            where: { id },
            relations: ['questions'],
            order: { questions: { order: 'ASC' } }
        });

        if (!questionnaire) return null;

        return this.mapToDomain(questionnaire);
    }

    async findAll(): Promise<Questionnaire[]> {
        const repository = await this.getRepository();
        const questionnaires = await repository.find({
            relations: ['questions'],
            order: { createdAt: 'DESC', questions: { order: 'ASC' } }
        });

        return questionnaires.map(q => this.mapToDomain(q));
    }

    async findByStatus(status: string): Promise<Questionnaire[]> {
        const repository = await this.getRepository();
        const questionnaires = await repository.find({
            where: { status: status as any },
            relations: ['questions'],
            order: { createdAt: 'DESC', questions: { order: 'ASC' } }
        });

        return questionnaires.map(q => this.mapToDomain(q));
    }

    async findByCreatedBy(createdBy: string): Promise<Questionnaire[]> {
        const repository = await this.getRepository();
        const questionnaires = await repository.find({
            where: { createdBy },
            relations: ['questions'],
            order: { createdAt: 'DESC', questions: { order: 'ASC' } }
        });

        return questionnaires.map(q => this.mapToDomain(q));
    }

    async findActive(): Promise<Questionnaire[]> {
        const repository = await this.getRepository();
        const questionnaires = await repository.find({
            where: { isActive: true, status: 'active' as any },
            relations: ['questions'],
            order: { createdAt: 'DESC', questions: { order: 'ASC' } }
        });

        return questionnaires.map(q => this.mapToDomain(q));
    }

    async create(data: CreateQuestionnaireRequest): Promise<Questionnaire> {
        const repository = await this.getRepository();
        const questionRepository = await this.getQuestionRepository();

        // Create questionnaire
        const questionnaire = repository.create({
            title: data.title,
            description: data.description,
            status: data.status || 'draft' as any,
            isActive: data.isActive ?? true,
            createdBy: data.createdBy,
        });

        const savedQuestionnaire = await repository.save(questionnaire);

        // Create questions
        if (data.questions && data.questions.length > 0) {
            const questions: any[] = data.questions.map((q, index) => {
                const questionData: any = {
                    questionnaireId: savedQuestionnaire.id,
                    title: q.title,
                    description: q.description,
                    type: q.type as any,
                    options: q.options,
                    isRequired: q.isRequired,
                    status: q.status as any,
                    isHidden: q.isHidden,
                    order: q.order || index,
                    validationRules: q.validationRules,
                };
                
                if (q.conditionalLogic) {
                    questionData.conditionalLogic = q.conditionalLogic;
                }
                
                return questionRepository.create(questionData);
            });

            await questionRepository.save(questions);
        }

        return this.findById(savedQuestionnaire.id) as Promise<Questionnaire>;
    }

    async update(id: string, data: UpdateQuestionnaireRequest): Promise<Questionnaire | null> {
        const repository = await this.getRepository();
        const questionRepository = await this.getQuestionRepository();

        const existingQuestionnaire = await repository.findOne({ where: { id } });
        if (!existingQuestionnaire) return null;

        // Update questionnaire
        await repository.update(id, {
            title: data.title,
            description: data.description,
            status: data.status as any,
            isActive: data.isActive,
        });

        // Update questions - delete existing and create new ones
        await questionRepository.delete({ questionnaireId: id });

        if (data.questions && data.questions.length > 0) {
            const questions: any[] = data.questions.map((q, index) => {
                const questionData: any = {
                    questionnaireId: id,
                    title: q.title,
                    description: q.description,
                    type: q.type as any,
                    options: q.options,
                    isRequired: q.isRequired,
                    status: q.status as any,
                    isHidden: q.isHidden,
                    order: q.order || index,
                    validationRules: q.validationRules,
                };
                
                if (q.conditionalLogic) {
                    questionData.conditionalLogic = q.conditionalLogic;
                }
                
                return questionRepository.create(questionData);
            });

            await questionRepository.save(questions);
        }

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const repository = await this.getRepository();
        const result = await repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async exists(id: string): Promise<boolean> {
        const repository = await this.getRepository();
        const count = await repository.count({ where: { id } });
        return count > 0;
    }

    private mapToDomain(entity: QuestionnaireEntity): Questionnaire {
        return {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            status: entity.status,
            isActive: entity.isActive,
            createdBy: entity.createdBy,
            questions: entity.questions?.map(q => ({
                id: q.id,
                questionnaireId: q.questionnaireId,
                title: q.title,
                description: q.description,
                type: q.type as any,
                options: q.options,
                isRequired: q.isRequired,
                status: q.status as any,
                isHidden: q.isHidden,
                order: q.order,
                conditionalLogic: q.conditionalLogic,
                validationRules: q.validationRules,
                createdAt: q.createdAt,
                updatedAt: q.updatedAt,
            })) || [],
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
