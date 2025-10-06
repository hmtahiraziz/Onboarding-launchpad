export interface DynamicForm {
  id: string;
  title: string;
  description?: string;
  questionnaireId: string;
  steps: FormStep[];
  currentStep: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: DynamicQuestion[];
  order: number;
  isCompleted: boolean;
  isVisible: boolean;
}

export interface DynamicQuestion {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  isRequired: boolean;
  isHidden: boolean;
  order: number;
  validationRules?: ValidationRules;
  conditionalLogic?: ConditionalLogic;
  value?: any;
  error?: string;
}

export type QuestionType = 
  | 'dropdown' 
  | 'radio' 
  | 'checkbox' 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date';

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  customMessage?: string;
}

export interface ConditionalLogic {
  showIf: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}

export interface FormResponse {
  questionId: string;
  answer: any;
  timestamp: string;
}

export interface DynamicFormSubmission {
  formId: string;
  customerId: string;
  responses: FormResponse[];
  completedAt: string;
  timeSpent: number; // in seconds
}
