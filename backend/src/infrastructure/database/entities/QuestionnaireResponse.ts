import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Questionnaire } from './Questionnaire';
import { Customer } from './Customer';

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

@Entity('questionnaire_responses')
@Index(['questionnaireId'])
@Index(['customerId'])
@Index(['status'])
@Index(['startedAt'])
@Index(['customerId', 'questionnaireId'])
export class QuestionnaireResponse {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    questionnaireId!: string;

    @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.responses, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'questionnaireId' })
    questionnaire!: Questionnaire;

    @Column('uuid')
    customerId!: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @Column('jsonb', { default: '[]' })
    responses!: QuestionResponse[];

    @Column({
        type: 'varchar',
        length: 50,
        default: ResponseStatus.IN_PROGRESS,
    })
    status!: ResponseStatus;

    @CreateDateColumn()
    startedAt!: Date;

    @Column({ nullable: true })
    completedAt?: Date;

    @UpdateDateColumn()
    lastActivityAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
