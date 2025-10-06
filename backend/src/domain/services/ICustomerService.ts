import { Customer, CustomerTier, BusinessProfile } from '../entities/Customer';

export interface CreateCustomerRequest {
  email: string;
  name: string;
  businessProfile: BusinessProfile;
}

export interface UpdateCustomerRequest {
  name?: string;
  businessProfile?: Partial<BusinessProfile>;
  preferences?: {
    preferredSuppliers?: string[];
    budgetRange?: {
      min: number;
      max: number;
    };
    productCategories?: string[];
    deliveryFrequency?: 'weekly' | 'bi-weekly' | 'monthly';
  };
}

export interface ICustomerService {
  createCustomer(request: CreateCustomerRequest): Promise<Customer>;
  getCustomerById(id: string): Promise<Customer>;
  getCustomerByEmail(email: string): Promise<Customer>;
  updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;
  getCustomersByTier(tier: CustomerTier): Promise<Customer[]>;
  upgradeCustomerTier(customerId: string, newTier: CustomerTier): Promise<Customer>;
  getCustomerPreferences(customerId: string): Promise<Customer['preferences']>;
}
