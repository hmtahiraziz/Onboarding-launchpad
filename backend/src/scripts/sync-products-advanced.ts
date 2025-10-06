#!/usr/bin/env ts-node

/**
 * Product Sync Script
 * 
 * This script handles all product synchronization tasks with comprehensive options.
 * 
 * Usage:
 *   npm run sync:products                    # Basic sync
 *   npm run sync:products -- --dry-run      # Test connection only
 *   npm run sync:products -- --verbose      # Detailed logging
 *   npm run sync:products -- --force        # Force sync (ignore recent data)
 *   npm run sync:products -- --help         # Show help
 * 
 * Options:
 *   --dry-run    : Test the connection without saving data
 *   --verbose    : Enable verbose logging
 *   --force      : Force sync even if recent data exists
 *   --help       : Show this help message
 */

import dotenv from 'dotenv';
import { ProductSyncService } from '../application/services/ProductSyncService';
import { logger } from '../shared/utils/logger';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

interface SyncOptions {
  dryRun: boolean;
  verbose: boolean;
  force: boolean;
  help: boolean;
}

function showHelp(): void {
  console.log(`
🚀 Paramount Launchpad - Product Sync Script

USAGE:
  npm run sync:products [options]

OPTIONS:
  --dry-run    Test the API connection without saving any data
  --verbose    Enable detailed logging output
  --force      Force sync even if recent data exists (less than 24 hours)
  --help       Show this help message

EXAMPLES:
  npm run sync:products                    # Basic product sync
  npm run sync:products -- --dry-run      # Test connection only
  npm run sync:products -- --verbose      # Sync with detailed logging
  npm run sync:products -- --force        # Force sync ignoring recent data
  npm run sync:products -- --help         # Show this help

DESCRIPTION:
  This script synchronizes product data from the Paramount Liquor API.
  It fetches all products, extracts unique attributes, and saves them to
  data/products.json and data/attributes.json files.

  The script includes safety checks to prevent unnecessary API calls and
  provides comprehensive error handling and cleanup.
`);
}

function parseArguments(): SyncOptions {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showHelp();
    process.exit(0);
  }
  
  return {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
    help: args.includes('--help')
  };
}

async function checkRecentSync(): Promise<boolean> {
  const dataDir = path.join(process.cwd(), 'data');
  const productsFile = path.join(dataDir, 'products.json');
  
  try {
    const stats = await fs.stat(productsFile);
    const lastModified = stats.mtime;
    const hoursSinceLastSync = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastSync < 24; // Less than 24 hours
  } catch {
    return false; // File doesn't exist
  }
}

async function runAdvancedProductSync(): Promise<void> {
  const options = parseArguments();
  const productSyncService = new ProductSyncService();
  
  try {
    // Configure logging level
    if (options.verbose) {
      logger.transports.forEach((transport) => {
        transport.silent = false;
      });
    }
    
    logger.info('🚀 Starting advanced product sync...');
    logger.info(`📡 API URL: ${process.env.PARAMOUNT_API_BASE_URL}/product/getAllProduct`);
    logger.info(`🔧 Options: ${JSON.stringify(options, null, 2)}`);
    
    // Check for recent sync
    if (!options.force && await checkRecentSync()) {
      logger.warn('⚠️  Recent sync detected (less than 24 hours ago)');
      logger.info('💡 Use --force flag to override this check');
      return;
    }
    
    if (options.dryRun) {
      logger.info('🧪 DRY RUN MODE - Testing API connection only...');
      
      // First test basic connectivity
      const connectionTest = await productSyncService.testConnection();
      if (!connectionTest.success) {
        logger.error('❌ API connection test failed:', connectionTest.message);
        logger.info('💡 Troubleshooting tips:');
        logger.info('   - Check your internet connection');
        logger.info('   - Verify the API URL is correct');
        logger.info('   - Check if the API server is running');
        logger.info(`   - Current API URL: ${process.env.PARAMOUNT_API_BASE_URL}/product/getAllProduct`);
        return;
      }
      
      logger.info(`✅ API connection test successful! ${connectionTest.message}`);
      
      // If connection test passes, try to fetch a small sample
      try {
        logger.info('📡 Testing full API request...');
        const products = await productSyncService.fetchProductsFromAPI();
        logger.info(`✅ Full API request successful! Found ${products.length} products`);
        
        // Show sample data
        if (products.length > 0) {
          logger.info('📋 Sample product data:');
          logger.info(JSON.stringify(products[0], null, 2));
        }
      } catch (error) {
        logger.warn('⚠️  Full API request failed, but connection test passed:');
        logger.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        logger.info('💡 This might be due to the large dataset. Try running without --dry-run to see if it works with retries.');
      }
      
      return;
    }
    
    // Run full sync
    const result = await productSyncService.syncProducts();
    
    if (result.success) {
      logger.info('✅ Product sync completed successfully!');
      logger.info(`📦 Products synced: ${result.productsCount}`);
      logger.info(`🏷️  Total attributes: ${result.attributesCount}`);
      logger.info(`📁 Data saved to: ${process.cwd()}/data/`);
      
      // Show file sizes
      try {
        const productsFile = path.join(process.cwd(), 'data', 'products.json');
        const attributesFile = path.join(process.cwd(), 'data', 'attributes.json');
        
        const productsStats = await fs.stat(productsFile);
        const attributesStats = await fs.stat(attributesFile);
        
        logger.info(`📊 File sizes:`);
        logger.info(`   products.json: ${(productsStats.size / 1024 / 1024).toFixed(2)} MB`);
        logger.info(`   attributes.json: ${(attributesStats.size / 1024).toFixed(2)} KB`);
      } catch (error) {
        logger.warn('Could not get file sizes:', error);
      }
    } else {
      logger.error('❌ Product sync failed!');
      logger.error(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    logger.error('💥 Unexpected error during product sync:', error);
    process.exit(1);
  } finally {
    // Clean up the service instance
    await productSyncService.cleanup();
    logger.info('🧹 Cleanup completed');
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  runAdvancedProductSync()
    .then(() => {
      logger.info('🎉 Advanced product sync finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { runAdvancedProductSync };
