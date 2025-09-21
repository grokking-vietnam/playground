/**
 * Query Results Types
 * 
 * Defines types for query results, data formatting, and result metadata.
 */

/**
 * Query result container
 */
export interface QueryResult {
  /** Column definitions */
  columns: ColumnDefinition[]
  /** Data rows */
  rows: QueryRow[]
  /** Result metadata */
  metadata: ResultMetadata
  /** Whether there are more results available */
  hasMore: boolean
  /** Total rows in complete result set (if known) */
  totalRows?: number
}

/**
 * Individual data row
 */
export interface QueryRow {
  [columnName: string]: any
}

/**
 * Column definition and metadata
 */
export interface ColumnDefinition {
  /** Column name */
  name: string
  /** Column data type */
  type: string
  /** Whether column allows NULL values */
  nullable: boolean
  /** Numeric precision (for decimal types) */
  precision?: number
  /** Numeric scale (for decimal types) */
  scale?: number
  /** Maximum length (for string types) */
  maxLength?: number
  /** Whether column is primary key */
  isPrimaryKey?: boolean
  /** Whether column is foreign key */
  isForeignKey?: boolean
  /** Default value */
  defaultValue?: any
}

/**
 * Result metadata
 */
export interface ResultMetadata {
  /** Total number of rows returned */
  totalRows: number
  /** Number of rows affected (for DML operations) */
  affectedRows?: number
  /** Query execution plan (if available) */
  executionPlan?: ExecutionPlan
  /** Warnings from database */
  warnings?: string[]
  /** Informational notices */
  notices?: string[]
  /** Database-generated query ID */
  queryId?: string
  /** Time taken to execute query */
  executionTime?: number
  /** Time taken to fetch results */
  fetchTime?: number
}

/**
 * Query execution plan
 */
export interface ExecutionPlan {
  /** Plan tree nodes */
  nodes: PlanNode[]
  /** Total estimated cost */
  totalCost: number
  /** Estimated number of rows */
  estimatedRows: number
  /** Actual number of rows (if available) */
  actualRows?: number
  /** Plan analysis */
  analysis?: PlanAnalysis
}

/**
 * Execution plan node
 */
export interface PlanNode {
  /** Node type (e.g., 'Seq Scan', 'Index Scan', 'Join') */
  nodeType: string
  /** Relation/table name (if applicable) */
  relation?: string
  /** Estimated startup cost */
  startupCost: number
  /** Estimated total cost */
  totalCost: number
  /** Estimated rows */
  estimatedRows: number
  /** Estimated row width */
  estimatedWidth: number
  /** Actual time (if available) */
  actualTime?: number
  /** Actual rows (if available) */
  actualRows?: number
  /** Filter conditions */
  filter?: string
  /** Child nodes */
  children?: PlanNode[]
}

/**
 * Plan analysis and recommendations
 */
export interface PlanAnalysis {
  /** Performance warnings */
  warnings: string[]
  /** Optimization suggestions */
  suggestions: string[]
  /** Estimated vs actual performance variance */
  variance?: number
}

/**
 * Result formatting options
 */
export interface ResultFormattingOptions {
  /** Maximum characters to display per cell */
  maxCellLength?: number
  /** Whether to format numbers with locale */
  formatNumbers?: boolean
  /** Whether to format dates */
  formatDates?: boolean
  /** Date format string */
  dateFormat?: string
  /** Whether to show null values as specific string */
  nullDisplay?: string
  /** Whether to truncate long values */
  truncateLongValues?: boolean
}

/**
 * Result export options
 */
export interface ResultExportOptions {
  /** Export format */
  format: 'csv' | 'json' | 'xlsx' | 'sql'
  /** Include column headers */
  includeHeaders?: boolean
  /** Column delimiter for CSV */
  delimiter?: string
  /** Line ending style */
  lineEndings?: 'crlf' | 'lf'
  /** Maximum rows to export */
  maxRows?: number
  /** Filename for export */
  filename?: string
}

/**
 * Default result formatting options
 */
export const DEFAULT_FORMATTING_OPTIONS: ResultFormattingOptions = {
  maxCellLength: 200,
  formatNumbers: true,
  formatDates: true,
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  nullDisplay: '(null)',
  truncateLongValues: true
}

/**
 * Data type mapping utilities
 */
export const DATA_TYPE_GROUPS = {
  NUMERIC: ['int', 'integer', 'bigint', 'smallint', 'decimal', 'numeric', 'float', 'double', 'real'],
  TEXT: ['varchar', 'char', 'text', 'string', 'nvarchar', 'nchar'],
  DATE_TIME: ['date', 'time', 'timestamp', 'datetime', 'timestamptz'],
  BOOLEAN: ['boolean', 'bool', 'bit'],
  BINARY: ['binary', 'varbinary', 'blob', 'bytea'],
  JSON: ['json', 'jsonb'],
  ARRAY: ['array'],
  UUID: ['uuid', 'uniqueidentifier']
} as const

/**
 * Helper function to get data type group
 */
export function getDataTypeGroup(type: string): keyof typeof DATA_TYPE_GROUPS | 'OTHER' {
  const normalizedType = type.toLowerCase()
  
  for (const [group, types] of Object.entries(DATA_TYPE_GROUPS)) {
    if (types.some(t => normalizedType.includes(t))) {
      return group as keyof typeof DATA_TYPE_GROUPS
    }
  }
  
  return 'OTHER'
}