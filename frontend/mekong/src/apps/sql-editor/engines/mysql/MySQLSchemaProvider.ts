/**
 * MySQL Schema Provider
 * 
 * Provides schema introspection for MySQL databases.
 * Extends BaseSchemaProvider to provide MySQL-specific functionality.
 */

import { Connection } from 'mysql2/promise'
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
import { MySQLConnectionManager } from './MySQLConnectionManager'

/**
 * MySQL-specific schema provider
 */
export class MySQLSchemaProvider extends BaseSchemaProvider {
  public readonly engine = DatabaseEngine.MYSQL

  constructor(connectionManager: MySQLConnectionManager) {
    super(connectionManager)
  }

  /**
   * Load MySQL schema information
   */
  protected async loadSchema(connection: DatabaseConnection): Promise<DatabaseSchema> {
    const client = this.connectionManager.getClient() as Connection
    
    const databases = await this.loadDatabases(client)
    const version = await this.getServerVersion(client)

    return {
      databases,
      version,
      serverInfo: {
        engine: 'MySQL',
        version,
        host: connection.host,
        port: connection.port
      }
    }
  }

  /**
   * Load database information
   */
  protected async loadDatabases(client: Connection): Promise<DatabaseInfo[]> {
    const [rows] = await client.execute(`
      SELECT 
        SCHEMA_NAME as name,
        DEFAULT_CHARACTER_SET_NAME as charset,
        DEFAULT_COLLATION_NAME as collation
      FROM information_schema.SCHEMATA
      WHERE SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
      ORDER BY SCHEMA_NAME
    `)

    const databases: DatabaseInfo[] = []
    const databaseRows = rows as any[]

    for (const row of databaseRows) {
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
  protected async loadSchemas(client: Connection, databaseName: string): Promise<SchemaInfo[]> {
    // MySQL doesn't have schemas like PostgreSQL, databases ARE schemas
    const [tables, views] = await Promise.all([
      this.loadTables(client, databaseName),
      this.loadViews(client, databaseName)
    ])

    return [{
      name: databaseName,
      tables,
      views
    }]
  }

  /**
   * Load table information for a database
   */
  private async loadTables(client: Connection, databaseName: string): Promise<TableInfo[]> {
    const [rows] = await client.execute(`
      SELECT 
        TABLE_NAME as name,
        TABLE_TYPE as type,
        TABLE_ROWS as row_count
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [databaseName])

    const tables: TableInfo[] = []
    const tableRows = rows as any[]

    for (const row of tableRows) {
      const columns = await this.loadTableColumns(client, databaseName, row.name)

      tables.push({
        name: row.name,
        type: 'table',
        columns,
        rowCount: row.row_count || 0
      })
    }

    return tables
  }

  /**
   * Load view information for a database
   */
  private async loadViews(client: Connection, databaseName: string): Promise<ViewInfo[]> {
    const [rows] = await client.execute(`
      SELECT 
        TABLE_NAME as name,
        VIEW_DEFINITION as definition
      FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [databaseName])

    const views: ViewInfo[] = []
    const viewRows = rows as any[]

    for (const row of viewRows) {
      const columns = await this.loadTableColumns(client, databaseName, row.name)

      views.push({
        name: row.name,
        definition: row.definition || '',
        columns
      })
    }

    return views
  }

  /**
   * Load column information for a table
   */
  private async loadTableColumns(client: Connection, databaseName: string, tableName: string): Promise<ColumnInfo[]> {
    const [rows] = await client.execute(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE = 'YES' as nullable,
        COLUMN_DEFAULT as default_value,
        CHARACTER_MAXIMUM_LENGTH as max_length,
        NUMERIC_PRECISION as precision,
        NUMERIC_SCALE as scale,
        COLUMN_KEY = 'PRI' as is_primary_key,
        COLUMN_KEY = 'MUL' as is_foreign_key
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [databaseName, tableName])

    const columnRows = rows as any[]
    return columnRows.map(row => ({
      name: row.name,
      type: row.type,
      nullable: Boolean(row.nullable),
      defaultValue: row.default_value,
      isPrimaryKey: Boolean(row.is_primary_key),
      isForeignKey: Boolean(row.is_foreign_key),
      maxLength: row.max_length,
      precision: row.precision,
      scale: row.scale
    }))
  }

  /**
   * Load detailed table information
   */
  protected async loadTableInfo(client: Connection, schemaName: string, tableName: string): Promise<TableInfo> {
    const columns = await this.loadTableColumns(client, schemaName, tableName)
    
    // Get row count
    const [countResult] = await client.execute(`SELECT COUNT(*) as count FROM \`${schemaName}\`.\`${tableName}\``)
    const rowCount = (countResult as any[])[0]?.count || 0

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
  protected async loadViewInfo(client: Connection, schemaName: string, viewName: string): Promise<ViewInfo> {
    const [rows] = await client.execute(`
      SELECT VIEW_DEFINITION as definition
      FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [schemaName, viewName])

    const columns = await this.loadTableColumns(client, schemaName, viewName)
    const definition = (rows as any[])[0]?.definition || ''

    return {
      name: viewName,
      definition,
      columns
    }
  }

  /**
   * Get MySQL server version
   */
  protected async getServerVersion(client: Connection): Promise<string> {
    const [rows] = await client.execute('SELECT VERSION() as version')
    const result = rows as any[]
    return result[0]?.version || 'Unknown'
  }

  /**
   * Execute query helper
   */
  protected async executeQuery(client: Connection, query: string): Promise<any> {
    return await client.execute(query)
  }
}