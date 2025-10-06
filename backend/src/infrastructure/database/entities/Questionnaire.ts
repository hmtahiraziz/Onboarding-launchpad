import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { Question } from './Question';
import { QuestionnaireResponse } from './QuestionnaireResponse';

export enum QuestionnaireStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ARCHIVED = 'archived',
}

@Entity('questionnaires')
@Index(['status'])
@Index(['createdBy'])
@Index(['createdAt'])
export class Questionnaire {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: QuestionnaireStatus,
        default: QuestionnaireStatus.DRAFT,
    })
    status!: QuestionnaireStatus;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ length: 255, nullable: true })
    createdBy?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Question, (question) => question.questionnaire, {
        cascade: true,
        eager: false,
    })
    questions!: Question[];

    @OneToMany(() => QuestionnaireResponse, (response) => response.questionnaire, {
        cascade: true,
        eager: false,
    })
    responses!: QuestionnaireResponse[];
}
