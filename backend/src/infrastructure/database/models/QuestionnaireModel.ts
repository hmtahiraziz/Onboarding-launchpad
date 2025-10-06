import mongoose, { Document, Schema } from 'mongoose';
import { Questionnaire, Question, QuestionnaireStatus } from '@/domain/entities/Questionnaire';

export interface IQuestionnaireDocument extends Omit<Questionnaire, 'id'>, Document {
  id: string;
}

const QuestionSchema = new Schema<Question>({
  id: { type: String, required: true },
  questionnaireId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['dropdown', 'radio', 'checkbox'], 
    required: true 
  },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  isHidden: { type: Boolean, default: false },
  order: { type: Number, required: true },
  conditionalLogic: {
    showIf: String,
    condition: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']
    },
    value: String
  },
  validationRules: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
    required: Boolean,
    customMessage: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const QuestionnaireSchema = new Schema<IQuestionnaireDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: Object.values(QuestionnaireStatus), 
    default: QuestionnaireStatus.DRAFT 
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
QuestionnaireSchema.index({ id: 1 });
QuestionnaireSchema.index({ status: 1 });
QuestionnaireSchema.index({ isActive: 1 });
QuestionnaireSchema.index({ createdAt: -1 });

export const QuestionnaireModel = mongoose.model<IQuestionnaireDocument>('Questionnaire', QuestionnaireSchema);
