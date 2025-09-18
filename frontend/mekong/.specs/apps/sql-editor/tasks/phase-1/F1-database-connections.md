# F1. Database Connection Management

## Task Information
- **Task ID**: F1-database-connections
- **Feature**: F1. Database Connection Management
- **Priority**: P0
- **Effort**: Medium (3-5 days)
- **AI Complexity**: Low
- **Phase**: 1
- **Assignee**: v2kk
- **Status**: WIP (Work in Progress)

## Dependencies
- [ ] Project structure setup completed
- [ ] shadcn/ui components installed and configured
- [ ] Basic TypeScript interfaces defined

## Description
Implement a comprehensive database connection management system that allows users to configure, test, and manage connections to multiple database engines. This replaces the current mock engine selection with real database connectivity.

## Acceptance Criteria
- [ ] Users can add new database connections via a form interface
- [ ] Connection parameters are validated before saving
- [ ] Connection test functionality works for valid configurations
- [ ] Sensitive data (passwords) are encrypted in local storage
- [ ] Users can edit and delete existing connections
- [ ] Connection status (connected/disconnected) is displayed in real-time
- [ ] Support for 5+ database engines (PostgreSQL, MySQL, BigQuery, Snowflake, Spark SQL)
- [ ] Connection dropdown in existing UI shows real connections instead of mock data

## Implementation Steps

### 1. Setup and Planning
- [ ] Review existing engine selection in `page.tsx` (lines 101-128)
- [ ] Plan replacement of mock `availableEngines` state
- [ ] Design connection storage architecture
- [ ] Define encryption strategy for sensitive data

### 2. Core Implementation
- [ ] Create TypeScript interfaces for database connections
- [ ] Implement connection manager service with CRUD operations
- [ ] Create connection form component with validation
- [ ] Implement connection testing functionality
- [ ] Add encryption/decryption utilities
- [ ] Create connection storage hook
- [ ] Replace mock engine selector with real connection management

### 3. Testing and Quality
- [ ] Write unit tests for connection manager service
- [ ] Test form validation with various input scenarios
- [ ] Test connection encryption/decryption
- [ ] Test connection status monitoring
- [ ] Verify integration with existing UI components

### 4. Documentation
- [ ] Add JSDoc comments to all public methods
- [ ] Document connection configuration options
- [ ] Create usage examples for different database types

## Files to Create/Modify

### New Files
```
src/apps/sql-editor/
├── components/connections/
│   ├── ConnectionForm.tsx
│   ├── ConnectionList.tsx
│   └── ConnectionStatus.tsx
├── services/
│   ├── ConnectionManager.ts
│   └── EncryptionService.ts
├── hooks/
│   └── useConnections.ts
├── types/
│   └── connections.ts
├── utils/
│   └── connectionValidators.ts
└── __tests__/
    ├── components/
    │   ├── ConnectionForm.test.tsx
    │   └── ConnectionList.test.tsx
    └── services/
        ├── ConnectionManager.test.ts
        └── EncryptionService.test.ts
```

### Modified Files
- `src/apps/sql-editor/page.tsx` - Replace mock engine state with connection management
- `src/apps/sql-editor/types/index.ts` - Export connection types

## Technical Specifications

### TypeScript Interfaces
```typescript
interface DatabaseConnection {
  id: string
  name: string
  engine: DatabaseEngine
  host: string
  port: number
  database: string
  username: string
  password: string // encrypted at rest
  ssl: boolean
  connectionString?: string
  metadata?: Record<string, any>
  createdAt: Date
  lastUsed: Date
  status?: ConnectionStatus
}

enum DatabaseEngine {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  BIGQUERY = 'bigquery',
  SNOWFLAKE = 'snowflake',
  SPARK_SQL = 'sparksql'
}

enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error'
}

interface ConnectionFormData {
  name: string
  engine: DatabaseEngine
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  connectionString?: string
}
```

### Service Methods
```typescript
class ConnectionManager {
  async createConnection(data: ConnectionFormData): Promise<DatabaseConnection>
  async updateConnection(id: string, data: Partial<ConnectionFormData>): Promise<DatabaseConnection>
  async deleteConnection(id: string): Promise<void>
  async testConnection(connection: DatabaseConnection): Promise<boolean>
  async getConnections(): Promise<DatabaseConnection[]>
  async getConnection(id: string): Promise<DatabaseConnection | null>
}
```

## Testing Requirements

### Unit Tests
- [ ] ConnectionManager CRUD operations
- [ ] Connection form validation
- [ ] Encryption/decryption functionality
- [ ] Connection status monitoring
- [ ] Form submission and error handling

### Integration Tests
- [ ] Connection form with ConnectionManager service
- [ ] Connection list display and management
- [ ] Integration with existing engine selector

### Accessibility Tests
- [ ] Form keyboard navigation
- [ ] Screen reader compatibility for connection status
- [ ] ARIA labels for form fields
- [ ] Error message accessibility

## Performance Considerations
- [ ] Connection list virtualization for large numbers of connections
- [ ] Debounced connection testing to avoid spam
- [ ] Efficient encryption/decryption operations
- [ ] Connection status polling optimization

## Security Considerations
- [ ] Password encryption using strong algorithms (AES-256)
- [ ] Secure storage of encryption keys
- [ ] Input validation and sanitization
- [ ] Connection string parsing security
- [ ] Sensitive data handling in logs

## AI Implementation Guidance

### Recommended Approach
1. Start with TypeScript interfaces and types definition
2. Implement EncryptionService for secure password storage
3. Create ConnectionManager service with CRUD operations
4. Build ConnectionForm component using shadcn/ui form components
5. Create useConnections hook for state management
6. Replace existing mock engine selector in page.tsx
7. Add connection testing functionality
8. Implement connection status monitoring

### Code Examples
```typescript
// Connection hook pattern
const useConnections = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  
  const addConnection = async (data: ConnectionFormData) => {
    const connection = await connectionManager.createConnection(data)
    setConnections(prev => [...prev, connection])
    return connection
  }
  
  const testConnection = async (connection: DatabaseConnection) => {
    try {
      const isValid = await connectionManager.testConnection(connection)
      updateConnectionStatus(connection.id, isValid ? 'connected' : 'error')
      return isValid
    } catch (error) {
      updateConnectionStatus(connection.id, 'error')
      throw error
    }
  }
  
  return { connections, activeConnection, addConnection, testConnection }
}
```

### Integration Points
- Replace `availableEngines` state in page.tsx with real connections
- Update engine selector dropdown to show connection names
- Integrate with existing `selectedEngine` state management
- Connect to query execution system (future Phase 2 task)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Connection form validates all input fields
- [ ] Passwords are encrypted in storage
- [ ] Connection testing works for at least 3 database types
- [ ] Existing UI updated to use real connections
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests verify end-to-end functionality
- [ ] Accessibility requirements verified
- [ ] Security review completed for encryption implementation
- [ ] Documentation updated with connection setup instructions

## Notes
- Focus on client-side connection management for now
- Database drivers/connectors will be implemented in Phase 2
- Consider using Web Workers for connection testing to avoid blocking UI
- Implement connection pooling considerations for future scalability

---

*This task establishes the foundation for real database connectivity in the SQL Editor.*
