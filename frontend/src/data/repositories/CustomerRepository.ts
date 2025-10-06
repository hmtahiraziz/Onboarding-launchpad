import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/domain/entities/Customer';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { apiClient } from '../api/apiClient';

export class CustomerRepository implements ICustomerRepository {
  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<{success: boolean, data: Customer}>('/customers', request);
    if (!response.success || !response.data) {
      throw new Error('Failed to create customer');
    }
    return response.data;
  }

  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiClient.get<{success: boolean, data: Customer}>(`/customers/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Customer not found');
    }
    return response.data;
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    const response = await apiClient.get<{success: boolean, data: Customer}>(`/customers/email/${email}`);
    if (!response.success || !response.data) {
      throw new Error('Customer not found');
    }
    return response.data;
  }

  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<{success: boolean, data: Customer}>(`/customers/${id}`, request);
    if (!response.success || !response.data) {
      throw new Error('Failed to update customer');
    }
    return response.data;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const response = await apiClient.delete<{success: boolean}>(`/customers/${id}`);
    return response.success;
  }

  async getCustomersByTier(tier: string): Promise<Customer[]> {
    const response = await apiClient.get<{success: boolean, data: Customer[]}>(`/customers/tier/${tier}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch customers');
    }
    return response.data;
  }

  async getCustomerPreferences(customerId: string): Promise<Customer['preferences']> {
    const response = await apiClient.get<{success: boolean, data: Customer['preferences']}>(`/customers/${customerId}/preferences`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch customer preferences');
    }
    return response.data;
  }
}
