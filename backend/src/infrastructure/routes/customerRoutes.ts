import { Router, Request, Response } from 'express';
import { CreateCustomerUseCase } from '@/application/use-cases/customer/CreateCustomerUseCase';
import { CustomerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { CustomError } from '@/shared/middleware/errorHandler';
import Joi from 'joi';

const router = Router();
const customerRepository = new CustomerRepository();
const customerService = new CreateCustomerUseCase(customerRepository);

// Validation schemas
const createCustomerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  businessProfile: Joi.object().required() // Flexible business profile - can contain any fields
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  businessProfile: Joi.object().optional(), // Flexible business profile updates
  preferences: Joi.object({
    preferredSuppliers: Joi.array().items(Joi.string()).optional(),
    budgetRange: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional()
    }).optional(),
    productCategories: Joi.array().items(Joi.string()).optional(),
    deliveryFrequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly').optional()
  }).optional()
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const customer = await customerService.createCustomer(value);
    res.status(201).json({
      success: true,
      data: customer
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

// Get customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    res.json({
      success: true,
      data: customer
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

// Get customer by email
router.get('/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const customer = await customerService.getCustomerByEmail(email);
    res.json({
      success: true,
      data: customer
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

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCustomerSchema.validate(req.body);
    if (error) {
      throw new CustomError(`Validation error: ${error.details[0].message}`, 400);
    }

    const customer = await customerService.updateCustomer(id, value);
    res.json({
      success: true,
      data: customer
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

// Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await customerService.deleteCustomer(id);
    res.json({
      success,
      message: success ? 'Customer deleted successfully' : 'Customer not found'
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

// Get customers by tier
router.get('/tier/:tier', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const customers = await customerService.getCustomersByTier(tier as any);
    res.json({
      success: true,
      data: customers
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

// Get customer preferences
router.get('/:id/preferences', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const preferences = await customerService.getCustomerPreferences(id);
    res.json({
      success: true,
      data: preferences
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

export { router as customerRoutes };
