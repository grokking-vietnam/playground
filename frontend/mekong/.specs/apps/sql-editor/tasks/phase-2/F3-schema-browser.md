# F3. Database Schema Browser

## Task Information
- **Task ID**: F3-schema-browser-real-data
- **Feature**: F3. Database Schema Browser
- **Priority**: P0
- **Effort**: Medium (3-5 days)
- **AI Complexity**: Low
- **Phase**: 2

## Dependencies
- [ ] F1. Database Connection Management completed
- [ ] F2. Enhanced Monaco Editor Integration completed
- [ ] Real database connectivity established

## Description
Replace the existing mock schema browser with real database metadata fetching, lazy loading, and search capabilities. Transform the current static tree structure into a dynamic, performant browser that works with actual database schemas.

## Acceptance Criteria
- [ ] Schema browser displays real database structure from connected databases
- [ ] Tree nodes load lazily when expanded to handle large schemas efficiently
- [ ] Search functionality returns results within 1 second across all schema objects
- [ ] Metadata (row counts, data types, constraints) displays accurately from database
- [ ] Quick actions generate syntactically correct SQL for selected objects
- [ ] Favorites and bookmarks persist across browser sessions
- [ ] Schema updates automatically when database connection changes
- [ ] Virtualized scrolling handles databases with 1000+ tables
- [ ] Context menu provides relevant actions for each object type

## Implementation Steps

### 1. Setup and Planning
- [ ] Review existing schema browser implementation in page.tsx (lines 227-833)
- [ ] Analyze current mock data structure and UI components
- [ ] Design real schema fetching architecture
- [ ] Plan caching strategy for schema metadata

### 2. Schema Metadata Service
- [ ] Create service to fetch real database schemas
- [ ] Implement lazy loading for tree nodes
- [ ] Add metadata caching with invalidation
- [ ] Handle different database engine schema formats

### 3. Enhanced Tree Component
- [ ] Replace mock data with real schema service
- [ ] Implement virtualized scrolling for large schemas
- [ ] Add search and filtering capabilities
- [ ] Enhance context menus with real actions

### 4. Integration and Optimization
- [ ] Connect to database connections from F1
- [ ] Integrate with enhanced editor from F2
- [ ] Add performance monitoring and optimization
- [ ] Implement error handling for connection failures

## Files to Create/Modify

### New Files
```
src/apps/sql-editor/
├── components/browser/
│   ├── SchemaTree.tsx (replace existing mock version)
│   ├── SchemaNode.tsx
│   ├── SchemaSearch.tsx
│   ├── SchemaContextMenu.tsx
│   ├── MetadataPanel.tsx
│   └── SchemaVirtualList.tsx
├── services/
│   ├── SchemaMetadataService.ts
│   ├── DatabaseIntrospector.ts
│   └── SchemaCache.ts
├── types/
│   ├── schema.ts
│   └── metadata.ts
├── utils/
│   ├── schemaUtils.ts
│   └── sqlGenerator.ts
└── __tests__/
    ├── components/
    │   ├── SchemaTree.test.tsx
    │   └── SchemaSearch.test.tsx
    └── services/
        ├── SchemaMetadataService.test.ts
        └── DatabaseIntrospector.test.ts
```

### Modified Files
- `src/apps/sql-editor/page.tsx` - Replace mock projects state with real schema service
- `src/apps/sql-editor/types/index.ts` - Export schema types

## Technical Specifications

### TypeScript Interfaces
```typescript
interface SchemaTreeNode {
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

interface SchemaNodeMetadata {
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
  
  // Index metadata
  unique?: boolean
  clustered?: boolean
  columns?: string[]
  
  // Constraint metadata
  constraintType?: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK'
  definition?: string
}

interface ForeignKeyInfo {
  referencedTable: string
  referencedColumn: string
  onDelete?: string
  onUpdate?: string
}

interface DatabaseIntrospectionResult {
  connectionId: string
  databases: DatabaseInfo[]
  schemas: SchemaInfo[]
  tables: TableInfo[]
  views: ViewInfo[]
  functions: FunctionInfo[]
  procedures: ProcedureInfo[]
  lastUpdated: Date
}

interface TableInfo {
  id: string
  name: string
  schema: string
  database: string
  type: 'table' | 'view' | 'materialized_view'
  columns: ColumnInfo[]
  indexes: IndexInfo[]
  constraints: ConstraintInfo[]
  rowCount?: number
  sizeBytes?: number
  description?: string
}

interface ColumnInfo {
  name: string
  dataType: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: ForeignKeyInfo
  defaultValue?: string
  autoIncrement?: boolean
  description?: string
  position: number
}
```

### Service Methods
```typescript
class SchemaMetadataService {
  async getConnectionSchema(connectionId: string): Promise<DatabaseIntrospectionResult>
  async getSchemaChildren(connectionId: string, parentPath: string[]): Promise<SchemaTreeNode[]>
  async searchSchema(connectionId: string, query: string, filters?: SchemaSearchFilters): Promise<SchemaTreeNode[]>
  async getTableMetadata(connectionId: string, tablePath: string[]): Promise<TableInfo>
  async refreshSchema(connectionId: string): Promise<void>
  getCachedSchema(connectionId: string): DatabaseIntrospectionResult | null
}

class DatabaseIntrospector {
  async introspectDatabase(connection: DatabaseConnection): Promise<DatabaseIntrospectionResult>
  async getTableList(connection: DatabaseConnection): Promise<TableInfo[]>
  async getTableColumns(connection: DatabaseConnection, tableName: string): Promise<ColumnInfo[]>
  async getTableConstraints(connection: DatabaseConnection, tableName: string): Promise<ConstraintInfo[]>
  async getTableIndexes(connection: DatabaseConnection, tableName: string): Promise<IndexInfo[]>
}

class SQLGenerator {
  generateSelectStatement(table: TableInfo, limit?: number): string
  generateDescribeStatement(table: TableInfo): string
  generateCreateTableStatement(table: TableInfo): string
  generateInsertTemplate(table: TableInfo): string
}
```

## Testing Requirements

### Unit Tests
- [ ] Schema tree rendering with real data
- [ ] Lazy loading of tree nodes
- [ ] Search functionality across different object types
- [ ] SQL generation for various database objects
- [ ] Metadata caching and invalidation
- [ ] Error handling for connection failures

### Integration Tests
- [ ] Schema browser with real database connections
- [ ] Search performance with large schemas
- [ ] Context menu actions with generated SQL
- [ ] Integration with Monaco editor for SQL insertion

### Accessibility Tests
- [ ] Tree navigation with keyboard
- [ ] Screen reader support for metadata
- [ ] ARIA labels for tree nodes and actions
- [ ] High contrast mode compatibility

## Performance Considerations
- [ ] Virtualized scrolling for large schemas (1000+ tables)
- [ ] Lazy loading of tree nodes to avoid loading entire schema at once
- [ ] Schema metadata caching with intelligent invalidation
- [ ] Debounced search to avoid excessive API calls
- [ ] Efficient tree node updates without full re-renders

## Security Considerations
- [ ] Validate schema data before display to prevent XSS
- [ ] Sanitize search queries to prevent injection attacks
- [ ] Secure handling of database metadata
- [ ] Permission-based schema visibility

## AI Implementation Guidance

### Recommended Approach
1. Start by analyzing existing mock implementation in page.tsx
2. Create schema metadata service with database introspection
3. Implement caching layer for performance
4. Replace mock tree component with real data integration
5. Add lazy loading and virtualization
6. Implement search functionality
7. Add SQL generation utilities
8. Integrate with existing UI components

### Code Examples
```typescript
// Schema tree with real data pattern
const useSchemaTree = (connectionId: string) => {
  const [nodes, setNodes] = useState<SchemaTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const loadRootNodes = async () => {
    if (!connectionId) return
    
    setLoading(true)
    try {
      const schema = await schemaMetadataService.getConnectionSchema(connectionId)
      const rootNodes = transformSchemaToTreeNodes(schema)
      setNodes(rootNodes)
    } finally {
      setLoading(false)
    }
  }
  
  const loadChildren = async (parentNode: SchemaTreeNode) => {
    const children = await schemaMetadataService.getSchemaChildren(
      connectionId, 
      parentNode.path
    )
    
    setNodes(prev => updateNodeChildren(prev, parentNode.id, children))
  }
  
  const searchSchema = async (query: string) => {
    if (!query.trim()) {
      await loadRootNodes()
      return
    }
    
    const results = await schemaMetadataService.searchSchema(connectionId, query)
    setNodes(results)
  }
  
  useEffect(() => {
    if (connectionId) {
      loadRootNodes()
    }
  }, [connectionId])
  
  return { nodes, loading, loadChildren, searchSchema }
}

// SQL generation utility pattern
const generateQuickSQL = (node: SchemaTreeNode): string => {
  switch (node.type) {
    case 'table':
    case 'view':
      return `SELECT * FROM ${node.path.join('.')} LIMIT 100;`
    
    case 'column':
      const tablePath = node.path.slice(0, -1).join('.')
      return `SELECT ${node.name} FROM ${tablePath} LIMIT 100;`
    
    default:
      return `-- ${node.name}`
  }
}
```

### Integration Points
- Connect to database connections from F1 task
- Integrate generated SQL with enhanced Monaco editor from F2
- Use existing tree UI components from page.tsx
- Maintain existing expand/collapse behavior
- Connect to query execution system (Phase 2 F4 task)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Schema browser displays real database structure
- [ ] Lazy loading works efficiently with large schemas
- [ ] Search functionality performs within 1 second
- [ ] Generated SQL is syntactically correct for target databases
- [ ] Metadata displays accurately from database sources
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests verify real database connectivity
- [ ] Performance benchmarks met for large schemas
- [ ] Accessibility requirements verified
- [ ] Documentation updated with schema browser features

## Notes
- Consider implementing schema diff functionality for detecting changes
- Plan for future collaborative features (shared bookmarks)
- Design for extensibility with additional database engines
- Consider implementing schema export functionality
- Plan for schema documentation and comments integration

---

*This task transforms the mock schema browser into a powerful, real-data driven database exploration tool.*
