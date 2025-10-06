import { Router, Request, Response } from 'express';
import { QuestionnaireUseCase } from '@/application/use-cases/questionnaire/QuestionnaireUseCase';
import { QuestionnaireRepository } from '@/infrastructure/repositories/QuestionnaireRepository';
import { CustomerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { QuestionnaireResponseRepository } from '@/infrastructure/repositories/QuestionnaireResponseRepository';
import { CustomError } from '@/shared/middleware/errorHandler';
import Joi from 'joi';

const router = Router();
const questionnaireRepository = new QuestionnaireRepository();
const customerRepository = new CustomerRepository();
const questionnaireResponseRepository = new QuestionnaireResponseRepository();
const questionnaireUseCase = new QuestionnaireUseCase(questionnaireRepository, questionnaireResponseRepository, customerRepository);

// Validation schemas
const formProgressSchema = Joi.object({
  customerId: Joi.string().required(),
  step: Joi.number().integer().min(0).required(),
  responses: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      answer: Joi.any().required(),
      timestamp: Joi.string().required()
    })
  ).required()
});

const formSubmissionSchema = Joi.object({
  formId: Joi.string().required(),
  customerId: Joi.string().required(),
  responses: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      answer: Joi.any().required(),
      timestamp: Joi.string().required()
    })
  ).required(),
  completedAt: Joi.string().required(),
  timeSpent: Joi.number().integer().min(0).required()
});

// Get dynamic form by questionnaire ID
router.get('/questionnaires/:questionnaireId/form', async (req: Request, res: Response) => {
  try {
    const { questionnaireId } = req.params;
    
    const questionnaire = await questionnaireUseCase.getQuestionnaire(questionnaireId);
    if (!questionnaire) {
      throw new CustomError('Questionnaire not found', 404);
    }

    // Only allow active questionnaires for customer forms
    if (questionnaire.status !== 'active') {
      throw new CustomError('Questionnaire is not active and cannot be used for customer onboarding', 403);
    }

    // Convert questionnaire to dynamic form format
    const dynamicForm = {
      id: questionnaire.id,
      title: questionnaire.title,
      description: questionnaire.description,
      questionnaireId: questionnaire.id,
      steps: [
        {
          id: 'step-1',
          title: 'Business Information',
          description: 'Tell us about your business',
          questions: questionnaire.questions.slice(0, 3), // First 3 questions
          order: 1,
          isCompleted: false,
          isVisible: true
        },
        {
          id: 'step-2',
          title: 'Preferences & Requirements',
          description: 'Help us understand your needs',
          questions: questionnaire.questions.slice(3, 6), // Next 3 questions
          order: 2,
          isCompleted: false,
          isVisible: true
        },
        {
          id: 'step-3',
          title: 'Additional Information',
          description: 'Any additional details',
          questions: questionnaire.questions.slice(6), // Remaining questions
          order: 3,
          isCompleted: false,
          isVisible: true
        }
      ].filter(step => step.questions.length > 0), // Only include steps with questions
      currentStep: 0,
      isCompleted: false,
      createdAt: questionnaire.createdAt,
      updatedAt: questionnaire.updatedAt
    };

    res.json({
      success: true,
      data: dynamicForm
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Save form progress
router.post('/forms/:formId/progress', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { error, value } = formProgressSchema.validate(req.body);
    
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    // In a real implementation, you would save this to a database
    // For now, we'll just return success
    console.log(`Saving progress for form ${formId}:`, value);

    res.json({
      success: true,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get form progress
router.get('/forms/:formId/progress/:customerId', async (req: Request, res: Response) => {
  try {
    const { formId, customerId } = req.params;

    // In a real implementation, you would retrieve this from a database
    // For now, we'll return default progress
    const progress = {
      currentStep: 0,
      completedSteps: [],
      progressPercentage: 0,
      responses: []
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Submit form response
router.post('/forms/submit', async (req: Request, res: Response) => {
  try {
    const { error, value } = formSubmissionSchema.validate(req.body);
    
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    // In a real implementation, you would save this to a database
    // and trigger any necessary business logic
    console.log('Form submission received:', value);

    // Create a customer response record
    const submission = {
      ...value,
      id: `submission_${Date.now()}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

export { router as dynamicFormRoutes };
