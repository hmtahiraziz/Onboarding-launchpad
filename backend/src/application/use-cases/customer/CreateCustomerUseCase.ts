import { v4 as uuidv4 } from 'uuid';
import { Customer, CustomerTier, OnboardingStatus, BusinessProfile } from '@/domain/entities/Customer';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { ICustomerService, CreateCustomerRequest } from '@/domain/services/ICustomerService';
import { CustomError } from '@/shared/middleware/errorHandler';

export class CreateCustomerUseCase implements ICustomerService {
  constructor(private customerRepository: ICustomerRepository) {}

  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    // Validate email uniqueness
    const existingCustomer = await this.customerRepository.findByEmail(request.email);
    if (existingCustomer) {
      throw new CustomError('Customer with this email already exists', 409);
    }

    // Create new customer
    const customer: Customer = {
      id: uuidv4(),
      email: request.email,
      name: request.name,
      businessProfile: request.businessProfile,
      onboardingStatus: OnboardingStatus.NOT_STARTED,
      preferences: {
        preferredSuppliers: [],
        budgetRange: { min: 0, max: 10000 },
        productCategories: [],
        deliveryFrequency: 'monthly'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.customerRepository.save(customer);
  }

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }
    return customer;
  }

  async updateCustomer(id: string, request: any): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new CustomError('Customer not found', 404);
    }

    const updatedCustomer = {
      ...existingCustomer,
      ...request,
      updatedAt: new Date()
    };

    const result = await this.customerRepository.update(id, updatedCustomer);
    if (!result) {
      throw new CustomError('Failed to update customer', 500);
    }
    return result;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }
    return await this.customerRepository.delete(id);
  }

  async getCustomersByTier(tier: any): Promise<Customer[]> {
    return await this.customerRepository.findByTier(tier);
  }

  async upgradeCustomerTier(customerId: string, newTier: any): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    const updatedBusinessProfile = {
      ...customer.businessProfile,
      tier: newTier
    };

    const result = await this.customerRepository.update(customerId, {
      businessProfile: updatedBusinessProfile,
      updatedAt: new Date()
    });
    if (!result) {
      throw new CustomError('Failed to upgrade customer tier', 500);
    }
    return result;
  }

  async getCustomerPreferences(customerId: string): Promise<Customer['preferences']> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }
    return customer.preferences;
  }
}
