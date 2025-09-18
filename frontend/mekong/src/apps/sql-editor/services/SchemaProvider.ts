/**
 * SchemaProvider service for managing database schema information
 */

import type {
  DatabaseSchema,
  SchemaCache,
  SchemaProviderOptions,
  SchemaUpdateEvent,
  SchemaQuery,
  Table,
  Column,
  Database
} from '../types/schema';

export class SchemaProvider {
  private cache: SchemaCache = {};
  private options: SchemaProviderOptions;
  private updateCallbacks: ((event: SchemaUpdateEvent) => void)[] = [];

  constructor(options: Partial<SchemaProviderOptions> = {}) {
    this.options = {
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      maxCacheSize: options.maxCacheSize || 10,
      enableAutoRefresh: options.enableAutoRefresh || false
    };
  }

  /**
   * Fetch schema for a connection (mocked implementation for Phase 1)
   */
  async fetchSchema(connectionId: string, query: Partial<SchemaQuery> = {}): Promise<DatabaseSchema> {
    // Check cache first
    const cachedSchema = this.getCachedSchema(connectionId);
    if (cachedSchema) {
      return cachedSchema;
    }

    // Mock schema data for different database engines
    const schema = this.generateMockSchema(connectionId);
    
    // Cache the schema
    this.setCachedSchema(connectionId, schema);
    
    // Notify subscribers
    this.notifyUpdate({
      connectionId,
      schema,
      changeType: 'full'
    });

    return schema;
  }

  /**
   * Get cached schema if available and not expired
   */
  getCachedSchema(connectionId: string): DatabaseSchema | null {
    const cached = this.cache[connectionId];
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expires) {
      delete this.cache[connectionId];
      return null;
    }

    return cached.schema;
  }

  /**
   * Set schema in cache
   */
  private setCachedSchema(connectionId: string, schema: DatabaseSchema): void {
    // Implement LRU eviction if cache is full
    if (Object.keys(this.cache).length >= this.options.maxCacheSize) {
      const oldestKey = Object.keys(this.cache)
        .reduce((oldest, key) => 
          this.cache[key].timestamp < this.cache[oldest].timestamp ? key : oldest
        );
      delete this.cache[oldestKey];
    }

    const now = Date.now();
    this.cache[connectionId] = {
      schema,
      timestamp: now,
      expires: now + this.options.cacheTimeout
    };
  }

  /**
   * Invalidate cache for a connection
   */
  invalidateCache(connectionId: string): void {
    delete this.cache[connectionId];
  }

  /**
   * Invalidate all cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Subscribe to schema updates
   */
  subscribeToSchemaUpdates(callback: (event: SchemaUpdateEvent) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of schema updates
   */
  private notifyUpdate(event: SchemaUpdateEvent): void {
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Generate mock schema data for different database engines
   */
  private generateMockSchema(connectionId: string): DatabaseSchema {
    const now = new Date();
    
    // Determine engine from connection ID (for mock purposes)
    const engine = this.getEngineFromConnectionId(connectionId);
    
    const databases: Database[] = [{
      id: 'default-db',
      name: this.getDefaultDatabaseName(engine),
      tables: []
    }];

    const tables: Table[] = [
      {
        id: 'customers',
        name: 'customers',
        schema: 'public',
        database: databases[0].name,
        type: 'table',
        columns: [
          {
            id: 'customer_id',
            name: 'customer_id',
            dataType: 'INTEGER',
            nullable: false,
            primaryKey: true
          },
          {
            id: 'customer_name',
            name: 'customer_name',
            dataType: 'VARCHAR(255)',
            nullable: false,
            primaryKey: false
          },
          {
            id: 'email',
            name: 'email',
            dataType: 'VARCHAR(255)',
            nullable: true,
            primaryKey: false
          },
          {
            id: 'created_at',
            name: 'created_at',
            dataType: engine === 'bigquery' ? 'TIMESTAMP' : 'DATETIME',
            nullable: false,
            primaryKey: false
          }
        ],
        indexes: [],
        constraints: []
      },
      {
        id: 'orders',
        name: 'orders',
        schema: 'public',
        database: databases[0].name,
        type: 'table',
        columns: [
          {
            id: 'order_id',
            name: 'order_id',
            dataType: 'INTEGER',
            nullable: false,
            primaryKey: true
          },
          {
            id: 'customer_id',
            name: 'customer_id',
            dataType: 'INTEGER',
            nullable: false,
            primaryKey: false,
            foreignKey: {
              referencedTable: 'customers',
              referencedColumn: 'customer_id'
            }
          },
          {
            id: 'order_date',
            name: 'order_date',
            dataType: engine === 'bigquery' ? 'DATE' : 'DATE',
            nullable: false,
            primaryKey: false
          },
          {
            id: 'total_amount',
            name: 'total_amount',
            dataType: engine === 'bigquery' ? 'NUMERIC' : 'DECIMAL(10,2)',
            nullable: false,
            primaryKey: false
          }
        ],
        indexes: [],
        constraints: []
      },
      {
        id: 'products',
        name: 'products',
        schema: 'public',
        database: databases[0].name,
        type: 'table',
        columns: [
          {
            id: 'product_id',
            name: 'product_id',
            dataType: 'INTEGER',
            nullable: false,
            primaryKey: true
          },
          {
            id: 'product_name',
            name: 'product_name',
            dataType: 'VARCHAR(255)',
            nullable: false,
            primaryKey: false
          },
          {
            id: 'price',
            name: 'price',
            dataType: engine === 'bigquery' ? 'NUMERIC' : 'DECIMAL(10,2)',
            nullable: false,
            primaryKey: false
          },
          {
            id: 'category',
            name: 'category',
            dataType: 'VARCHAR(100)',
            nullable: true,
            primaryKey: false
          }
        ],
        indexes: [],
        constraints: []
      }
    ];

    // Update databases with tables
    databases[0].tables = tables;

    const columns = tables.flatMap(table => table.columns);

    return {
      connectionId,
      databases,
      tables,
      columns,
      relationships: [
        {
          id: 'orders_customers_fk',
          fromTable: 'orders',
          toTable: 'customers',
          fromColumns: ['customer_id'],
          toColumns: ['customer_id'],
          type: 'one-to-many'
        }
      ],
      functions: [],
      procedures: [],
      lastUpdated: now
    };
  }

  private getEngineFromConnectionId(connectionId: string): string {
    // Simple heuristic based on connection ID
    if (connectionId.includes('bigquery')) return 'bigquery';
    if (connectionId.includes('mysql')) return 'mysql';
    if (connectionId.includes('postgres')) return 'postgresql';
    if (connectionId.includes('spark')) return 'spark';
    return 'default';
  }

  private getDefaultDatabaseName(engine: string): string {
    switch (engine) {
      case 'bigquery': return 'my-project';
      case 'mysql': return 'mysql';
      case 'postgresql': return 'postgres';
      case 'spark': return 'default';
      default: return 'database';
    }
  }
}