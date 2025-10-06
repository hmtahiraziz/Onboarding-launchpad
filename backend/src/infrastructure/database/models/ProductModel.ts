import mongoose, { Schema, Document } from 'mongoose';
import { Product, ProductCategory, SupplierTier } from '@/domain/entities/Product';

export interface ProductDocument extends Omit<Product, 'id'>, Document {
  id: string;
}

const ContactInfoSchema = new Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
}, { _id: false });

const SupplierSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  tier: { 
    type: String, 
    enum: Object.values(SupplierTier),
    default: SupplierTier.BRONZE
  },
  contactInfo: { type: ContactInfoSchema, required: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const VolumeDiscountSchema = new Schema({
  minQuantity: { type: Number, required: true },
  discountPercentage: { type: Number, required: true }
}, { _id: false });

const TierPricingSchema = new Schema({
  customerTier: { type: String, required: true },
  priceMultiplier: { type: Number, required: true }
}, { _id: false });

const ProductPricingSchema = new Schema({
  basePrice: { type: Number, required: true },
  currency: { type: String, default: 'AUD' },
  volumeDiscounts: [VolumeDiscountSchema],
  tierPricing: [TierPricingSchema]
}, { _id: false });

const InventorySchema = new Schema({
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 0 },
  maximumStock: { type: Number, default: 1000 },
  reorderPoint: { type: Number, default: 10 },
  isInStock: { type: Boolean, default: true }
}, { _id: false });

const ProductSpecificationsSchema = new Schema({
  volume: { type: Number, required: true },
  alcoholContent: { type: Number },
  origin: { type: String },
  vintage: { type: Number },
  packaging: { type: String, required: true },
  shelfLife: { type: Number }
}, { _id: false });

const ProductSchema = new Schema<ProductDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: Object.values(ProductCategory),
    required: true
  },
  subcategory: { type: String, required: true },
  supplier: { type: SupplierSchema, required: true },
  pricing: { type: ProductPricingSchema, required: true },
  inventory: { type: InventorySchema, required: true },
  specifications: { type: ProductSpecificationsSchema, required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'supplier.id': 1 });
ProductSchema.index({ 'supplier.tier': 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ 'inventory.isInStock': 1 });
ProductSchema.index({ tags: 1 });

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema);
