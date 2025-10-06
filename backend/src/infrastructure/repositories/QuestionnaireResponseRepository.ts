import { Repository } from 'typeorm';
import { getDataSource } from '../database/connection';
import { QuestionnaireResponse as QuestionnaireResponseEntity } from '../database/entities/QuestionnaireResponse';
import { IQuestionnaireResponseRepository } from '../../domain/repositories/IQuestionnaireResponseRepository';
import { QuestionnaireResponse, CreateQuestionnaireResponseRequest, UpdateQuestionnaireResponseRequest } from '../../domain/entities/QuestionnaireResponse';

export class QuestionnaireResponseRepository implements IQuestionnaireResponseRepository {
    private async getRepository(): Promise<Repository<QuestionnaireResponseEntity>> {
        const dataSource = getDataSource();
        return dataSource.getRepository(QuestionnaireResponseEntity);
    }

    async findById(id: string): Promise<QuestionnaireResponse | null> {
        const repository = await this.getRepository();
        const response = await repository.findOne({
            where: { id },
            relations: ['questionnaire', 'customer']
        });

        if (!response) return null;

        return this.mapToDomain(response);
    }

    async findByQuestionnaireId(questionnaireId: string): Promise<QuestionnaireResponse[]> {
        const repository = await this.getRepository();
        const responses = await repository.find({
            where: { questionnaireId },
            relations: ['questionnaire', 'customer'],
            order: { createdAt: 'DESC' }
        });

        return responses.map(r => this.mapToDomain(r));
    }

    async findByCustomerId(customerId: string): Promise<QuestionnaireResponse[]> {
        const repository = await this.getRepository();
        const responses = await repository.find({
            where: { customerId },
            relations: ['questionnaire', 'customer'],
            order: { createdAt: 'DESC' }
        });

        return responses.map(r => this.mapToDomain(r));
    }

    async findByCustomerAndQuestionnaire(customerId: string, questionnaireId: string): Promise<QuestionnaireResponse | null> {
        const repository = await this.getRepository();
        const response = await repository.findOne({
            where: { customerId, questionnaireId },
            relations: ['questionnaire', 'customer'],
            order: { createdAt: 'DESC' }
        });

        if (!response) return null;

        return this.mapToDomain(response);
    }

    async findByStatus(status: string): Promise<QuestionnaireResponse[]> {
        const repository = await this.getRepository();
        const responses = await repository.find({
            where: { status: status as any },
            relations: ['questionnaire', 'customer'],
            order: { createdAt: 'DESC' }
        });

        return responses.map(r => this.mapToDomain(r));
    }

    async create(data: CreateQuestionnaireResponseRequest): Promise<QuestionnaireResponse> {
        const repository = await this.getRepository();

        const response = repository.create({
            questionnaireId: data.questionnaireId,
            customerId: data.customerId,
            responses: data.responses,
            status: data.status || 'in_progress' as any,
        });

        const savedResponse = await repository.save(response);
        return this.findById(savedResponse.id) as Promise<QuestionnaireResponse>;
    }

    async update(id: string, data: UpdateQuestionnaireResponseRequest): Promise<QuestionnaireResponse | null> {
        const repository = await this.getRepository();

        const existingResponse = await repository.findOne({ where: { id } });
        if (!existingResponse) return null;

        await repository.update(id, {
            responses: data.responses,
            status: data.status as any,
            lastActivityAt: new Date(),
            completedAt: data.status === 'completed' ? new Date() : existingResponse.completedAt,
        });

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

    private mapToDomain(entity: QuestionnaireResponseEntity): QuestionnaireResponse {
        return {
            id: entity.id,
            questionnaireId: entity.questionnaireId,
            customerId: entity.customerId,
            responses: entity.responses,
            status: entity.status as any,
            startedAt: entity.startedAt,
            completedAt: entity.completedAt,
            lastActivityAt: entity.lastActivityAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
