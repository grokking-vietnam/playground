/**
 * Database Engine Plugin Interfaces
 * 
 * This file defines the core interfaces for the database engine plugin architecture.
 * Each database engine must implement these interfaces to provide a consistent API.
 */

import { DatabaseConnection, ConnectionTestResult, DatabaseEngine } from '../../types/connections'

/**
 * Query execution options
 */
export interface ExecutionOptions {
  timeout?: number
  maxRows?: number
  streaming?: boolean
  parameters?: Record<string, any>
}

/**
 * Query execution result
 */
export interface QueryResult {
  executionId: string
  success: boolean
  columns: ColumnDefinition[]
  rows: any[][]
  rowCount: number
  executionTime: number
  error?: string
  metadata?: Record<string, any>
}

/**
 * Column definition
 */
export interface ColumnDefinition {
  name: string
  type: string
  nullable: boolean
  maxLength?: number
  precision?: number
  scale?: number
}

/**
 * Database schema information
 */
export interface DatabaseSchema {
  databases: DatabaseInfo[]
  version: string
  serverInfo?: Record<string, any>
}

export interface DatabaseInfo {
  name: string
  schemas: SchemaInfo[]
  charset?: string
  collation?: string
}

export interface SchemaInfo {
  name: string
  tables: TableInfo[]
  views: ViewInfo[]
}

export interface TableInfo {
  name: string
  type: 'table' | 'view'
  columns: ColumnInfo[]
  rowCount?: number
}

export interface ViewInfo {
  name: string
  definition: string
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  maxLength?: number
  precision?: number
  scale?: number
}

/**
 * Query validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  line: number
  column: number
  message: string
  suggestion?: string
}

/**
 * Connection Manager Interface
 */
export interface ConnectionManager {
  connect(connection: DatabaseConnection): Promise<void>
  disconnect(): Promise<void>
  testConnection(connection: DatabaseConnection): Promise<ConnectionTestResult>
  isConnected(): boolean
  getConnectionInfo(): DatabaseConnection | null
}

/**
 * Query Executor Interface
 */
export interface QueryExecutor {
  execute(query: string, options?: ExecutionOptions): Promise<QueryResult>
  cancel(executionId: string): Promise<boolean>
  validateQuery(query: string): Promise<ValidationResult>
}

/**
 * Schema Provider Interface
 */
export interface SchemaProvider {
  getSchema(connection: DatabaseConnection): Promise<DatabaseSchema>
  refreshSchema(connection: DatabaseConnection): Promise<DatabaseSchema>
  getTableInfo(connection: DatabaseConnection, schemaName: string, tableName: string): Promise<TableInfo>
  getViewInfo(connection: DatabaseConnection, schemaName: string, viewName: string): Promise<ViewInfo>
}

/**
 * SQL Language Service Interface
 */
export interface SQLLanguageService {
  getKeywords(): string[]
  getDataTypes(): string[]
  getFunctions(): string[]
  formatQuery(query: string): string
  getCompletionItems(query: string, position: number): CompletionItem[]
}

export interface CompletionItem {
  label: string
  kind: 'keyword' | 'function' | 'table' | 'column' | 'datatype'
  detail?: string
  documentation?: string
  insertText?: string
}

/**
 * Result Processor Interface
 */
export interface ResultProcessor {
  processResults(rawResults: any): QueryResult
  formatValue(value: any, columnType: string): any
  exportResults(results: QueryResult, format: 'csv' | 'json' | 'xlsx'): Promise<Blob>
}

/**
 * Metadata Extractor Interface
 */
export interface MetadataExtractor {
  extractTableMetadata(connection: DatabaseConnection, tableName: string): Promise<Record<string, any>>
  extractIndexInfo(connection: DatabaseConnection, tableName: string): Promise<IndexInfo[]>
  extractConstraints(connection: DatabaseConnection, tableName: string): Promise<ConstraintInfo[]>
}

export interface IndexInfo {
  name: string
  columns: string[]
  isUnique: boolean
  isPrimary: boolean
}

export interface ConstraintInfo {
  name: string
  type: 'primary' | 'foreign' | 'unique' | 'check'
  columns: string[]
  referencedTable?: string
  referencedColumns?: string[]
}

/**
 * Main Database Engine Plugin Interface
 */
export interface DatabaseEnginePlugin {
  engine: DatabaseEngine
  connectionManager: ConnectionManager
  queryExecutor: QueryExecutor
  schemaProvider: SchemaProvider
  sqlLanguageService: SQLLanguageService
  resultProcessor: ResultProcessor
  metadataExtractor: MetadataExtractor
  
  /**
   * Initialize the plugin with configuration
   */
  initialize(config?: Record<string, any>): Promise<void>
  
  /**
   * Clean up resources
   */
  dispose(): Promise<void>
  
  /**
   * Get plugin capabilities
   */
  getCapabilities(): PluginCapabilities
}

/**
 * Plugin capabilities
 */
export interface PluginCapabilities {
  supportsTransactions: boolean
  supportsPreparedStatements: boolean
  supportsStreaming: boolean
  supportsSSL: boolean
  supportsConnectionPooling: boolean
  supportsConcurrentQueries: boolean
  maxConnections?: number
  supportedAuthMethods: string[]
}