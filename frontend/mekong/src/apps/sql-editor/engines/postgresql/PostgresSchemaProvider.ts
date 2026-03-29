/**
 * PostgreSQL Schema Provider
 * 
 * Provides schema introspection for PostgreSQL databases.
 * Extends BaseSchemaProvider to provide PostgreSQL-specific functionality.
 */

import { Client } from 'pg'
import { BaseSchemaProvider } from '../base/BaseSchemaProvider'
import { 
  DatabaseSchema, 
  DatabaseInfo, 
  SchemaInfo, 
  TableInfo, 
  ViewInfo, 
  ColumnInfo 
} from '../base/interfaces'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'
import { PostgresConnectionManager } from './PostgresConnectionManager'

/**
 * PostgreSQL-specific schema provider
 */
export class PostgresSchemaProvider extends BaseSchemaProvider {
  public readonly engine = DatabaseEngine.POSTGRESQL

  constructor(connectionManager: PostgresConnectionManager) {
    super(connectionManager)
  }

  /**
   * Load PostgreSQL schema information
   */
  protected async loadSchema(connection: DatabaseConnection): Promise<DatabaseSchema> {
    const client = this.connectionManager.getClient() as Client
    
    const databases = await this.loadDatabases(client)
    const version = await this.getServerVersion(client)

    return {
      databases,
      version,
      serverInfo: {
        engine: 'PostgreSQL',
        version,
        host: connection.host,
        port: connection.port
      }
    }
  }

  /**
   * Load database information
   */
  protected async loadDatabases(client: Client): Promise<DatabaseInfo[]> {
    const query = `
      SELECT 
        d.datname as name,
        pg_encoding_to_char(d.encoding) as charset,
        d.datcollate as collation
      FROM pg_database d
      WHERE d.datistemplate = false
      ORDER BY d.datname
    `

    const result = await client.query(query)
    const databases: DatabaseInfo[] = []

    for (const row of result.rows) {
      const schemas = await this.loadSchemas(client, row.name)
      
      databases.push({
        name: row.name,
        charset: row.charset,
        collation: row.collation,
        schemas
      })
    }

    return databases
  }

  /**
   * Load schema information for a database
   */
  protected async loadSchemas(client: Client, databaseName: string): Promise<SchemaInfo[]> {
    const query = `
      SELECT schema_name as name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `

    const result = await client.query(query)
    const schemas: SchemaInfo[] = []

    for (const row of result.rows) {
      const [tables, views] = await Promise.all([
        this.loadTables(client, row.name),
        this.loadViews(client, row.name)
      ])

      schemas.push({
        name: row.name,
        tables,
        views
      })
    }

    return schemas
  }

  /**
   * Load table information for a schema
   */
  private async loadTables(client: Client, schemaName: string): Promise<TableInfo[]> {
    const query = `
      SELECT 
        table_name as name,
        'table' as type
      FROM information_schema.tables
      WHERE table_schema = $1 AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    const result = await client.query(query, [schemaName])
    const tables: TableInfo[] = []

    for (const row of result.rows) {
      const columns = await this.loadTableColumns(client, schemaName, row.name)
      const rowCount = await this.getTableRowCount(client, schemaName, row.name)

      tables.push({
        name: row.name,
        type: 'table',
        columns,
        rowCount
      })
    }

    return tables
  }

  /**
   * Load view information for a schema
   */
  private async loadViews(client: Client, schemaName: string): Promise<ViewInfo[]> {
    const query = `
      SELECT 
        table_name as name,
        view_definition as definition
      FROM information_schema.views
      WHERE table_schema = $1
      ORDER BY table_name
    `

    const result = await client.query(query, [schemaName])
    const views: ViewInfo[] = []

    for (const row of result.rows) {
      const columns = await this.loadTableColumns(client, schemaName, row.name)

      views.push({
        name: row.name,
        definition: row.definition,
        columns
      })
    }

    return views
  }

  /**
   * Load column information for a table
   */
  private async loadTableColumns(client: Client, schemaName: string, tableName: string): Promise<ColumnInfo[]> {
    const query = `
      SELECT 
        c.column_name as name,
        c.data_type as type,
        c.is_nullable = 'YES' as nullable,
        c.column_default as default_value,
        c.character_maximum_length as max_length,
        c.numeric_precision as precision,
        c.numeric_scale as scale,
        EXISTS(
          SELECT 1 FROM information_schema.key_column_usage kcu
          JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
          WHERE kcu.table_schema = c.table_schema 
          AND kcu.table_name = c.table_name 
          AND kcu.column_name = c.column_name
          AND tc.constraint_type = 'PRIMARY KEY'
        ) as is_primary_key,
        EXISTS(
          SELECT 1 FROM information_schema.key_column_usage kcu
          JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
          WHERE kcu.table_schema = c.table_schema 
          AND kcu.table_name = c.table_name 
          AND kcu.column_name = c.column_name
          AND tc.constraint_type = 'FOREIGN KEY'
        ) as is_foreign_key
      FROM information_schema.columns c
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `

    const result = await client.query(query, [schemaName, tableName])

    return result.rows.map(row => ({
      name: row.name,
      type: row.type,
      nullable: row.nullable,
      defaultValue: row.default_value,
      isPrimaryKey: row.is_primary_key,
      isForeignKey: row.is_foreign_key,
      maxLength: row.max_length,
      precision: row.precision,
      scale: row.scale
    }))
  }

  /**
   * Get table row count
   */
  private async getTableRowCount(client: Client, schemaName: string, tableName: string): Promise<number> {
    try {
      const query = `SELECT COUNT(*) as count FROM "${schemaName}"."${tableName}"`
      const result = await client.query(query)
      return parseInt(result.rows[0].count, 10)
    } catch (error) {
      // Return undefined if we can't get the count (e.g., permissions)
      return 0
    }
  }

  /**
   * Load detailed table information
   */
  protected async loadTableInfo(client: Client, schemaName: string, tableName: string): Promise<TableInfo> {
    const columns = await this.loadTableColumns(client, schemaName, tableName)
    const rowCount = await this.getTableRowCount(client, schemaName, tableName)

    return {
      name: tableName,
      type: 'table',
      columns,
      rowCount
    }
  }

  /**
   * Load detailed view information
   */
  protected async loadViewInfo(client: Client, schemaName: string, viewName: string): Promise<ViewInfo> {
    const definitionQuery = `
      SELECT view_definition
      FROM information_schema.views
      WHERE table_schema = $1 AND table_name = $2
    `

    const result = await client.query(definitionQuery, [schemaName, viewName])
    const columns = await this.loadTableColumns(client, schemaName, viewName)

    return {
      name: viewName,
      definition: result.rows[0]?.view_definition || '',
      columns
    }
  }

  /**
   * Get PostgreSQL server version
   */
  protected async getServerVersion(client: Client): Promise<string> {
    const result = await client.query('SELECT version() as version')
    return result.rows[0]?.version || 'Unknown'
  }

  /**
   * Execute query helper
   */
  protected async executeQuery(client: Client, query: string): Promise<any> {
    return await client.query(query)
  }
}