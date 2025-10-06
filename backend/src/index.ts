import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/utils/logger';
import { connectDatabase } from './infrastructure/database/connection';
import { customerRoutes } from './infrastructure/routes/customerRoutes';
import { productRoutes } from './infrastructure/routes/productRoutes';
import { onboardingRoutes } from './infrastructure/routes/onboardingRoutes';
import questionnaireRoutes from './infrastructure/routes/questionnaireRoutes';
import { dynamicFormRoutes } from './infrastructure/routes/dynamicFormRoutes';
import { ProductSyncScheduler } from './infrastructure/scheduler/ProductSyncScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize product sync scheduler
const productSyncScheduler = new ProductSyncScheduler();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Paramount Launchpad API'
  });
});



// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api', dynamicFormRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
async function startServer() {
  try {
    await connectDatabase();

    // Start the product sync scheduler
    productSyncScheduler.start();

    app.listen(PORT, () => {
      logger.info(`🚀 Paramount Launchpad API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔄 Product sync scheduler started - will run daily at 2:00 AM (Australia/Sydney)`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  productSyncScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  productSyncScheduler.stop();
  process.exit(0);
});

startServer();
