/**
 * Test for Schema Provider functionality
 */

import { SchemaProvider } from '../../services/SchemaProvider';

describe('SchemaProvider', () => {
  let schemaProvider: SchemaProvider;

  beforeEach(() => {
    schemaProvider = new SchemaProvider({
      cacheTimeout: 1000, // 1 second for testing
      maxCacheSize: 5
    });
  });

  test('should create schema provider with default options', () => {
    const provider = new SchemaProvider();
    expect(provider).toBeDefined();
  });

  test('should fetch schema and cache it', async () => {
    const connectionId = 'test-connection';
    
    const schema = await schemaProvider.fetchSchema(connectionId);
    
    expect(schema).toBeDefined();
    expect(schema.connectionId).toBe(connectionId);
    expect(schema.tables).toBeDefined();
    expect(schema.tables.length).toBeGreaterThan(0);
    
    // Should be cached now
    const cachedSchema = schemaProvider.getCachedSchema(connectionId);
    expect(cachedSchema).toEqual(schema);
  });

  test('should generate mock schema with tables and columns', async () => {
    const connectionId = 'bigquery-connection';
    
    const schema = await schemaProvider.fetchSchema(connectionId);
    
    // Check basic structure
    expect(schema.databases).toBeDefined();
    expect(schema.tables).toBeDefined();
    expect(schema.columns).toBeDefined();
    
    // Check for expected tables
    const tableNames = schema.tables.map(t => t.name);
    expect(tableNames).toContain('customers');
    expect(tableNames).toContain('orders');
    expect(tableNames).toContain('products');
    
    // Check customers table structure
    const customersTable = schema.tables.find(t => t.name === 'customers');
    expect(customersTable).toBeDefined();
    expect(customersTable!.columns.length).toBeGreaterThan(0);
    
    const customerIdColumn = customersTable!.columns.find(c => c.name === 'customer_id');
    expect(customerIdColumn).toBeDefined();
    expect(customerIdColumn!.primaryKey).toBe(true);
  });

  test('should invalidate cache correctly', async () => {
    const connectionId = 'test-connection';
    
    // Fetch and cache
    await schemaProvider.fetchSchema(connectionId);
    expect(schemaProvider.getCachedSchema(connectionId)).toBeDefined();
    
    // Invalidate
    schemaProvider.invalidateCache(connectionId);
    expect(schemaProvider.getCachedSchema(connectionId)).toBeNull();
  });

  test('should handle schema updates via subscription', (done) => {
    const connectionId = 'test-connection';
    
    const unsubscribe = schemaProvider.subscribeToSchemaUpdates((event) => {
      expect(event.connectionId).toBe(connectionId);
      expect(event.schema).toBeDefined();
      expect(event.changeType).toBe('full');
      unsubscribe();
      done();
    });

    // Trigger schema fetch which should notify subscribers
    schemaProvider.fetchSchema(connectionId);
  });

  test('should respect cache timeout', async () => {
    const connectionId = 'test-connection';
    
    // Fetch schema
    const schema1 = await schemaProvider.fetchSchema(connectionId);
    expect(schemaProvider.getCachedSchema(connectionId)).toBeDefined();
    
    // Wait for cache to expire (timeout set to 1 second in beforeEach)
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Cache should be expired
    expect(schemaProvider.getCachedSchema(connectionId)).toBeNull();
  });
});