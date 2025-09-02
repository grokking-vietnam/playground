/**
 * Database Connection Management Types
 * 
 * This file defines all TypeScript interfaces and enums for database connection management.
 * It supports multiple database engines with secure credential storage and connection testing.
 */

/**
 * Supported database engines
 */
export enum DatabaseEngine {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  BIGQUERY = 'bigquery',
  SNOWFLAKE = 'snowflake',
  SPARK_SQL = 'sparksql'
}

/**
 * Connection status states
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error'
}

/**
 * Complete database connection configuration
 */
export interface DatabaseConnection {
  /** Unique identifier for the connection */
  id: string
  /** User-friendly name for the connection */
  name: string
  /** Database engine type */
  engine: DatabaseEngine
  /** Database host/server address */
  host: string
  /** Database port number */
  port: number
  /** Database/schema name */
  database: string
  /** Username for authentication */
  username: string
  /** Encrypted password for authentication */
  password: string
  /** Whether to use SSL/TLS encryption */
  ssl: boolean
  /** Optional connection string (overrides individual params) */
  connectionString?: string
  /** Additional engine-specific metadata */
  metadata?: Record<string, any>
  /** When the connection was created */
  createdAt: Date
  /** When the connection was last used */
  lastUsed: Date
  /** Current connection status */
  status?: ConnectionStatus
}

/**
 * Form data for creating/editing connections
 */
export interface ConnectionFormData {
  /** User-friendly name for the connection */
  name: string
  /** Database engine type */
  engine: DatabaseEngine
  /** Database host/server address */
  host: string
  /** Database port number */
  port: number
  /** Database/schema name */
  database: string
  /** Username for authentication */
  username: string
  /** Plain text password (will be encrypted before storage) */
  password: string
  /** Whether to use SSL/TLS encryption */
  ssl: boolean
  /** Optional connection string (overrides individual params) */
  connectionString?: string
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  /** Whether the connection test was successful */
  success: boolean
  /** Error message if connection failed */
  error?: string
  /** Additional details about the connection */
  details?: {
    /** Server version information */
    version?: string
    /** Response time in milliseconds */
    responseTime?: number
    /** Available databases/schemas */
    availableDatabases?: string[]
  }
}

/**
 * Connection manager options
 */
export interface ConnectionManagerOptions {
  /** Whether to auto-test connections on creation */
  autoTest?: boolean
  /** Connection timeout in milliseconds */
  timeout?: number
  /** Whether to encrypt passwords */
  encryptPasswords?: boolean
}

/**
 * Default port numbers for different database engines
 */
export const DEFAULT_PORTS: Record<DatabaseEngine, number> = {
  [DatabaseEngine.POSTGRESQL]: 5432,
  [DatabaseEngine.MYSQL]: 3306,
  [DatabaseEngine.BIGQUERY]: 443,
  [DatabaseEngine.SNOWFLAKE]: 443,
  [DatabaseEngine.SPARK_SQL]: 10000
}

/**
 * Display names for database engines
 */
export const ENGINE_DISPLAY_NAMES: Record<DatabaseEngine, string> = {
  [DatabaseEngine.POSTGRESQL]: 'PostgreSQL',
  [DatabaseEngine.MYSQL]: 'MySQL',
  [DatabaseEngine.BIGQUERY]: 'BigQuery',
  [DatabaseEngine.SNOWFLAKE]: 'Snowflake',
  [DatabaseEngine.SPARK_SQL]: 'Spark SQL'
}

/**
 * Connection string templates for different engines
 */
export const CONNECTION_STRING_TEMPLATES: Record<DatabaseEngine, string> = {
  [DatabaseEngine.POSTGRESQL]: 'postgresql://username:password@host:port/database',
  [DatabaseEngine.MYSQL]: 'mysql://username:password@host:port/database',
  [DatabaseEngine.BIGQUERY]: 'bigquery://project-id/dataset',
  [DatabaseEngine.SNOWFLAKE]: 'snowflake://account.region.snowflakecomputing.com/database',
  [DatabaseEngine.SPARK_SQL]: 'spark://host:port/database'
}
