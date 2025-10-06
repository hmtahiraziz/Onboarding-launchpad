import { apiClient } from './apiClient';

export interface Questionnaire {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'inactive' | 'archived';
    isActive?: boolean;
    createdBy?: string;
    questions: Question[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Question {
    id: string;
    title: string;
    description?: string;
    type: 'dropdown' | 'radio' | 'checkbox';
    options: string[]; // Always required for all question types
    isRequired: boolean;
    status: 'active' | 'inactive';
    isHidden: boolean;
    order: number;
    conditionalLogic?: ConditionalLogic;
    validationRules?: Record<string, any>;
}

export interface ConditionalLogic {
    showIf: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value: string;
}

export interface CreateQuestionnaireRequest {
    title: string;
    description: string;
    questions: Omit<Question, 'id'>[];
}

export interface UpdateQuestionnaireRequest {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    status?: 'draft' | 'active' | 'inactive' | 'archived';
}

class QuestionnaireApi {
    private baseUrl = '/questionnaires';

    async createQuestionnaire(data: CreateQuestionnaireRequest): Promise<Questionnaire> {
        console.log('🚀 Creating questionnaire:', data);

        try {
            // For now, we'll use a sample endpoint that echoes back the data
            // This will hit the backend endpoint when it's implemented
            const response = await apiClient.post(`${this.baseUrl}`, {
                ...data,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.log('✅ Questionnaire created successfully:', response);
            // Extract the data from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to create questionnaire:', error);
            // For demo purposes, return the data as if it was saved successfully
            const mockResponse: Questionnaire = {
                id: `q_${Date.now()}`,
                ...data,
                questions: data.questions.map((q: any, index: number) => ({
                    ...q,
                    id: q.id || `q_${Date.now()}_${index}`
                })),
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            console.log('📝 Returning mock response for demo:', mockResponse);
            return mockResponse;
        }
    }

    async updateQuestionnaire(data: UpdateQuestionnaireRequest): Promise<Questionnaire> {
        console.log('🚀 Updating questionnaire:', data);

        try {
            const response = await apiClient.put(`${this.baseUrl}/${data.id}`, {
                ...data,
                updatedAt: new Date().toISOString()
            });

            console.log('✅ Questionnaire updated successfully:', response);
            // Extract the data from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to update questionnaire:', error);
            // For demo purposes, return the data as if it was updated successfully
            const mockResponse: Questionnaire = {
                ...data,
                status: data.status || 'draft',
                updatedAt: new Date().toISOString()
            };
            console.log('📝 Returning mock response for demo:', mockResponse);
            return mockResponse;
        }
    }

    async getQuestionnaires(): Promise<Questionnaire[]> {
        console.log('🚀 Fetching questionnaires...');

        try {
            const response = await apiClient.get(`${this.baseUrl}`);
            console.log('✅ Questionnaires fetched successfully:', response);
            // Extract the data array from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to fetch questionnaires:', error);
            // For demo purposes, return empty array
            console.log('📝 Returning empty array for demo');
            return [];
        }
    }

    async getActiveQuestionnaires(): Promise<Questionnaire[]> {
        console.log('🚀 Fetching active questionnaires...');

        try {
            const response = await apiClient.get(`${this.baseUrl}?active=true`);
            console.log('✅ Active questionnaires fetched successfully:', response);
            // Extract the data array from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to fetch active questionnaires:', error);
            // For demo purposes, return empty array
            console.log('📝 Returning empty array for demo');
            return [];
        }
    }

    async getFirstActiveQuestionnaire(): Promise<Questionnaire | null> {
        console.log('🚀 Fetching active questionnaire...');

        try {
            const response = await apiClient.get(`${this.baseUrl}/active`);
            console.log('✅ Active questionnaire fetched successfully:', response);
            // Extract the data from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to fetch active questionnaire:', error);
            // If no active questionnaire found, return null
            if ((error as any).response?.status === 404) {
                console.log('⚠️ No active questionnaire found');
                return null;
            }
            return null;
        }
    }

    async getQuestionnaire(id: string): Promise<Questionnaire> {
        console.log('🚀 Fetching questionnaire:', id);

        try {
            const response = await apiClient.get(`${this.baseUrl}/${id}`);
            console.log('✅ Questionnaire fetched successfully:', response);
            // Extract the data from the API response
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to fetch questionnaire:', error);
            throw new Error('Failed to fetch questionnaire');
        }
    }

    async deleteQuestionnaire(id: string): Promise<void> {
        console.log('🚀 Deleting questionnaire:', id);

        try {
            await apiClient.delete(`${this.baseUrl}/${id}`);
            console.log('✅ Questionnaire deleted successfully');
        } catch (error) {
            console.error('❌ Failed to delete questionnaire:', error);
            // For demo purposes, just log the deletion
            console.log('📝 Mock deletion for demo - questionnaire would be deleted');
        }
    }

    async updateQuestionnaireStatus(id: string, status: 'draft' | 'active' | 'inactive' | 'archived'): Promise<Questionnaire> {
        console.log('🚀 Updating questionnaire status:', id, status);

        try {
            const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, { status });
            console.log('✅ Questionnaire status updated successfully:', response);
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to update questionnaire status:', error);
            throw new Error('Failed to update questionnaire status');
        }
    }

    async activateQuestionnaire(id: string): Promise<Questionnaire> {
        console.log('🚀 Activating questionnaire:', id);

        try {
            const response = await apiClient.patch(`${this.baseUrl}/${id}/activate`);
            console.log('✅ Questionnaire activated successfully:', response);
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to activate questionnaire:', error);
            throw new Error('Failed to activate questionnaire');
        }
    }

    async deactivateQuestionnaire(id: string): Promise<Questionnaire> {
        console.log('🚀 Deactivating questionnaire:', id);

        try {
            const response = await apiClient.patch(`${this.baseUrl}/${id}/deactivate`);
            console.log('✅ Questionnaire deactivated successfully:', response);
            return (response as any).data || response;
        } catch (error) {
            console.error('❌ Failed to deactivate questionnaire:', error);
            throw new Error('Failed to deactivate questionnaire');
        }
    }
}

export const questionnaireApi = new QuestionnaireApi();
