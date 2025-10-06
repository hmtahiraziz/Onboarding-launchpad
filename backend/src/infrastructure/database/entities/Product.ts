import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProductCategory {
  SPIRITS = 'spirits',
  WINE = 'wine',
  BEER = 'beer',
  CHAMPAGNE = 'champagne',
  COCKTAIL_INGREDIENTS = 'cocktail_ingredients',
  NON_ALCOHOLIC = 'non_alcoholic',
  BAR_EQUIPMENT = 'bar_equipment'
}

export enum SupplierTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

@Entity('products')
export class Product {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: ProductCategory
  })
  category!: ProductCategory;

  @Column()
  subcategory!: string;

  @Column('jsonb')
  supplier!: {
    id: string;
    name: string;
    tier: SupplierTier;
    contactInfo: {
      email: string;
      phone: string;
      address: string;
    };
    isActive: boolean;
  };

  @Column('jsonb')
  pricing!: {
    basePrice: number;
    currency: string;
    volumeDiscounts: Array<{
      minQuantity: number;
      discountPercentage: number;
    }>;
    tierPricing: Array<{
      customerTier: string;
      priceMultiplier: number;
    }>;
  };

  @Column('jsonb')
  inventory!: {
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    isInStock: boolean;
  };

  @Column('jsonb')
  specifications!: {
    volume: number;
    alcoholContent?: number;
    origin?: string;
    vintage?: number;
    packaging: string;
    shelfLife?: number;
  };

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
