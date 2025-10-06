import mongoose, { Schema, Document } from 'mongoose';
import { Customer, CustomerTier, VenueType, OnboardingStatus } from '@/domain/entities/Customer';

export interface CustomerDocument extends Omit<Customer, 'id'>, Document {
  id: string;
}

const LocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postcode: { type: String, required: true },
  country: { type: String, required: true, default: 'Australia' }
}, { _id: false });

const CustomerPreferencesSchema = new Schema({
  preferredSuppliers: [{ type: String }],
  budgetRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 }
  },
  productCategories: [{ type: String }],
  deliveryFrequency: { 
    type: String, 
    enum: ['weekly', 'bi-weekly', 'monthly'],
    default: 'monthly'
  }
}, { _id: false });

const CustomerSchema = new Schema<CustomerDocument>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  tier: { 
    type: String, 
    enum: Object.values(CustomerTier),
    default: CustomerTier.BRONZE
  },
  venueType: { 
    type: String, 
    enum: Object.values(VenueType),
    required: true
  },
  cuisineStyle: { type: String },
  location: { type: LocationSchema, required: true },
  onboardingStatus: { 
    type: String, 
    enum: Object.values(OnboardingStatus),
    default: OnboardingStatus.NOT_STARTED
  },
  preferences: { type: CustomerPreferencesSchema, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ tier: 1 });
CustomerSchema.index({ 'location.city': 1, 'location.state': 1 });
CustomerSchema.index({ onboardingStatus: 1 });

// Update the updatedAt field before saving
CustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CustomerModel = mongoose.model<CustomerDocument>('Customer', CustomerSchema);
