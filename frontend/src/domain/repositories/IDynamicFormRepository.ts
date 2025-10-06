import { DynamicForm, DynamicFormSubmission } from '../entities/DynamicForm';

export interface IDynamicFormRepository {
  getFormByQuestionnaireId(questionnaireId: string): Promise<DynamicForm>;
  submitFormResponse(submission: DynamicFormSubmission): Promise<DynamicFormSubmission>;
  getFormProgress(formId: string, customerId: string): Promise<{
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    responses: any[];
  }>;
  saveFormProgress(formId: string, customerId: string, step: number, responses: any[]): Promise<void>;
}
