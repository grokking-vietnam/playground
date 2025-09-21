/**
 * Enhanced schema tree types for real database metadata
 */

export interface SchemaTreeNode {
  id: string
  name: string
  type: 'connection' | 'database' | 'schema' | 'table' | 'view' | 'column' | 'index' | 'constraint'
  icon: string
  children?: SchemaTreeNode[]
  metadata?: SchemaNodeMetadata
  expanded?: boolean
  loading?: boolean
  hasChildren?: boolean
  parentId?: string
  path: string[]
}

export interface SchemaNodeMetadata {
  // Table/View metadata
  rowCount?: number
  sizeBytes?: number
  lastModified?: Date
  description?: string
  
  // Column metadata
  dataType?: string
  nullable?: boolean
  primaryKey?: boolean
  foreignKey?: ForeignKeyInfo
  defaultValue?: string
  autoIncrement?: boolean
  position?: number
  
  // Index metadata
  unique?: boolean
  clustered?: boolean
  columns?: string[]
  
  // Constraint metadata
  constraintType?: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL'
  referencedTable?: string
  referencedColumns?: string[]
  checkExpression?: string
  
  // Schema/Database metadata
  owner?: string
  charset?: string
  collation?: string
  
  // Connection metadata
  engine?: string
  host?: string
  port?: number
  status?: 'connected' | 'disconnected' | 'error'
}

export interface ForeignKeyInfo {
  referencedSchema?: string
  referencedTable: string
  referencedColumn: string
  onDelete?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION'
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION'
}

export interface DatabaseIntrospectionResult {
  connectionId: string
  databases: DatabaseInfo[]
  lastUpdated: Date
  cacheKey: string
}

export interface DatabaseInfo {
  id: string
  name: string
  schemas: SchemaInfo[]
  charset?: string
  collation?: string
  size?: number
}

export interface SchemaInfo {
  id: string
  name: string
  tables: TableInfo[]
  views: ViewInfo[]
  functions: FunctionInfo[]
  procedures: ProcedureInfo[]
  owner?: string
}

export interface TableInfo {
  id: string
  name: string
  schema: string
  database: string
  type: 'table' | 'view' | 'materialized_view'
  columns: ColumnInfo[]
  indexes: IndexInfo[]
  constraints: ConstraintInfo[]
  description?: string
  rowCount?: number
  sizeBytes?: number
  lastModified?: Date
  owner?: string
}

export interface ViewInfo extends Omit<TableInfo, 'type'> {
  type: 'view' | 'materialized_view'
  definition?: string
  isUpdatable?: boolean
}

export interface ColumnInfo {
  id: string
  name: string
  dataType: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: ForeignKeyInfo
  defaultValue?: string
  autoIncrement?: boolean
  description?: string
  position: number
  maxLength?: number
  precision?: number
  scale?: number
}

export interface IndexInfo {
  id: string
  name: string
  columns: string[]
  unique: boolean
  clustered?: boolean
  type: string
  description?: string
}

export interface ConstraintInfo {
  id: string
  name: string
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL'
  columns: string[]
  referencedTable?: string
  referencedColumns?: string[]
  checkExpression?: string
  description?: string
}

export interface FunctionInfo {
  id: string
  name: string
  schema: string
  parameters: ParameterInfo[]
  returnType?: string
  language?: string
  description?: string
  definition?: string
}

export interface ProcedureInfo {
  id: string
  name: string
  schema: string
  parameters: ParameterInfo[]
  language?: string
  description?: string
  definition?: string
}

export interface ParameterInfo {
  name: string
  type: string
  direction: 'IN' | 'OUT' | 'INOUT'
  optional: boolean
  defaultValue?: string
  description?: string
}

export interface SchemaSearchFilters {
  types?: SchemaTreeNode['type'][]
  schemas?: string[]
  includeSystemObjects?: boolean
  includeTables?: boolean
  includeViews?: boolean
  includeColumns?: boolean
  includeFunctions?: boolean
  includeProcedures?: boolean
}

export interface SchemaSearchResult {
  nodes: SchemaTreeNode[]
  totalCount: number
  searchTime: number
}

// Cache-related types
export interface SchemaTreeCache {
  [connectionId: string]: {
    rootNodes: SchemaTreeNode[]
    nodeMap: Map<string, SchemaTreeNode>
    searchIndex: SchemaSearchIndex
    timestamp: number
    expires: number
  }
}

export interface SchemaSearchIndex {
  byName: Map<string, SchemaTreeNode[]>
  byType: Map<SchemaTreeNode['type'], SchemaTreeNode[]>
  byPath: Map<string, SchemaTreeNode>
}