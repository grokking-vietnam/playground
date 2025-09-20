/**
 * DatabaseIntrospector - Engine-specific database metadata fetching
 */

import type {
  DatabaseIntrospectionResult,
  DatabaseInfo,
  SchemaInfo,
  TableInfo,
  ViewInfo,
  ColumnInfo,
  IndexInfo,
  ConstraintInfo,
  FunctionInfo,
  ProcedureInfo
} from '../types/schema-tree'
import type { DatabaseConnection } from '../types/connections'
import { DatabaseEngine } from '../types/connections'

export class DatabaseIntrospector {
  
  /**
   * Introspect database to get complete schema information
   * For now, this uses enhanced mock data - in real implementation would connect to actual databases
   */
  async introspectDatabase(connectionId: string): Promise<DatabaseIntrospectionResult> {
    // In real implementation, this would:
    // 1. Get connection details from connectionId
    // 2. Establish database connection
    // 3. Execute engine-specific metadata queries
    // 4. Transform results to our common format
    
    // For now, return enhanced mock data based on engine type
    const engine = this.inferEngineFromConnectionId(connectionId)
    const mockData = this.generateEnhancedMockData(connectionId, engine)
    
    return mockData
  }

  /**
   * Get list of databases for a connection
   */
  async getDatabaseList(connectionId: string): Promise<DatabaseInfo[]> {
    const result = await this.introspectDatabase(connectionId)
    return result.databases
  }

  /**
   * Get tables for a specific database/schema
   */
  async getTableList(connectionId: string, databaseName: string, schemaName?: string): Promise<TableInfo[]> {
    const result = await this.introspectDatabase(connectionId)
    const database = result.databases.find(db => db.name === databaseName)
    if (!database) return []

    if (schemaName) {
      const schema = database.schemas.find(s => s.name === schemaName)
      return schema ? schema.tables : []
    }

    // Return tables from all schemas
    return database.schemas.flatMap(schema => schema.tables)
  }

  /**
   * Get columns for a specific table
   */
  async getTableColumns(connectionId: string, tablePath: string[]): Promise<ColumnInfo[]> {
    const [databaseName, schemaName, tableName] = tablePath
    const tables = await this.getTableList(connectionId, databaseName, schemaName)
    const table = tables.find(t => t.name === tableName)
    return table ? table.columns : []
  }

  /**
   * Get constraints for a specific table
   */
  async getTableConstraints(connectionId: string, tablePath: string[]): Promise<ConstraintInfo[]> {
    const [databaseName, schemaName, tableName] = tablePath
    const tables = await this.getTableList(connectionId, databaseName, schemaName)
    const table = tables.find(t => t.name === tableName)
    return table ? table.constraints : []
  }

  /**
   * Get indexes for a specific table
   */
  async getTableIndexes(connectionId: string, tablePath: string[]): Promise<IndexInfo[]> {
    const [databaseName, schemaName, tableName] = tablePath
    const tables = await this.getTableList(connectionId, databaseName, schemaName)
    const table = tables.find(t => t.name === tableName)
    return table ? table.indexes : []
  }

  /**
   * Private helper methods
   */

  private inferEngineFromConnectionId(connectionId: string): DatabaseEngine {
    const id = connectionId.toLowerCase()
    if (id.includes('bigquery')) return DatabaseEngine.BIGQUERY
    if (id.includes('mysql')) return DatabaseEngine.MYSQL
    if (id.includes('postgres') || id.includes('postgresql')) return DatabaseEngine.POSTGRESQL
    if (id.includes('spark')) return DatabaseEngine.SPARK_SQL
    return DatabaseEngine.BIGQUERY // default
  }

  private generateEnhancedMockData(connectionId: string, engine: DatabaseEngine): DatabaseIntrospectionResult {
    const now = new Date()
    
    const databases: DatabaseInfo[] = [{
      id: `db-${connectionId}`,
      name: this.getDefaultDatabaseName(engine),
      charset: engine === 'mysql' ? 'utf8mb4' : undefined,
      collation: engine === 'mysql' ? 'utf8mb4_unicode_ci' : undefined,
      size: 1024 * 1024 * 100, // 100MB
      schemas: [
        this.createSampleSchema(engine, 'public'),
        this.createSampleSchema(engine, 'analytics'),
        this.createSampleSchema(engine, 'staging')
      ]
    }]

    // Add additional databases for some engines
    if (engine === DatabaseEngine.BIGQUERY) {
      databases.push({
        id: `db-${connectionId}-2`,
        name: 'analytics_warehouse',
        size: 1024 * 1024 * 500, // 500MB
        schemas: [
          this.createAnalyticsSchema(engine),
          this.createReportingSchema(engine)
        ]
      })
    }

    return {
      connectionId,
      databases,
      lastUpdated: now,
      cacheKey: `${connectionId}-${now.getTime()}`
    }
  }

  private createSampleSchema(engine: DatabaseEngine, schemaName: string): SchemaInfo {
    return {
      id: `schema-${schemaName}`,
      name: schemaName,
      owner: schemaName === 'public' ? 'admin' : 'data_team',
      tables: [
        this.createUsersTable(engine, schemaName),
        this.createOrdersTable(engine, schemaName),
        this.createProductsTable(engine, schemaName),
        this.createCustomersTable(engine, schemaName)
      ],
      views: [
        this.createOrderSummaryView(engine, schemaName),
        this.createCustomerStatsView(engine, schemaName)
      ],
      functions: this.createSampleFunctions(engine, schemaName),
      procedures: this.createSampleProcedures(engine, schemaName)
    }
  }

  private createAnalyticsSchema(engine: DatabaseEngine): SchemaInfo {
    return {
      id: 'schema-analytics',
      name: 'analytics',
      owner: 'analytics_team',
      tables: [
        this.createEventsTable(engine),
        this.createUserSessionsTable(engine),
        this.createConversionsTable(engine)
      ],
      views: [
        this.createDailyMetricsView(engine),
        this.createUserFunnelView(engine)
      ],
      functions: [],
      procedures: []
    }
  }

  private createReportingSchema(engine: DatabaseEngine): SchemaInfo {
    return {
      id: 'schema-reporting',
      name: 'reporting',
      owner: 'reporting_team',
      tables: [
        this.createReportsTable(engine),
        this.createDashboardsTable(engine)
      ],
      views: [
        this.createExecutiveSummaryView(engine)
      ],
      functions: [],
      procedures: []
    }
  }

  private createUsersTable(engine: DatabaseEngine, schema: string): TableInfo {
    return {
      id: `${schema}-users`,
      name: 'users',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'User accounts and profile information',
      rowCount: 15432,
      sizeBytes: 1024 * 1024 * 2, // 2MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      owner: 'app_team',
      columns: [
        {
          id: 'users-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          autoIncrement: engine !== DatabaseEngine.BIGQUERY,
          description: 'Primary key',
          position: 1
        },
        {
          id: 'users-email',
          name: 'email',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          description: 'User email address',
          position: 2
        },
        {
          id: 'users-username',
          name: 'username',
          dataType: this.getStringDataType(engine, 50),
          nullable: false,
          primaryKey: false,
          description: 'Unique username',
          position: 3
        },
        {
          id: 'users-created_at',
          name: 'created_at',
          dataType: this.getTimestampDataType(engine),
          nullable: false,
          primaryKey: false,
          defaultValue: this.getCurrentTimestampDefault(engine),
          description: 'Account creation timestamp',
          position: 4
        },
        {
          id: 'users-last_login',
          name: 'last_login',
          dataType: this.getTimestampDataType(engine),
          nullable: true,
          primaryKey: false,
          description: 'Last login timestamp',
          position: 5
        }
      ],
      indexes: [
        {
          id: 'users-email-idx',
          name: 'users_email_idx',
          columns: ['email'],
          unique: true,
          type: 'btree'
        },
        {
          id: 'users-username-idx',
          name: 'users_username_idx',
          columns: ['username'],
          unique: true,
          type: 'btree'
        }
      ],
      constraints: [
        {
          id: 'users-pk',
          name: 'users_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        },
        {
          id: 'users-email-unique',
          name: 'users_email_unique',
          type: 'UNIQUE',
          columns: ['email']
        }
      ]
    }
  }

  private createOrdersTable(engine: DatabaseEngine, schema: string): TableInfo {
    return {
      id: `${schema}-orders`,
      name: 'orders',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Customer orders and transactions',
      rowCount: 89234,
      sizeBytes: 1024 * 1024 * 15, // 15MB
      lastModified: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      owner: 'commerce_team',
      columns: [
        {
          id: 'orders-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          autoIncrement: engine !== DatabaseEngine.BIGQUERY,
          position: 1
        },
        {
          id: 'orders-user_id',
          name: 'user_id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: false,
          foreignKey: {
            referencedTable: 'users',
            referencedColumn: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          position: 2
        },
        {
          id: 'orders-total_amount',
          name: 'total_amount',
          dataType: this.getDecimalDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'orders-status',
          name: 'status',
          dataType: this.getStringDataType(engine, 20),
          nullable: false,
          primaryKey: false,
          defaultValue: "'pending'",
          position: 4
        },
        {
          id: 'orders-created_at',
          name: 'created_at',
          dataType: this.getTimestampDataType(engine),
          nullable: false,
          primaryKey: false,
          defaultValue: this.getCurrentTimestampDefault(engine),
          position: 5
        }
      ],
      indexes: [
        {
          id: 'orders-user_id-idx',
          name: 'orders_user_id_idx',
          columns: ['user_id'],
          unique: false,
          type: 'btree'
        },
        {
          id: 'orders-status-idx',
          name: 'orders_status_idx',
          columns: ['status'],
          unique: false,
          type: 'btree'
        }
      ],
      constraints: [
        {
          id: 'orders-pk',
          name: 'orders_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        },
        {
          id: 'orders-user-fk',
          name: 'orders_user_id_fkey',
          type: 'FOREIGN_KEY',
          columns: ['user_id'],
          referencedTable: 'users',
          referencedColumns: ['id']
        }
      ]
    }
  }

  private createProductsTable(engine: DatabaseEngine, schema: string): TableInfo {
    return {
      id: `${schema}-products`,
      name: 'products',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Product catalog and inventory',
      rowCount: 5678,
      sizeBytes: 1024 * 1024 * 8, // 8MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      columns: [
        {
          id: 'products-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          autoIncrement: engine !== DatabaseEngine.BIGQUERY,
          position: 1
        },
        {
          id: 'products-name',
          name: 'name',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'products-price',
          name: 'price',
          dataType: this.getDecimalDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'products-category',
          name: 'category',
          dataType: this.getStringDataType(engine, 100),
          nullable: true,
          primaryKey: false,
          position: 4
        }
      ],
      indexes: [
        {
          id: 'products-category-idx',
          name: 'products_category_idx',
          columns: ['category'],
          unique: false,
          type: 'btree'
        }
      ],
      constraints: [
        {
          id: 'products-pk',
          name: 'products_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  private createCustomersTable(engine: DatabaseEngine, schema: string): TableInfo {
    return {
      id: `${schema}-customers`,
      name: 'customers',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Customer information and demographics',
      rowCount: 23456,
      sizeBytes: 1024 * 1024 * 5, // 5MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      columns: [
        {
          id: 'customers-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          autoIncrement: engine !== DatabaseEngine.BIGQUERY,
          position: 1
        },
        {
          id: 'customers-name',
          name: 'name',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'customers-email',
          name: 'email',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 3
        }
      ],
      indexes: [],
      constraints: [
        {
          id: 'customers-pk',
          name: 'customers_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  // Additional table creation methods for analytics schema
  private createEventsTable(engine: DatabaseEngine): TableInfo {
    return {
      id: 'analytics-events',
      name: 'events',
      schema: 'analytics',
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'User interaction events and analytics data',
      rowCount: 1245678,
      sizeBytes: 1024 * 1024 * 250, // 250MB
      lastModified: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      columns: [
        {
          id: 'events-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          position: 1
        },
        {
          id: 'events-user_id',
          name: 'user_id',
          dataType: this.getIdDataType(engine),
          nullable: true,
          primaryKey: false,
          position: 2
        },
        {
          id: 'events-event_type',
          name: 'event_type',
          dataType: this.getStringDataType(engine, 50),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'events-timestamp',
          name: 'timestamp',
          dataType: this.getTimestampDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 4
        }
      ],
      indexes: [
        {
          id: 'events-timestamp-idx',
          name: 'events_timestamp_idx',
          columns: ['timestamp'],
          unique: false,
          type: 'btree'
        }
      ],
      constraints: [
        {
          id: 'events-pk',
          name: 'events_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  private createUserSessionsTable(engine: DatabaseEngine): TableInfo {
    return {
      id: 'analytics-user_sessions',
      name: 'user_sessions',
      schema: 'analytics',
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'User session tracking data',
      rowCount: 456789,
      sizeBytes: 1024 * 1024 * 45, // 45MB
      lastModified: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      columns: [
        {
          id: 'sessions-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          position: 1
        },
        {
          id: 'sessions-user_id',
          name: 'user_id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'sessions-started_at',
          name: 'started_at',
          dataType: this.getTimestampDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'sessions-ended_at',
          name: 'ended_at',
          dataType: this.getTimestampDataType(engine),
          nullable: true,
          primaryKey: false,
          position: 4
        }
      ],
      indexes: [],
      constraints: [
        {
          id: 'sessions-pk',
          name: 'user_sessions_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  private createConversionsTable(engine: DatabaseEngine): TableInfo {
    return {
      id: 'analytics-conversions',
      name: 'conversions',
      schema: 'analytics',
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Conversion tracking and attribution',
      rowCount: 12345,
      sizeBytes: 1024 * 1024 * 3, // 3MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      columns: [
        {
          id: 'conversions-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          position: 1
        },
        {
          id: 'conversions-user_id',
          name: 'user_id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'conversions-conversion_type',
          name: 'conversion_type',
          dataType: this.getStringDataType(engine, 50),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'conversions-value',
          name: 'value',
          dataType: this.getDecimalDataType(engine),
          nullable: true,
          primaryKey: false,
          position: 4
        }
      ],
      indexes: [],
      constraints: [
        {
          id: 'conversions-pk',
          name: 'conversions_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  private createReportsTable(engine: DatabaseEngine): TableInfo {
    return {
      id: 'reporting-reports',
      name: 'reports',
      schema: 'reporting',
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Generated reports and report metadata',
      rowCount: 789,
      sizeBytes: 1024 * 1024 * 12, // 12MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      columns: [
        {
          id: 'reports-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          position: 1
        },
        {
          id: 'reports-name',
          name: 'name',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'reports-type',
          name: 'type',
          dataType: this.getStringDataType(engine, 50),
          nullable: false,
          primaryKey: false,
          position: 3
        }
      ],
      indexes: [],
      constraints: [
        {
          id: 'reports-pk',
          name: 'reports_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  private createDashboardsTable(engine: DatabaseEngine): TableInfo {
    return {
      id: 'reporting-dashboards',
      name: 'dashboards',
      schema: 'reporting',
      database: this.getDefaultDatabaseName(engine),
      type: 'table',
      description: 'Dashboard configurations and metadata',
      rowCount: 234,
      sizeBytes: 1024 * 1024 * 5, // 5MB
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      columns: [
        {
          id: 'dashboards-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: true,
          position: 1
        },
        {
          id: 'dashboards-title',
          name: 'title',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 2
        }
      ],
      indexes: [],
      constraints: [
        {
          id: 'dashboards-pk',
          name: 'dashboards_pkey',
          type: 'PRIMARY_KEY',
          columns: ['id']
        }
      ]
    }
  }

  // View creation methods
  private createOrderSummaryView(engine: DatabaseEngine, schema: string): ViewInfo {
    return {
      id: `${schema}-order_summary`,
      name: 'order_summary',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'view',
      description: 'Aggregated order statistics by user',
      rowCount: 15432,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      definition: `SELECT user_id, COUNT(*) as order_count, SUM(total_amount) as total_spent FROM orders GROUP BY user_id`,
      isUpdatable: false,
      columns: [
        {
          id: 'order_summary-user_id',
          name: 'user_id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 1
        },
        {
          id: 'order_summary-order_count',
          name: 'order_count',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'order_summary-total_spent',
          name: 'total_spent',
          dataType: this.getDecimalDataType(engine),
          nullable: true,
          primaryKey: false,
          position: 3
        }
      ],
      indexes: [],
      constraints: []
    }
  }

  private createCustomerStatsView(engine: DatabaseEngine, schema: string): ViewInfo {
    return {
      id: `${schema}-customer_stats`,
      name: 'customer_stats',
      schema,
      database: this.getDefaultDatabaseName(engine),
      type: 'view',
      description: 'Customer statistics and metrics',
      rowCount: 23456,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      definition: `SELECT c.id, c.name, c.email, COUNT(o.id) as order_count FROM customers c LEFT JOIN orders o ON c.id = o.user_id GROUP BY c.id, c.name, c.email`,
      isUpdatable: false,
      columns: [
        {
          id: 'customer_stats-id',
          name: 'id',
          dataType: this.getIdDataType(engine),
          nullable: false,
          primaryKey: false,
          position: 1
        },
        {
          id: 'customer_stats-name',
          name: 'name',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'customer_stats-email',
          name: 'email',
          dataType: this.getStringDataType(engine, 255),
          nullable: false,
          primaryKey: false,
          position: 3
        },
        {
          id: 'customer_stats-order_count',
          name: 'order_count',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 4
        }
      ],
      indexes: [],
      constraints: []
    }
  }

  private createDailyMetricsView(engine: DatabaseEngine): ViewInfo {
    return {
      id: 'analytics-daily_metrics',
      name: 'daily_metrics',
      schema: 'analytics',
      database: this.getDefaultDatabaseName(engine),
      type: 'view',
      description: 'Daily aggregated metrics and KPIs',
      rowCount: 365,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6),
      definition: `SELECT DATE(timestamp) as date, COUNT(*) as event_count, COUNT(DISTINCT user_id) as unique_users FROM events GROUP BY DATE(timestamp)`,
      isUpdatable: false,
      columns: [
        {
          id: 'daily_metrics-date',
          name: 'date',
          dataType: 'DATE',
          nullable: false,
          primaryKey: false,
          position: 1
        },
        {
          id: 'daily_metrics-event_count',
          name: 'event_count',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 2
        },
        {
          id: 'daily_metrics-unique_users',
          name: 'unique_users',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 3
        }
      ],
      indexes: [],
      constraints: []
    }
  }

  private createUserFunnelView(engine: DatabaseEngine): ViewInfo {
    return {
      id: 'analytics-user_funnel',
      name: 'user_funnel',
      schema: 'analytics',
      database: this.getDefaultDatabaseName(engine),
      type: 'view',
      description: 'User conversion funnel analysis',
      rowCount: 1000,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 4),
      definition: `SELECT event_type, COUNT(DISTINCT user_id) as unique_users FROM events GROUP BY event_type`,
      isUpdatable: false,
      columns: [
        {
          id: 'user_funnel-event_type',
          name: 'event_type',
          dataType: this.getStringDataType(engine, 50),
          nullable: false,
          primaryKey: false,
          position: 1
        },
        {
          id: 'user_funnel-unique_users',
          name: 'unique_users',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 2
        }
      ],
      indexes: [],
      constraints: []
    }
  }

  private createExecutiveSummaryView(engine: DatabaseEngine): ViewInfo {
    return {
      id: 'reporting-executive_summary',
      name: 'executive_summary',
      schema: 'reporting',
      database: this.getDefaultDatabaseName(engine),
      type: 'view',
      description: 'High-level executive summary metrics',
      rowCount: 12,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
      definition: `SELECT 'monthly' as period, COUNT(*) as report_count FROM reports WHERE type = 'monthly'`,
      isUpdatable: false,
      columns: [
        {
          id: 'executive_summary-period',
          name: 'period',
          dataType: this.getStringDataType(engine, 20),
          nullable: false,
          primaryKey: false,
          position: 1
        },
        {
          id: 'executive_summary-report_count',
          name: 'report_count',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: false,
          position: 2
        }
      ],
      indexes: [],
      constraints: []
    }
  }

  private createSampleFunctions(engine: DatabaseEngine, schema: string): FunctionInfo[] {
    if (engine === 'mysql' || engine === 'postgresql') {
      return [
        {
          id: `${schema}-calculate_discount`,
          name: 'calculate_discount',
          schema,
          parameters: [
            {
              name: 'amount',
              type: 'DECIMAL(10,2)',
              direction: 'IN',
              optional: false
            },
            {
              name: 'discount_percent',
              type: 'DECIMAL(5,2)',
              direction: 'IN',
              optional: false
            }
          ],
          returnType: 'DECIMAL(10,2)',
          language: engine === 'mysql' ? 'SQL' : 'plpgsql',
          description: 'Calculate discounted amount'
        }
      ]
    }
    return []
  }

  private createSampleProcedures(engine: DatabaseEngine, schema: string): ProcedureInfo[] {
    if (engine === 'mysql' || engine === 'postgresql') {
      return [
        {
          id: `${schema}-update_user_stats`,
          name: 'update_user_stats',
          schema,
          parameters: [
            {
              name: 'user_id',
              type: 'INTEGER',
              direction: 'IN',
              optional: false
            }
          ],
          language: engine === 'mysql' ? 'SQL' : 'plpgsql',
          description: 'Update user statistics'
        }
      ]
    }
    return []
  }

  // Helper methods for data type mapping
  private getDefaultDatabaseName(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'sample_project'
      case DatabaseEngine.MYSQL: return 'sample_db'
      case DatabaseEngine.POSTGRESQL: return 'sample_db'
      case DatabaseEngine.SPARK_SQL: return 'default'
      default: return 'sample_db'
    }
  }

  private getIdDataType(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'INT64'
      case DatabaseEngine.MYSQL: return 'INT AUTO_INCREMENT'
      case DatabaseEngine.POSTGRESQL: return 'SERIAL'
      case DatabaseEngine.SPARK_SQL: return 'BIGINT'
      default: return 'INTEGER'
    }
  }

  private getStringDataType(engine: DatabaseEngine, length: number): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'STRING'
      case DatabaseEngine.MYSQL: return `VARCHAR(${length})`
      case DatabaseEngine.POSTGRESQL: return `VARCHAR(${length})`
      case DatabaseEngine.SPARK_SQL: return 'STRING'
      default: return `VARCHAR(${length})`
    }
  }

  private getTimestampDataType(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'TIMESTAMP'
      case DatabaseEngine.MYSQL: return 'DATETIME'
      case DatabaseEngine.POSTGRESQL: return 'TIMESTAMP WITH TIME ZONE'
      case DatabaseEngine.SPARK_SQL: return 'TIMESTAMP'
      default: return 'TIMESTAMP'
    }
  }

  private getDecimalDataType(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'NUMERIC'
      case DatabaseEngine.MYSQL: return 'DECIMAL(10,2)'
      case DatabaseEngine.POSTGRESQL: return 'DECIMAL(10,2)'
      case DatabaseEngine.SPARK_SQL: return 'DECIMAL(10,2)'
      default: return 'DECIMAL(10,2)'
    }
  }

  private getCurrentTimestampDefault(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY: return 'CURRENT_TIMESTAMP()'
      case DatabaseEngine.MYSQL: return 'CURRENT_TIMESTAMP'
      case DatabaseEngine.POSTGRESQL: return 'CURRENT_TIMESTAMP'
      case DatabaseEngine.SPARK_SQL: return 'CURRENT_TIMESTAMP()'
      default: return 'CURRENT_TIMESTAMP'
    }
  }
}