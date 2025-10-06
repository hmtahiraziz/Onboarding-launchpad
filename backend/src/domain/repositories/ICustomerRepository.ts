import { Customer, CustomerTier, BusinessProfile } from '../entities/Customer';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByTier(tier: CustomerTier): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
  findAll(limit?: number, offset?: number): Promise<Customer[]>;
  findByLocation(city: string, state: string): Promise<Customer[]>;
  findByVenueType(venueType: string): Promise<Customer[]>;
  findByBusinessProfile(profile: Partial<BusinessProfile>): Promise<Customer[]>;
}
