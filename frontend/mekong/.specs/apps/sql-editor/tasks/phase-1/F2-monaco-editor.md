# F2. Enhanced Monaco Editor Integration

## Task Information
- **Task ID**: F2-monaco-editor-enhancement
- **Feature**: F2. Enhanced Monaco Editor Integration
- **Priority**: P0
- **Effort**: Large (1-2 weeks)
- **AI Complexity**: Medium
- **Phase**: 1

## Dependencies
- [ ] F1. Database Connection Management completed
- [ ] Monaco Editor (@monaco-editor/react ^4.7.0) available
- [ ] Database connection schema available

## Description
Enhance the existing Monaco editor with advanced SQL language features including engine-specific syntax highlighting, schema-aware autocomplete, real-time error detection, and intelligent code formatting. This transforms the basic SQL editor into a professional IDE-like experience.

## Acceptance Criteria
- [ ] Syntax highlighting adapts to selected database engine
- [ ] Autocomplete suggests table and column names from active connection
- [ ] Function signatures appear on hover for database-specific functions
- [ ] SQL syntax errors are highlighted in real-time with meaningful messages
- [ ] Code formatting preserves query semantics and follows SQL conventions
- [ ] Bracket matching and auto-closing work correctly for SQL syntax
- [ ] IntelliSense provides context-aware suggestions based on cursor position
- [ ] Support for multiple SQL dialects (PostgreSQL, MySQL, BigQuery, etc.)
- [ ] Query validation before execution with clear error indicators

## Implementation Steps

### 1. Setup and Planning
- [ ] Review existing Monaco editor implementation in page.tsx (lines 1053-1078)
- [ ] Research Monaco language service extension patterns
- [ ] Plan SQL language service architecture
- [ ] Design schema integration approach

### 2. SQL Language Service Development
- [ ] Create SQL language configuration for different engines
- [ ] Implement completion item provider for tables/columns
- [ ] Add hover provider for function documentation
- [ ] Create diagnostic provider for syntax validation
- [ ] Implement formatting provider with SQL-specific rules

### 3. Schema Integration
- [ ] Create schema provider service
- [ ] Implement schema caching mechanism
- [ ] Add schema-aware autocomplete
- [ ] Connect schema updates to connection changes

### 4. Enhanced Editor Component
- [ ] Wrap Monaco editor with enhanced SQL features
- [ ] Add engine-specific configuration
- [ ] Implement real-time schema integration
- [ ] Add advanced editor options and settings

### 5. Testing and Quality
- [ ] Test language service with different SQL dialects
- [ ] Verify autocomplete accuracy with real database schemas
- [ ] Test error detection and formatting
- [ ] Performance testing with large schemas

## Files to Create/Modify

### New Files
```
src/apps/sql-editor/
├── components/editor/
│   ├── EnhancedSQLEditor.tsx
│   ├── EditorSettings.tsx
│   └── EditorStatusBar.tsx
├── services/
│   ├── SQLLanguageService.ts
│   ├── SchemaProvider.ts
│   ├── SQLFormatter.ts
│   └── SQLValidator.ts
├── types/
│   ├── editor.ts
│   └── schema.ts
├── utils/
│   ├── sqlDialects.ts
│   └── editorConfig.ts
└── __tests__/
    ├── components/
    │   └── EnhancedSQLEditor.test.tsx
    └── services/
        ├── SQLLanguageService.test.ts
        ├── SchemaProvider.test.ts
        └── SQLFormatter.test.ts
```

### Modified Files
- `src/apps/sql-editor/page.tsx` - Replace basic Monaco editor with enhanced version
- `src/apps/sql-editor/types/index.ts` - Export editor and schema types

## Technical Specifications

### TypeScript Interfaces
```typescript
interface SQLLanguageConfig {
  engine: DatabaseEngine
  schema: DatabaseSchema
  keywords: string[]
  functions: SQLFunction[]
  operators: string[]
  dataTypes: string[]
}

interface DatabaseSchema {
  connectionId: string
  databases: Database[]
  tables: Table[]
  columns: Column[]
  relationships: Relationship[]
  functions: SQLFunction[]
  procedures: StoredProcedure[]
  lastUpdated: Date
}

interface Table {
  id: string
  name: string
  schema: string
  database: string
  type: 'table' | 'view' | 'materialized_view'
  columns: Column[]
  indexes: Index[]
  constraints: Constraint[]
  description?: string
  rowCount?: number
}

interface Column {
  id: string
  name: string
  dataType: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: ForeignKey
  defaultValue?: string
  description?: string
}

interface SQLFunction {
  name: string
  description: string
  syntax: string
  returnType: string
  parameters: Parameter[]
  category: 'aggregate' | 'scalar' | 'table' | 'window'
  engine?: DatabaseEngine
}

interface EditorSettings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoComplete: boolean
  syntaxHighlighting: boolean
  errorHighlighting: boolean
  formatOnType: boolean
}
```

### Service Methods
```typescript
class SQLLanguageService {
  registerLanguageProviders(engine: DatabaseEngine, schema: DatabaseSchema): void
  updateSchema(schema: DatabaseSchema): void
  getCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.CompletionItem[]
  getHoverInfo(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.Hover | null
  validateSyntax(model: monaco.editor.ITextModel): monaco.editor.IMarkerData[]
  formatDocument(model: monaco.editor.ITextModel): monaco.editor.ITextEdit[]
}

class SchemaProvider {
  async fetchSchema(connectionId: string): Promise<DatabaseSchema>
  getCachedSchema(connectionId: string): DatabaseSchema | null
  invalidateCache(connectionId: string): void
  subscribeToSchemaUpdates(callback: (schema: DatabaseSchema) => void): void
}
```

## Testing Requirements

### Unit Tests
- [ ] SQL language service registration
- [ ] Completion item generation for tables/columns
- [ ] Hover information accuracy
- [ ] Syntax validation for different SQL dialects
- [ ] SQL formatting preservation of semantics
- [ ] Schema provider caching mechanism

### Integration Tests
- [ ] Editor integration with database connections
- [ ] Schema updates on connection change
- [ ] Real-time error highlighting
- [ ] Autocomplete with live database schema

### Accessibility Tests
- [ ] Editor keyboard navigation
- [ ] Screen reader compatibility for error messages
- [ ] ARIA labels for editor controls
- [ ] High contrast mode support

## Performance Considerations
- [ ] Schema caching to avoid repeated API calls
- [ ] Debounced syntax validation to avoid excessive processing
- [ ] Lazy loading of language services
- [ ] Efficient completion item filtering for large schemas
- [ ] Memory management for large SQL documents

## Security Considerations
- [ ] Sanitize schema data before display
- [ ] Validate SQL queries before execution hints
- [ ] Secure handling of connection credentials in schema fetching
- [ ] XSS prevention in hover information display

## AI Implementation Guidance

### Recommended Approach
1. Start with basic SQL language service registration
2. Implement schema provider with caching
3. Add completion item provider for basic table/column suggestions
4. Enhance with function signatures and hover information
5. Implement syntax validation and error highlighting
6. Add SQL formatting capabilities
7. Integrate with existing editor in page.tsx
8. Add advanced features like query optimization hints

### Code Examples
```typescript
// Language service registration pattern
const configureSQLLanguage = (engine: DatabaseEngine, schema: DatabaseSchema) => {
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const suggestions = generateSuggestions(model, position, schema, engine)
      
      return {
        suggestions: suggestions.map(item => ({
          label: item.name,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: item.name,
          detail: item.description,
          documentation: item.documentation
        }))
      }
    }
  })
  
  monaco.languages.registerHoverProvider('sql', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return null
      
      const hoverInfo = getHoverInfo(word.word, schema, engine)
      if (!hoverInfo) return null
      
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${hoverInfo.name}**` },
          { value: hoverInfo.description },
          { value: `\`\`\`sql\n${hoverInfo.syntax}\n\`\`\`` }
        ]
      }
    }
  })
}
```

### Integration Points
- Connect to database connections from F1 task
- Update schema when connection changes
- Integrate with query execution system (Phase 2)
- Support query tab management from existing implementation

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Enhanced editor replaces basic Monaco implementation
- [ ] Autocomplete works with real database schemas
- [ ] Syntax highlighting adapts to selected database engine
- [ ] Error detection provides actionable feedback
- [ ] SQL formatting maintains query correctness
- [ ] Performance benchmarks met (autocomplete <300ms)
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests verify schema integration
- [ ] Accessibility requirements verified
- [ ] Documentation updated with editor features

## Notes
- Consider implementing custom SQL parser for advanced features
- Plan for future AI-powered query suggestions
- Ensure compatibility with different Monaco editor versions
- Consider implementing query execution plan visualization hooks
- Plan for collaborative editing features (Phase 3)

---

*This task transforms the basic SQL editor into a professional development environment with intelligent features.*
