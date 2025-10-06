# Product Sync Cron Job

This document describes the daily product synchronization system that fetches products from the Paramount Liquor API and processes them for the application.

## Overview

The system automatically fetches product data from the Paramount Liquor API daily and:
1. Saves all products to `data/products.json`
2. Extracts unique product attributes and saves them to `data/attributes.json`

## Features

- **Daily Sync**: Automatically runs every day at 2:00 AM (Australia/Sydney timezone)
- **Manual Control**: API endpoints to start, stop, and run sync manually
- **Error Handling**: Comprehensive error handling and logging
- **Data Processing**: Extracts unique attributes from products
- **File Storage**: Saves data in JSON format for easy access

## API Endpoints

### Get Sync Status
```
GET /api/sync/status
```
Returns the current status of the product sync scheduler.

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": false,
    "isScheduled": true,
    "nextRun": "2024-01-15T02:00:00.000Z"
  }
}
```

### Run Sync Now
```
POST /api/sync/run
```
Manually triggers the product sync process immediately.

**Response:**
```json
{
  "success": true,
  "message": "Product sync started successfully"
}
```

### Start Scheduler
```
POST /api/sync/start
```
Starts the daily cron scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Product sync scheduler started"
}
```

### Stop Scheduler
```
POST /api/sync/stop
```
Stops the daily cron scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Product sync scheduler stopped"
}
```

## Data Files

### products.json
Contains all products fetched from the API with metadata:
```json
{
  "lastUpdated": "2024-01-15T02:00:00.000Z",
  "totalProducts": 1500,
  "products": [
    {
      "id": "2",
      "sku": "2556",
      "name": "Visualr Wine Product 750ml",
      "product_web_description": "Wine Product 750ml",
      "image": "/2/5/2556-512-0.png",
      "supplier": "Visualr Supplier",
      "supplier_id": "2555",
      "visibility": "4",
      "product_rank": "100000",
      "wholesale_units_per_case": "6",
      "loyalty_points": "14",
      "points_excluded_from_retail": null,
      "supplier_points": "0.000000",
      "bonus_points": "0.000000",
      "brand": "Visualr",
      "item_container_type": "Bottle",
      "country": "Australia",
      "region": "Victoria",
      "sell_by_type": "0",
      "category_level_1": "Wine",
      "category_level_2": "Red Wine",
      "category_level_3": "Cabernet Sauvignon",
      "category_level_4": null,
      "mirakl_product": "0",
      "sold_at_cairns": "1",
      "sold_at_brisbane": "0",
      "sold_at_adelaide": "0",
      "sold_at_melbourne": "0",
      "sold_at_sydney": "0",
      "is3_pl_only": "0",
      "varietal": "Cabernet Sauvignon",
      "liquor_style": "Bigger, Bolder Reds",
      "consumable_units_per_case": "6",
      "en_created": "2023-06-06 17:40:15",
      "redeemable": "0",
      "marketing_tags": null,
      "wet_tax": "0.290000",
      "long_term_oos_locations": "null",
      "core_range_locations": null,
      "hide_on_public": "1",
      "abv": "13",
      "split_pack_size": "0"
    }
  ]
}
```

### attributes.json
Contains unique product attributes extracted from all products:
```json
{
  "lastUpdated": "2024-01-15T02:00:00.000Z",
  "attributes": {
    "brands": ["Visualr", "Akasha Brewing", "Yulli'S Brews", "Scapegrace", "Sorbet", "Strega"],
    "item_container_types": ["Bottle", "Can", "Keg"],
    "countries": ["Australia", "New Zealand", "Italy"],
    "regions": ["Victoria", "New South Wales", "South Australia"],
    "category_level_1": ["Wine", "Spirits", "Beer", "3pl"],
    "category_level_2": ["Red Wine", "Gin", "Craft Beer", "IPA"],
    "category_level_3": ["Cabernet Sauvignon", "IPA"],
    "category_level_4": ["IPA"],
    "varietals": ["Cabernet Sauvignon", "Gin", "Craft Beer", "Whisky", "Spritz", "Liqueur"],
    "liquor_styles": ["Bigger, Bolder Reds", "Botanical Gin", "Pale Ale", "Single Malt", "Spritz Wine"]
  }
}
```

## Configuration

The cron job is configured to run daily at 2:00 AM Australia/Sydney timezone. To modify the schedule, update the cron expression in `ProductSyncScheduler.ts`:

```typescript
// Current: Daily at 2:00 AM
this.cronJob = cron.schedule('0 2 * * *', async () => {
  await this.runProductSync();
}, {
  scheduled: false,
  timezone: 'Australia/Sydney'
});
```

## Error Handling

The system includes comprehensive error handling:
- API request timeouts (30 seconds)
- Network error handling
- File system error handling
- Duplicate execution prevention
- Detailed logging for debugging

## Logging

All sync operations are logged with appropriate levels:
- `info`: Normal operations and status updates
- `warn`: Non-critical issues (e.g., duplicate execution attempts)
- `error`: Critical errors that prevent sync completion

## Dependencies

The following packages are required:
- `node-cron`: For scheduling the daily sync
- `axios`: For making HTTP requests to the Paramount API
- `fs/promises`: For file system operations

## Installation

Install the required dependencies:
```bash
npm install node-cron axios
npm install --save-dev @types/node-cron supertest @types/supertest
```

## Usage

The cron job starts automatically when the application starts. You can also control it manually using the API endpoints or by calling methods directly on the `ProductSyncScheduler` instance.

## Testing

The system includes comprehensive e2e tests. Run them using:

```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests in watch mode
npm run test:e2e:watch

# Run e2e tests for CI
npm run test:e2e:ci
```

For more details, see the [E2E Tests Documentation](tests/e2e/README.md).

## Monitoring

Monitor the sync process through:
1. Application logs
2. API status endpoint (`GET /api/sync/status`)
3. Generated data files (`data/products.json` and `data/attributes.json`)

