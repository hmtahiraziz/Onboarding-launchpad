import { Router, Request, Response } from 'express';
import { OnboardingUseCase } from '@/application/use-cases/onboarding/OnboardingUseCase';
import { CustomerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { ProductRepository } from '@/infrastructure/repositories/ProductRepository';
import { OnboardingRepository } from '@/infrastructure/repositories/OnboardingRepository';
import { AIProductCurationService } from '@/application/services/AIProductCurationService';
import { CustomError } from '@/shared/middleware/errorHandler';
import Joi from 'joi';

const router = Router();
const customerRepository = new CustomerRepository();
const productRepository = new ProductRepository();
const onboardingRepository = new OnboardingRepository();
const aiCurationService = new AIProductCurationService(customerRepository);
const onboardingService = new OnboardingUseCase(
  onboardingRepository,
  customerRepository,
  productRepository,
  aiCurationService
);

// Validation schemas
const startOnboardingSchema = Joi.object({
  customerId: Joi.string().required()
});

const submitResponseSchema = Joi.object({
  sessionId: Joi.string().required(),
  step: Joi.string().valid(
    'welcome', 'venue_type', 'cuisine_style', 'location', 
    'preferences', 'product_selection', 'completion'
  ).required(),
  answer: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).required()
});

// Start onboarding
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { error, value } = startOnboardingSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const session = await onboardingService.startOnboarding(value);
    res.status(201).json({
      success: true,
      data: session
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

// Get onboarding session
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await onboardingService.getOnboardingSession(sessionId);
    res.json({
      success: true,
      data: session
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

// Submit onboarding response
router.post('/response', async (req: Request, res: Response) => {
  try {
    const { error, value } = submitResponseSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const session = await onboardingService.submitResponse(value);
    res.json({
      success: true,
      data: session
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

// Get next question
router.get('/session/:sessionId/next-question', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const question = await onboardingService.getNextQuestion(sessionId);
    res.json({
      success: true,
      data: question
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

// Get onboarding progress
router.get('/session/:sessionId/progress', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const progress = await onboardingService.getOnboardingProgress(sessionId);
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

// Generate curated products
router.post('/session/:sessionId/curated-products', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await onboardingService.getOnboardingSession(sessionId);
    const curatedProducts = await onboardingService.generateCuratedProducts(session.customerId);
    res.json({
      success: true,
      data: curatedProducts
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

// Complete onboarding
router.post('/session/:sessionId/complete', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await onboardingService.completeOnboarding(sessionId);
    res.json({
      success: true,
      data: session
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

// Abandon onboarding
router.post('/session/:sessionId/abandon', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await onboardingService.abandonOnboarding(sessionId);
    res.json({
      success: true,
      data: session
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

export { router as onboardingRoutes };
