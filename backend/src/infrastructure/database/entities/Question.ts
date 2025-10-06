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

export enum QuestionType {
    DROPDOWN = 'dropdown',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    TEXT = 'text',
    TEXTAREA = 'textarea',
    NUMBER = 'number',
    DATE = 'date',
}

export enum QuestionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum ConditionalOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    IS_EMPTY = 'is_empty',
    IS_NOT_EMPTY = 'is_not_empty',
}

export interface ConditionalLogic {
    showIf: string; // Question ID to check
    condition: ConditionalOperator;
    value: string;
}

export interface ValidationRules {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
    customMessage?: string;
}

@Entity('questions')
@Index(['questionnaireId'])
@Index(['questionnaireId', 'order'])
@Index(['status'])
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    questionnaireId!: string;

    @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'questionnaireId' })
    questionnaire!: Questionnaire;

    @Column({ length: 500 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: QuestionType,
    })
    type!: QuestionType;

    @Column('jsonb', { default: '[]', nullable: false })
    options!: string[];

    @Column({ default: false })
    isRequired!: boolean;

    @Column({
        type: 'enum',
        enum: QuestionStatus,
        default: QuestionStatus.ACTIVE,
    })
    status!: QuestionStatus;

    @Column({ default: false })
    isHidden!: boolean;

    @Column({ default: 0 })
    order!: number;

    @Column('jsonb', { nullable: true })
    conditionalLogic?: ConditionalLogic;

    @Column('jsonb', { default: '{}' })
    validationRules!: ValidationRules;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
