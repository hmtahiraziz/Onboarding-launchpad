export enum QuestionnaireStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ARCHIVED = 'archived',
}

export interface ConditionalLogic {
    showIf: string; // Question ID to check
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
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

export interface Question {
    id: string;
    questionnaireId: string;
    title: string;
    description?: string;
    type: 'dropdown' | 'radio' | 'checkbox';
    options: string[];
    isRequired: boolean;
    status: 'active' | 'inactive';
    isHidden: boolean;
    order: number;
    conditionalLogic?: ConditionalLogic;
    validationRules: ValidationRules;
    createdAt: Date;
    updatedAt: Date;
}

export interface Questionnaire {
    id: string;
    title: string;
    description?: string;
    status: QuestionnaireStatus;
    isActive: boolean;
    createdBy?: string;
    questions: Question[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateQuestionnaireRequest {
    title: string;
    description?: string;
    status?: QuestionnaireStatus;
    isActive?: boolean;
    createdBy?: string;
    questions: Omit<Question, 'id' | 'questionnaireId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateQuestionnaireRequest {
    id: string;
    title: string;
    description?: string;
    status?: QuestionnaireStatus;
    isActive?: boolean;
    questions: Question[];
}
