import mongoose, { Schema, Document } from 'mongoose';
import { OnboardingSession, OnboardingStep, OnboardingSessionStatus } from '@/domain/entities/OnboardingSession';

export interface OnboardingSessionDocument extends Omit<OnboardingSession, 'id'>, Document {
  id: string;
}

const OnboardingResponseSchema = new Schema({
  step: { 
    type: String, 
    enum: Object.values(OnboardingStep),
    required: true
  },
  question: { type: String, required: true },
  answer: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OnboardingSessionSchema = new Schema<OnboardingSessionDocument>({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  currentStep: { 
    type: String, 
    enum: Object.values(OnboardingStep),
    default: OnboardingStep.WELCOME
  },
  responses: [OnboardingResponseSchema],
  curatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  status: { 
    type: String, 
    enum: Object.values(OnboardingSessionStatus),
    default: OnboardingSessionStatus.ACTIVE
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
OnboardingSessionSchema.index({ customerId: 1 });
OnboardingSessionSchema.index({ status: 1 });
OnboardingSessionSchema.index({ startedAt: 1 });
OnboardingSessionSchema.index({ lastActivityAt: 1 });

// Update the lastActivityAt field before saving
OnboardingSessionSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

export const OnboardingSessionModel = mongoose.model<OnboardingSessionDocument>('OnboardingSession', OnboardingSessionSchema);
