import fs from 'fs/promises';
import path from 'path';
import { ProductSyncService } from '../../src/application/services/ProductSyncService';
import { ParamountProduct, ProductAttributes } from '../../src/domain/entities/ParamountProduct';

describe('ProductSyncService E2E Tests', () => {
  let productSyncService: ProductSyncService;
  const testDataDir = path.join(process.cwd(), 'test-data');
  const testProductsFile = path.join(testDataDir, 'products.json');
  const testAttributesFile = path.join(testDataDir, 'attributes.json');
  const serviceInstances: ProductSyncService[] = [];

  beforeAll(async () => {
    // Create test data directory
    try {
      await fs.mkdir(testDataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  beforeEach(() => {
    // Create a new instance for each test
    productSyncService = new ProductSyncService();
    serviceInstances.push(productSyncService);
  });

  afterEach(async () => {
    // Clean up the current service instance
    if (productSyncService) {
      try {
        await productSyncService.cleanup();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Clean up test files
    try {
      await fs.unlink(testProductsFile);
    } catch (error) {
      // File might not exist
    }
    try {
      await fs.unlink(testAttributesFile);
    } catch (error) {
      // File might not exist
    }
  });

  afterAll(async () => {
    // Clean up all service instances to close connections
    for (const service of serviceInstances) {
      try {
        await service.cleanup();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Clean up test directory
    try {
      await fs.rmdir(testDataDir);
    } catch (error) {
      // Directory might not be empty or might not exist
    }
  });

  describe('fetchProductsFromAPI', () => {
    it('should handle API errors gracefully', async () => {
      // Mock the API URL to an invalid endpoint
      const originalUrl = process.env.PARAMOUNT_API_BASE_URL;
      process.env.PARAMOUNT_API_BASE_URL = 'https://invalid-api-url.com/rest/V1';
      
      const newService = new ProductSyncService();
      serviceInstances.push(newService);
      
      await expect(newService.fetchProductsFromAPI()).rejects.toThrow();
      
      // Clean up immediately
      await newService.cleanup();
      
      // Restore original URL
      process.env.PARAMOUNT_API_BASE_URL = originalUrl;
    });
  });

  describe('extractUniqueAttributes', () => {
    it('should extract unique attributes from products correctly', () => {
      const mockProducts: ParamountProduct[] = [
        {
          id: '1',
          sku: 'SKU1',
          name: 'Product 1',
          product_web_description: 'Description 1',
          image: null,
          supplier: 'Supplier 1',
          supplier_id: '1',
          visibility: '4',
          product_rank: '100',
          wholesale_units_per_case: '6',
          loyalty_points: '10',
          points_excluded_from_retail: null,
          supplier_points: '0',
          bonus_points: '0',
          brand: 'Brand A',
          item_container_type: 'Bottle',
          country: 'Australia',
          region: 'Victoria',
          sell_by_type: '0',
          category_level_1: 'Wine',
          category_level_2: 'Red Wine',
          category_level_3: 'Cabernet Sauvignon',
          category_level_4: null,
          mirakl_product: '0',
          sold_at_cairns: '1',
          sold_at_brisbane: '0',
          sold_at_adelaide: '0',
          sold_at_melbourne: '1',
          sold_at_sydney: '1',
          is3_pl_only: '0',
          varietal: 'Cabernet Sauvignon',
          liquor_style: 'Bigger, Bolder Reds',
          consumable_units_per_case: '6',
          en_created: '2023-01-01 00:00:00',
          redeemable: '0',
          marketing_tags: null,
          wet_tax: '0.29',
          long_term_oos_locations: null,
          core_range_locations: null,
          hide_on_public: '0',
          abv: '13',
          split_pack_size: '0'
        },
        {
          id: '2',
          sku: 'SKU2',
          name: 'Product 2',
          product_web_description: 'Description 2',
          image: null,
          supplier: 'Supplier 2',
          supplier_id: '2',
          visibility: '4',
          product_rank: '200',
          wholesale_units_per_case: '12',
          loyalty_points: '20',
          points_excluded_from_retail: null,
          supplier_points: '0',
          bonus_points: '0',
          brand: 'Brand B',
          item_container_type: 'Can',
          country: 'New Zealand',
          region: 'Auckland',
          sell_by_type: '1',
          category_level_1: 'Beer',
          category_level_2: 'Craft Beer',
          category_level_3: 'IPA',
          category_level_4: 'IPA',
          mirakl_product: '0',
          sold_at_cairns: '0',
          sold_at_brisbane: '1',
          sold_at_adelaide: '1',
          sold_at_melbourne: '0',
          sold_at_sydney: '0',
          is3_pl_only: '0',
          varietal: 'Craft Beer',
          liquor_style: 'Pale Ale',
          consumable_units_per_case: '24',
          en_created: '2023-01-02 00:00:00',
          redeemable: '0',
          marketing_tags: null,
          wet_tax: '0',
          long_term_oos_locations: null,
          core_range_locations: null,
          hide_on_public: '0',
          abv: '5',
          split_pack_size: '4'
        },
        {
          id: '3',
          sku: 'SKU3',
          name: 'Product 3',
          product_web_description: 'Description 3',
          image: null,
          supplier: 'Supplier 1',
          supplier_id: '1',
          visibility: '4',
          product_rank: '300',
          wholesale_units_per_case: '6',
          loyalty_points: '15',
          points_excluded_from_retail: null,
          supplier_points: '0',
          bonus_points: '0',
          brand: 'Brand A', // Duplicate brand
          item_container_type: 'Bottle', // Duplicate container type
          country: 'Australia', // Duplicate country
          region: 'Victoria', // Duplicate region
          sell_by_type: '0',
          category_level_1: 'Wine', // Duplicate category
          category_level_2: 'White Wine', // Different subcategory
          category_level_3: 'Chardonnay', // Different varietal
          category_level_4: null,
          mirakl_product: '0',
          sold_at_cairns: '1',
          sold_at_brisbane: '1',
          sold_at_adelaide: '0',
          sold_at_melbourne: '1',
          sold_at_sydney: '1',
          is3_pl_only: '0',
          varietal: 'Chardonnay',
          liquor_style: 'Crisp Whites',
          consumable_units_per_case: '6',
          en_created: '2023-01-03 00:00:00',
          redeemable: '0',
          marketing_tags: null,
          wet_tax: '0.29',
          long_term_oos_locations: null,
          core_range_locations: null,
          hide_on_public: '0',
          abv: '12',
          split_pack_size: '0'
        }
      ];

      const attributes = productSyncService.extractUniqueAttributes(mockProducts);

      expect(attributes).toBeDefined();
      expect(attributes.brands).toEqual(['Brand A', 'Brand B']);
      expect(attributes.item_container_types).toEqual(['Bottle', 'Can']);
      expect(attributes.countries).toEqual(['Australia', 'New Zealand']);
      expect(attributes.regions).toEqual(['Auckland', 'Victoria']);
      expect(attributes.category_level_1).toEqual(['Beer', 'Wine']);
      expect(attributes.category_level_2).toEqual(['Craft Beer', 'Red Wine', 'White Wine']);
      expect(attributes.category_level_3).toEqual(['Cabernet Sauvignon', 'Chardonnay', 'IPA']);
      expect(attributes.category_level_4).toEqual(['IPA']);
      expect(attributes.varietals).toEqual(['Cabernet Sauvignon', 'Chardonnay', 'Craft Beer']);
      expect(attributes.liquor_styles).toEqual(['Bigger, Bolder Reds', 'Crisp Whites', 'Pale Ale']);
    });

    it('should handle empty products array', () => {
      const attributes = productSyncService.extractUniqueAttributes([]);
      
      expect(attributes).toBeDefined();
      expect(attributes.brands).toEqual([]);
      expect(attributes.item_container_types).toEqual([]);
      expect(attributes.countries).toEqual([]);
      expect(attributes.regions).toEqual([]);
      expect(attributes.category_level_1).toEqual([]);
      expect(attributes.category_level_2).toEqual([]);
      expect(attributes.category_level_3).toEqual([]);
      expect(attributes.category_level_4).toEqual([]);
      expect(attributes.varietals).toEqual([]);
      expect(attributes.liquor_styles).toEqual([]);
    });

    it('should handle products with null/undefined values', () => {
      const mockProducts: ParamountProduct[] = [
        {
          id: '1',
          sku: 'SKU1',
          name: 'Product 1',
          product_web_description: 'Description 1',
          image: null,
          supplier: 'Supplier 1',
          supplier_id: '1',
          visibility: '4',
          product_rank: '100',
          wholesale_units_per_case: '6',
          loyalty_points: '10',
          points_excluded_from_retail: null,
          supplier_points: '0',
          bonus_points: '0',
          brand: 'Brand A',
          item_container_type: 'Bottle',
          country: 'Australia',
          region: null, // null region
          sell_by_type: '0',
          category_level_1: 'Wine',
          category_level_2: null, // null category_level_2
          category_level_3: 'Cabernet Sauvignon',
          category_level_4: null,
          mirakl_product: '0',
          sold_at_cairns: '1',
          sold_at_brisbane: '0',
          sold_at_adelaide: '0',
          sold_at_melbourne: '1',
          sold_at_sydney: '1',
          is3_pl_only: '0',
          varietal: null, // null varietal
          liquor_style: 'Bigger, Bolder Reds',
          consumable_units_per_case: '6',
          en_created: '2023-01-01 00:00:00',
          redeemable: '0',
          marketing_tags: null,
          wet_tax: '0.29',
          long_term_oos_locations: null,
          core_range_locations: null,
          hide_on_public: '0',
          abv: '13',
          split_pack_size: '0'
        }
      ];

      const attributes = productSyncService.extractUniqueAttributes(mockProducts);

      expect(attributes).toBeDefined();
      expect(attributes.brands).toEqual(['Brand A']);
      expect(attributes.item_container_types).toEqual(['Bottle']);
      expect(attributes.countries).toEqual(['Australia']);
      expect(attributes.regions).toEqual([]); // Should be empty due to null region
      expect(attributes.category_level_1).toEqual(['Wine']);
      expect(attributes.category_level_2).toEqual([]); // Should be empty due to null category_level_2
      expect(attributes.category_level_3).toEqual(['Cabernet Sauvignon']);
      expect(attributes.category_level_4).toEqual([]);
      expect(attributes.varietals).toEqual([]); // Should be empty due to null varietal
      expect(attributes.liquor_styles).toEqual(['Bigger, Bolder Reds']);
    });
  });

  describe('syncProducts', () => {
    it('should handle sync errors gracefully', async () => {
      // Mock invalid API URL
      const originalUrl = process.env.PARAMOUNT_API_BASE_URL;
      process.env.PARAMOUNT_API_BASE_URL = 'https://invalid-api-url.com/rest/V1';
      
      const newService = new ProductSyncService();
      serviceInstances.push(newService);
      const result = await newService.syncProducts();

      expect(result.success).toBe(false);
      expect(result.productsCount).toBe(0);
      expect(result.attributesCount).toBe(0);
      expect(result.error).toBeDefined();
      
      // Clean up immediately
      await newService.cleanup();
      
      // Restore original URL
      process.env.PARAMOUNT_API_BASE_URL = originalUrl;
    });
  });

  describe('File Operations', () => {
    it('should save products to file correctly', async () => {
      const mockProducts: ParamountProduct[] = [
        {
          id: '1',
          sku: 'SKU1',
          name: 'Test Product',
          product_web_description: 'Test Description',
          image: null,
          supplier: 'Test Supplier',
          supplier_id: '1',
          visibility: '4',
          product_rank: '100',
          wholesale_units_per_case: '6',
          loyalty_points: '10',
          points_excluded_from_retail: null,
          supplier_points: '0',
          bonus_points: '0',
          brand: 'Test Brand',
          item_container_type: 'Bottle',
          country: 'Australia',
          region: 'Victoria',
          sell_by_type: '0',
          category_level_1: 'Wine',
          category_level_2: 'Red Wine',
          category_level_3: 'Cabernet Sauvignon',
          category_level_4: null,
          mirakl_product: '0',
          sold_at_cairns: '1',
          sold_at_brisbane: '0',
          sold_at_adelaide: '0',
          sold_at_melbourne: '1',
          sold_at_sydney: '1',
          is3_pl_only: '0',
          varietal: 'Cabernet Sauvignon',
          liquor_style: 'Bigger, Bolder Reds',
          consumable_units_per_case: '6',
          en_created: '2023-01-01 00:00:00',
          redeemable: '0',
          marketing_tags: null,
          wet_tax: '0.29',
          long_term_oos_locations: null,
          core_range_locations: null,
          hide_on_public: '0',
          abv: '13',
          split_pack_size: '0'
        }
      ];

      // Temporarily override the file path for testing
      const originalProductsFile = (productSyncService as any).PRODUCTS_FILE;
      (productSyncService as any).PRODUCTS_FILE = testProductsFile;

      await productSyncService.saveProductsToFile(mockProducts);

      // Verify file was created and contains correct data
      const fileContent = await fs.readFile(testProductsFile, 'utf8');
      const savedData = JSON.parse(fileContent);

      expect(savedData).toHaveProperty('lastUpdated');
      expect(savedData).toHaveProperty('totalProducts', 1);
      expect(savedData).toHaveProperty('products');
      expect(savedData.products).toHaveLength(1);
      expect(savedData.products[0]).toMatchObject(mockProducts[0]);

      // Restore original file path
      (productSyncService as any).PRODUCTS_FILE = originalProductsFile;
    });

    it('should save attributes to file correctly', async () => {
      const mockAttributes: ProductAttributes = {
        brands: ['Brand A', 'Brand B'],
        item_container_types: ['Bottle', 'Can'],
        countries: ['Australia', 'New Zealand'],
        regions: ['Victoria', 'Auckland'],
        category_level_1: ['Wine', 'Beer'],
        category_level_2: ['Red Wine', 'Craft Beer'],
        category_level_3: ['Cabernet Sauvignon', 'IPA'],
        category_level_4: ['IPA'],
        varietals: ['Cabernet Sauvignon', 'Craft Beer'],
        liquor_styles: ['Bigger, Bolder Reds', 'Pale Ale']
      };

      // Temporarily override the file path for testing
      const originalAttributesFile = (productSyncService as any).ATTRIBUTES_FILE;
      (productSyncService as any).ATTRIBUTES_FILE = testAttributesFile;

      await productSyncService.saveAttributesToFile(mockAttributes);

      // Verify file was created and contains correct data
      const fileContent = await fs.readFile(testAttributesFile, 'utf8');
      const savedData = JSON.parse(fileContent);

      expect(savedData).toHaveProperty('lastUpdated');
      expect(savedData).toHaveProperty('attributes');
      expect(savedData.attributes).toMatchObject(mockAttributes);

      // Restore original file path
      (productSyncService as any).ATTRIBUTES_FILE = originalAttributesFile;
    });
  });
});
