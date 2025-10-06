import { DynamicForm, DynamicFormSubmission } from '@/domain/entities/DynamicForm';
import { IDynamicFormRepository } from '@/domain/repositories/IDynamicFormRepository';
import { apiClient } from '../api/apiClient';

export class DynamicFormRepository implements IDynamicFormRepository {
  async getFormByQuestionnaireId(questionnaireId: string): Promise<DynamicForm> {
    const response = await apiClient.get<any>(`/questionnaires/${questionnaireId}/form`);
    if (!(response as any).success || !(response as any).data) {
      throw new Error((response as any).error || 'Failed to get dynamic form');
    }
    return (response as any).data;
  }

  async submitFormResponse(submission: DynamicFormSubmission): Promise<DynamicFormSubmission> {
    const response = await apiClient.post<any>('/forms/submit', submission);
    if (!(response as any).success || !(response as any).data) {
      throw new Error((response as any).error || 'Failed to submit form response');
    }
    return (response as any).data;
  }

  async getFormProgress(formId: string, customerId: string): Promise<{
    currentStep: number;
    completedSteps: number[];
    progressPercentage: number;
    responses: any[];
  }> {
    const response = await apiClient.get<any>(`/forms/${formId}/progress/${customerId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get form progress');
    }
    return response.data;
  }

  async saveFormProgress(formId: string, customerId: string, step: number, responses: any[]): Promise<void> {
    const response = await apiClient.post<any>(`/forms/${formId}/progress`, {
      customerId,
      step,
      responses
    });
    if (!(response as any).success) {
      throw new Error((response as any).error || 'Failed to save form progress');
    }
  }
}
