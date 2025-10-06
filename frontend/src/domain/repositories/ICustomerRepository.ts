import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../entities/Customer';

export interface ICustomerRepository {
  createCustomer(request: CreateCustomerRequest): Promise<Customer>;
  getCustomerById(id: string): Promise<Customer>;
  getCustomerByEmail(email: string): Promise<Customer>;
  updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;
  getCustomersByTier(tier: string): Promise<Customer[]>;
  getCustomerPreferences(customerId: string): Promise<Customer['preferences']>;
}
