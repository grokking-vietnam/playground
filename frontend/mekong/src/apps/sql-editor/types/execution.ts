/**
 * Query Execution Types
 * 
 * Defines all types related to query execution, status tracking, and execution metadata.
 */

/**
 * Query execution status enum
 */
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running', 
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

/**
 * Query execution record with full metadata
 */
export interface QueryExecution {
  /** Unique execution identifier */
  id: string
  /** SQL query being executed */
  query: string
  /** Connection ID for database */
  connectionId: string
  /** Current execution status */
  status: ExecutionStatus
  /** When execution started */
  startTime: Date
  /** When execution completed (if finished) */
  endTime?: Date
  /** Total execution duration in milliseconds */
  duration?: number
  /** Number of rows returned/affected */
  rowCount?: number
  /** Bytes processed (if available) */
  bytesProcessed?: number
  /** Query cost (if available) */
  cost?: number
  /** Error information if failed */
  error?: QueryError
  /** Query results if successful */
  results?: QueryResult
  /** Additional execution metadata */
  metadata: ExecutionMetadata
}

/**
 * Query execution metadata 
 */
export interface ExecutionMetadata {
  /** User who submitted the query */
  submittedBy?: string
  /** Client version */
  clientVersion?: string
  /** Query hash for caching */
  queryHash?: string
  /** Execution priority */
  priority?: ExecutionPriority
  /** Execution mode */
  mode?: ExecutionMode
}

/**
 * Query execution options
 */
export interface ExecutionOptions {
  /** Query timeout in milliseconds */
  timeout?: number
  /** Maximum rows to return */
  maxRows?: number
  /** Execution mode */
  mode?: ExecutionMode
  /** Execution priority */
  priority?: ExecutionPriority
  /** Whether to cache results */
  cacheResults?: boolean
  /** Whether query can be cancelled */
  cancellable?: boolean
}

/**
 * Execution priority levels
 */
export enum ExecutionPriority {
  LOW = 'low',
  NORMAL = 'normal', 
  HIGH = 'high'
}

/**
 * Execution mode types
 */
export enum ExecutionMode {
  INTERACTIVE = 'interactive',
  BATCH = 'batch',
  STREAMING = 'streaming'
}

/**
 * Query error information
 */
export interface QueryError {
  /** Error code from database */
  code: string
  /** Error message */
  message: string
  /** Line number where error occurred (if available) */
  line?: number
  /** Column number where error occurred (if available) */
  column?: number
  /** Character position in query (if available) */
  position?: number
  /** Error severity level */
  severity: 'error' | 'warning' | 'notice'
  /** Helpful hint for fixing error */
  hint?: string
  /** Additional context */
  context?: string
}

/**
 * Default execution options
 */
export const DEFAULT_EXECUTION_OPTIONS: ExecutionOptions = {
  timeout: 30000, // 30 seconds
  maxRows: 10000,
  mode: ExecutionMode.INTERACTIVE,
  priority: ExecutionPriority.NORMAL,
  cacheResults: true,
  cancellable: true
}