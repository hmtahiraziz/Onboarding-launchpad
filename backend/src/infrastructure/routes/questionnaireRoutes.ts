import { Router, Request, Response } from 'express';
import { QuestionnaireUseCase } from '../../application/use-cases/questionnaire/QuestionnaireUseCase';
import { QuestionnaireRepository } from '../repositories/QuestionnaireRepository';
import { QuestionnaireResponseRepository } from '../repositories/QuestionnaireResponseRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { CustomError } from '../../shared/middleware/errorHandler';
import { CSVImportService } from '../../application/services/CSVImportService';
import Joi from 'joi';
import multer from 'multer';

// Extend Request interface to include file property
interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

const router = Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Initialize use case
const questionnaireUseCase = new QuestionnaireUseCase(
    new QuestionnaireRepository(),
    new QuestionnaireResponseRepository(),
    new CustomerRepository()
);

// Validation schemas
const createQuestionnaireSchema = Joi.object({
    id: Joi.string().optional(),
    title: Joi.string().required().min(1).max(255),
    description: Joi.string().optional().max(1000),
    status: Joi.string().valid('draft', 'active', 'inactive', 'archived').optional(),
    isActive: Joi.boolean().optional(),
    createdBy: Joi.string().optional().max(255),
    createdAt: Joi.string().optional(),
    updatedAt: Joi.string().optional(),
    questions: Joi.array().items(
        Joi.object({
            id: Joi.string().optional(),
            questionnaireId: Joi.string().optional(),
            title: Joi.string().required().min(1).max(500),
            description: Joi.string().optional().allow('').max(1000),
            type: Joi.string().valid('dropdown', 'radio', 'checkbox', 'text', 'textarea', 'number', 'date').required(),
            options: Joi.array().items(Joi.string()).optional(),
            required: Joi.boolean().optional(),
            isRequired: Joi.boolean().optional(),
            status: Joi.string().valid('active', 'inactive').optional(),
            hidden: Joi.boolean().optional(),
            isHidden: Joi.boolean().optional(),
            order: Joi.number().integer().min(0).optional(),
            conditionalLogic: Joi.object({
                showIf: Joi.string().required(),
                condition: Joi.string().valid('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty').required(),
                value: Joi.string().required()
            }).optional().allow(null),
            validationRules: Joi.object({
                minLength: Joi.number().integer().min(0).optional(),
                maxLength: Joi.number().integer().min(0).optional(),
                min: Joi.number().optional(),
                max: Joi.number().optional(),
                pattern: Joi.string().optional(),
                required: Joi.boolean().optional(),
                customMessage: Joi.string().optional()
            }).optional(),
            createdAt: Joi.string().optional(),
            updatedAt: Joi.string().optional()
        })
    ).required().min(1)
});

const updateQuestionnaireSchema = Joi.object({
    id: Joi.string().optional(),
    title: Joi.string().required().min(1).max(255),
    description: Joi.string().optional().max(1000),
    status: Joi.string().valid('draft', 'active', 'inactive', 'archived').optional(),
    isActive: Joi.boolean().optional(),
    updatedAt: Joi.string().optional(),
    questions: Joi.array().items(
        Joi.object({
            id: Joi.string().optional(),
            questionnaireId: Joi.string().optional(),
            title: Joi.string().required().min(1).max(500),
            description: Joi.string().optional().allow('').max(1000),
            type: Joi.string().valid('dropdown', 'radio', 'checkbox', 'text', 'textarea', 'number', 'date').required(),
            options: Joi.array().items(Joi.string()).optional(),
            required: Joi.boolean().optional(),
            isRequired: Joi.boolean().optional(),
            status: Joi.string().valid('active', 'inactive').optional(),
            hidden: Joi.boolean().optional(),
            isHidden: Joi.boolean().optional(),
            order: Joi.number().integer().min(0).optional(),
            conditionalLogic: Joi.object({
                showIf: Joi.string().required(),
                condition: Joi.string().valid('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty').required(),
                value: Joi.string().required()
            }).optional().allow(null),
            validationRules: Joi.object({
                minLength: Joi.number().integer().min(0).optional(),
                maxLength: Joi.number().integer().min(0).optional(),
                min: Joi.number().optional(),
                max: Joi.number().optional(),
                pattern: Joi.string().optional(),
                required: Joi.boolean().optional(),
                customMessage: Joi.string().optional()
            }).optional(),
            createdAt: Joi.string().optional(),
            updatedAt: Joi.string().optional()
        })
    ).required().min(1)
});

const submitAnswerSchema = Joi.object({
    questionId: Joi.string().uuid().required(),
    answer: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string()),
        Joi.number(),
        Joi.boolean()
    ).required(),
    timeSpent: Joi.number().integer().min(0).optional()
});

// Routes

// GET /api/questionnaires - Get all questionnaires
router.get('/', async (req: Request, res: Response) => {
    try {
        const { status, active } = req.query;

        let questionnaires;
        if (active === 'true') {
            questionnaires = await questionnaireUseCase.getActiveQuestionnaires();
        } else if (status) {
            questionnaires = await questionnaireUseCase.getAllQuestionnaires();
            questionnaires = questionnaires.filter(q => q.status === status);
        } else {
            questionnaires = await questionnaireUseCase.getAllQuestionnaires();
        }

        return res.json({
            success: true,
            data: questionnaires,
            total: questionnaires.length
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// GET /api/questionnaires/active - Get the single active questionnaire
router.get('/active', async (req: Request, res: Response) => {
    try {
        const activeQuestionnaire = await questionnaireUseCase.getActiveQuestionnaire();
        
        if (!activeQuestionnaire) {
            return res.status(404).json({
                success: false,
                error: 'No active questionnaire found'
            });
        }

        return res.json({
            success: true,
            data: activeQuestionnaire,
            message: 'Active questionnaire retrieved successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// GET /api/questionnaires/:id - Get questionnaire by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const questionnaire = await questionnaireUseCase.getQuestionnaire(id);

        return res.json({
            success: true,
            data: questionnaire
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// POST /api/questionnaires - Create questionnaire
router.post('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = createQuestionnaireSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const questionnaire = await questionnaireUseCase.createQuestionnaire(value);

    return res.status(201).json({
      success: true,
      data: questionnaire
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// PUT /api/questionnaires/:id - Update questionnaire
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, value } = updateQuestionnaireSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const questionnaire = await questionnaireUseCase.updateQuestionnaire(id, value);

    return res.json({
      success: true,
      data: questionnaire
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// DELETE /api/questionnaires/:id - Delete questionnaire
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await questionnaireUseCase.deleteQuestionnaire(id);

        if (deleted) {
            return res.json({
                success: true,
                message: 'Questionnaire deleted successfully'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete questionnaire'
            });
        }
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// POST /api/questionnaires/:id/start - Start questionnaire response
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    const response = await questionnaireUseCase.startQuestionnaireResponse(id, customerId);

    return res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// POST /api/questionnaires/responses/:responseId/answer - Submit answer
router.post('/responses/:responseId/answer', async (req: Request, res: Response) => {
  try {
    const { responseId } = req.params;
    const { error, value } = submitAnswerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const response = await questionnaireUseCase.submitAnswer({
      responseId,
      questionId: value.questionId,
      answer: value.answer,
      timeSpent: value.timeSpent
    });

    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// POST /api/questionnaires/responses/:responseId/complete - Complete questionnaire
router.post('/responses/:responseId/complete', async (req: Request, res: Response) => {
    try {
        const { responseId } = req.params;
        const response = await questionnaireUseCase.completeQuestionnaireResponse(responseId);

        return res.json({
            success: true,
            data: response
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// GET /api/questionnaires/responses/:responseId - Get questionnaire response
router.get('/responses/:responseId', async (req: Request, res: Response) => {
    try {
        const { responseId } = req.params;
        const response = await questionnaireUseCase.getQuestionnaireResponse(responseId);

        return res.json({
            success: true,
            data: response
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// GET /api/questionnaires/:id/responses - Get all responses for a questionnaire
router.get('/:id/responses', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responses = await questionnaireUseCase.getQuestionnaireResponses(id);

        return res.json({
            success: true,
            data: responses,
            total: responses.length
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// GET /api/questionnaires/customer/:customerId/responses - Get customer's responses
router.get('/customer/:customerId/responses', async (req: Request, res: Response) => {
    try {
        const { customerId } = req.params;
        const responses = await questionnaireUseCase.getCustomerResponses(customerId);

        return res.json({
            success: true,
            data: responses,
            total: responses.length
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// PATCH /api/questionnaires/:id/status - Update questionnaire status
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status || !['draft', 'active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be one of: draft, active, inactive, archived'
            });
        }

        const questionnaire = await questionnaireUseCase.updateQuestionnaireStatus(id, status);

        return res.json({
            success: true,
            data: questionnaire,
            message: `Questionnaire status updated to ${status}`
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// PATCH /api/questionnaires/:id/activate - Activate questionnaire (convenience endpoint)
router.patch('/:id/activate', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const questionnaire = await questionnaireUseCase.updateQuestionnaireStatus(id, 'active');

        return res.json({
            success: true,
            data: questionnaire,
            message: 'Questionnaire activated successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// PATCH /api/questionnaires/:id/deactivate - Deactivate questionnaire (convenience endpoint)
router.patch('/:id/deactivate', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const questionnaire = await questionnaireUseCase.updateQuestionnaireStatus(id, 'inactive');

        return res.json({
            success: true,
            data: questionnaire,
            message: 'Questionnaire deactivated successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// DELETE /api/questionnaires/:id - Delete questionnaire
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await questionnaireUseCase.deleteQuestionnaire(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Questionnaire not found'
            });
        }

        return res.json({
            success: true,
            message: 'Questionnaire deleted successfully'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// POST /api/questionnaires/import-csv - Import questionnaire from CSV
router.post('/import-csv', upload.single('csvFile'), async (req: RequestWithFile, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'CSV file is required'
            });
        }

        const csvContent = req.file.buffer.toString('utf-8');
        const { title, description } = req.body;

        // Validate CSV structure first
        const validation = CSVImportService.validateCSVStructure(csvContent);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'CSV validation failed',
                details: validation.errors
            });
        }

        // Parse CSV content
        const questionnaireData = CSVImportService.parseCSVContent(csvContent);
        
        // Override title and description if provided
        if (title) {
            questionnaireData.title = title;
        }
        if (description) {
            questionnaireData.description = description;
        }

        // Create questionnaire
        const questionnaire = await questionnaireUseCase.createQuestionnaire(questionnaireData);

        return res.json({
            success: true,
            data: questionnaire,
            message: 'Questionnaire imported successfully from CSV'
        });
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// POST /api/questionnaires/validate-csv - Validate CSV without importing
router.post('/validate-csv', upload.single('csvFile'), async (req: RequestWithFile, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'CSV file is required'
            });
        }

        const csvContent = req.file.buffer.toString('utf-8');
        const validation = CSVImportService.validateCSVStructure(csvContent);

        return res.json({
            success: validation.isValid,
            data: {
                isValid: validation.isValid,
                errors: validation.errors,
                questionCount: validation.isValid ? csvContent.split('\n').length - 1 : 0
            },
            message: validation.isValid ? 'CSV is valid' : 'CSV validation failed'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
