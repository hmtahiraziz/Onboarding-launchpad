import { Repository } from 'typeorm';
import { Customer, CustomerTier, BusinessProfile } from '@/domain/entities/Customer';
import { ICustomerRepository } from '@/domain/repositories/ICustomerRepository';
import { Customer as CustomerEntity } from '../database/entities/Customer';
import { getDataSource } from '../database/connection';

export class CustomerRepository implements ICustomerRepository {
  private repository: Repository<CustomerEntity> | null = null;

  private getRepository(): Repository<CustomerEntity> {
    if (!this.repository) {
      this.repository = getDataSource().getRepository(CustomerEntity);
    }
    return this.repository;
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.getRepository().findOne({ where: { id } });
    return customer ? this.mapToDomain(customer) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.getRepository().findOne({ 
      where: { email: email.toLowerCase() } 
    });
    return customer ? this.mapToDomain(customer) : null;
  }

  async findByTier(tier: CustomerTier): Promise<Customer[]> {
    const customers = await this.getRepository()
      .createQueryBuilder('customer')
      .where('customer.businessProfile->>\'tier\' = :tier', { tier })
      .getMany();
    return customers.map(customer => this.mapToDomain(customer));
  }

  async save(customer: Customer): Promise<Customer> {
    const customerEntity = this.getRepository().create(customer);
    const savedCustomer = await this.getRepository().save(customerEntity);
    return this.mapToDomain(savedCustomer);
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    await this.getRepository().update(id, { ...updates, updatedAt: new Date() });
    const updatedCustomer = await this.getRepository().findOne({ where: { id } });
    return updatedCustomer ? this.mapToDomain(updatedCustomer) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.getRepository().delete(id);
    return (result.affected || 0) > 0;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Customer[]> {
    const customers = await this.getRepository().find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' }
    });
    
    return customers.map(customer => this.mapToDomain(customer));
  }

  async findByLocation(city: string, state: string): Promise<Customer[]> {
    const customers = await this.getRepository()
      .createQueryBuilder('customer')
      .where('customer.businessProfile->\'location\'->>\'city\' ILIKE :city', { city: `%${city}%` })
      .andWhere('customer.businessProfile->\'location\'->>\'state\' ILIKE :state', { state: `%${state}%` })
      .getMany();
    
    return customers.map(customer => this.mapToDomain(customer));
  }

  async findByVenueType(venueType: string): Promise<Customer[]> {
    const customers = await this.getRepository()
      .createQueryBuilder('customer')
      .where('customer.businessProfile->>\'venueType\' = :venueType', { venueType })
      .getMany();
    
    return customers.map(customer => this.mapToDomain(customer));
  }

  async findByBusinessProfile(profile: Partial<BusinessProfile>): Promise<Customer[]> {
    let query = this.getRepository().createQueryBuilder('customer');
    
    if (profile.tier) {
      query = query.andWhere('customer.businessProfile->>\'tier\' = :tier', { tier: profile.tier });
    }
    
    if (profile.venueType) {
      query = query.andWhere('customer.businessProfile->>\'venueType\' = :venueType', { venueType: profile.venueType });
    }
    
    if (profile.cuisineStyle) {
      query = query.andWhere('customer.businessProfile->>\'cuisineStyle\' ILIKE :cuisineStyle', { 
        cuisineStyle: `%${profile.cuisineStyle}%` 
      });
    }
    
    if (profile.location?.city) {
      query = query.andWhere('customer.businessProfile->\'location\'->>\'city\' ILIKE :city', { 
        city: `%${profile.location.city}%` 
      });
    }
    
    if (profile.location?.state) {
      query = query.andWhere('customer.businessProfile->\'location\'->>\'state\' ILIKE :state', { 
        state: `%${profile.location.state}%` 
      });
    }
    
    const customers = await query.getMany();
    return customers.map(customer => this.mapToDomain(customer));
  }

  private mapToDomain(customerEntity: CustomerEntity): Customer {
    return {
      id: customerEntity.id,
      email: customerEntity.email,
      name: customerEntity.name,
      businessProfile: customerEntity.businessProfile,
      onboardingStatus: customerEntity.onboardingStatus,
      preferences: customerEntity.preferences,
      aiResponse: customerEntity.aiResponse,
      createdAt: customerEntity.createdAt,
      updatedAt: customerEntity.updatedAt
    };
  }
}
