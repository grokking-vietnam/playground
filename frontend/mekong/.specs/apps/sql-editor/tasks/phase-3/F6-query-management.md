# F6. Query Management and History

## Task Information
- **Task ID**: F6-query-management-history
- **Feature**: F6. Query Management and History
- **Priority**: P1
- **Effort**: Medium (3-5 days)
- **AI Complexity**: Low
- **Phase**: 3

## Dependencies
- [ ] F4. Query Execution Engine completed
- [ ] F8. User Authentication System completed
- [ ] Query execution history data available

## Description
Implement comprehensive query management with persistent storage, versioning, tagging, and enhanced history tracking. Transform the basic query history into a powerful query library with organization, search, and sharing capabilities.

## Acceptance Criteria
- [ ] Queries persist across browser sessions with full metadata
- [ ] Search returns relevant results within 2 seconds across all saved queries
- [ ] Query versioning tracks changes over time with diff visualization
- [ ] Tags and folders organize queries effectively with drag-and-drop
- [ ] History shows detailed execution information and allows easy re-runs
- [ ] Public queries can be shared across users with permission controls
- [ ] Query templates and snippets are available for common patterns
- [ ] Bulk operations (export, delete, tag) work on multiple queries
- [ ] Query analytics show usage patterns and performance trends

## Implementation Steps

### 1. Setup and Planning
- [ ] Review existing query history in page.tsx (lines 1208-1233)
- [ ] Design query storage schema and data model
- [ ] Plan query organization and tagging system
- [ ] Design search and filtering architecture

### 2. Query Storage Service
- [ ] Implement persistent query storage with versioning
- [ ] Create query CRUD operations with metadata
- [ ] Add query search and filtering capabilities
- [ ] Implement query sharing and permissions

### 3. Enhanced History System
- [ ] Replace basic history with detailed execution tracking
- [ ] Add execution analytics and performance metrics
- [ ] Implement query re-run and modification workflows
- [ ] Add history filtering and search

### 4. Query Library Interface
- [ ] Create query browser and organization UI
- [ ] Implement drag-and-drop for folders and tags
- [ ] Add query templates and snippet management
- [ ] Create bulk operation interfaces

### 5. Collaboration Features
- [ ] Implement query sharing with permission levels
- [ ] Add query commenting and annotation system
- [ ] Create team query libraries
- [ ] Add query usage analytics

## Files to Create/Modify

### New Files
```
src/apps/sql-editor/
├── components/library/
│   ├── QueryLibrary.tsx
│   ├── QueryBrowser.tsx
│   ├── QueryCard.tsx
│   ├── QueryVersions.tsx
│   ├── QueryTags.tsx
│   ├── QueryFolders.tsx
│   ├── QuerySearch.tsx
│   ├── QueryTemplates.tsx
│   └── ShareQueryDialog.tsx
├── components/history/
│   ├── QueryHistoryPanel.tsx (enhanced version)
│   ├── HistoryItem.tsx
│   ├── ExecutionDetails.tsx
│   ├── HistoryFilters.tsx
│   └── HistoryAnalytics.tsx
├── services/
│   ├── QueryStorageService.ts
│   ├── QueryVersionService.ts
│   ├── QuerySharingService.ts
│   └── QueryAnalyticsService.ts
├── types/
│   ├── queryLibrary.ts
│   ├── queryHistory.ts
│   └── querySharing.ts
├── utils/
│   ├── queryDiff.ts
│   ├── querySearch.ts
│   └── queryExport.ts
├── hooks/
│   ├── useQueryLibrary.ts
│   ├── useQueryHistory.ts
│   ├── useQueryVersions.ts
│   └── useQuerySharing.ts
└── __tests__/
    ├── components/
    │   ├── QueryLibrary.test.tsx
    │   └── QueryHistoryPanel.test.tsx
    ├── services/
    │   ├── QueryStorageService.test.ts
    │   └── QueryVersionService.test.ts
    └── utils/
        ├── queryDiff.test.ts
        └── querySearch.test.ts
```

### Modified Files
- `src/apps/sql-editor/page.tsx` - Replace basic history with enhanced version
- `src/apps/sql-editor/services/QueryExecutor.ts` - Add history tracking
- `src/apps/sql-editor/types/index.ts` - Export query library types

## Technical Specifications

### TypeScript Interfaces
```typescript
interface SavedQuery {
  id: string
  name: string
  description?: string
  query: string
  connectionId: string
  tags: string[]
  folder?: string
  version: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastExecuted?: Date
  executionCount: number
  isPublic: boolean
  isTemplate: boolean
  metadata: QueryMetadata
  sharing: QuerySharingSettings
}

interface QueryMetadata {
  estimatedRows?: number
  estimatedCost?: number
  complexity: 'low' | 'medium' | 'high'
  tables: string[]
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'ddl' | 'other'
  hasSubqueries: boolean
  hasJoins: boolean
  hasAggregations: boolean
}

interface QueryVersion {
  id: string
  queryId: string
  version: number
  query: string
  changelog?: string
  createdBy: string
  createdAt: Date
  diff?: QueryDiff
}

interface QueryDiff {
  additions: DiffLine[]
  deletions: DiffLine[]
  modifications: DiffLine[]
  summary: string
}

interface DiffLine {
  lineNumber: number
  content: string
  type: 'added' | 'removed' | 'modified'
}

interface QueryFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdBy: string
  createdAt: Date
  queryCount: number
  isShared: boolean
}

interface QueryHistory {
  id: string
  queryId?: string
  query: string
  connectionId: string
  executedBy: string
  executedAt: Date
  duration: number
  rowCount: number
  bytesProcessed?: number
  cost?: number
  success: boolean
  error?: string
  performance: QueryPerformance
}

interface QueryPerformance {
  executionTime: number
  compilationTime?: number
  networkTime?: number
  memoryUsed?: number
  cpuUsed?: number
  cacheHit: boolean
}

interface QuerySharingSettings {
  isShared: boolean
  shareLevel: 'read' | 'execute' | 'edit'
  sharedWith: string[] // user IDs
  shareGroups: string[] // group IDs
  publicLink?: string
  expiresAt?: Date
}

interface QuerySearchFilters {
  query?: string
  tags?: string[]
  folders?: string[]
  createdBy?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  queryType?: string[]
  complexity?: string[]
  isPublic?: boolean
  isTemplate?: boolean
}
```

### Service Methods
```typescript
class QueryStorageService {
  async saveQuery(query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedQuery>
  async updateQuery(id: string, updates: Partial<SavedQuery>): Promise<SavedQuery>
  async deleteQuery(id: string): Promise<void>
  async getQuery(id: string): Promise<SavedQuery | null>
  async getQueries(filters?: QuerySearchFilters): Promise<SavedQuery[]>
  async searchQueries(searchTerm: string, filters?: QuerySearchFilters): Promise<SavedQuery[]>
  async duplicateQuery(id: string, name: string): Promise<SavedQuery>
  async exportQueries(ids: string[]): Promise<Blob>
  async importQueries(file: File): Promise<SavedQuery[]>
}

class QueryVersionService {
  async createVersion(queryId: string, query: string, changelog?: string): Promise<QueryVersion>
  async getVersions(queryId: string): Promise<QueryVersion[]>
  async getVersion(queryId: string, version: number): Promise<QueryVersion | null>
  async compareVersions(queryId: string, version1: number, version2: number): Promise<QueryDiff>
  async revertToVersion(queryId: string, version: number): Promise<SavedQuery>
}

class QuerySharingService {
  async shareQuery(queryId: string, settings: QuerySharingSettings): Promise<void>
  async unshareQuery(queryId: string): Promise<void>
  async getSharedQueries(): Promise<SavedQuery[]>
  async generatePublicLink(queryId: string, expiresAt?: Date): Promise<string>
  async getQueryByPublicLink(link: string): Promise<SavedQuery | null>
}

class QueryAnalyticsService {
  async getQueryUsageStats(queryId: string): Promise<QueryUsageStats>
  async getPopularQueries(limit?: number): Promise<SavedQuery[]>
  async getQueryPerformanceTrends(queryId: string): Promise<PerformanceTrend[]>
  async getUserQueryStats(userId: string): Promise<UserQueryStats>
}
```

## Testing Requirements

### Unit Tests
- [ ] Query storage CRUD operations
- [ ] Query versioning and diff generation
- [ ] Search and filtering functionality
- [ ] Query sharing permissions
- [ ] History tracking and analytics
- [ ] Import/export functionality

### Integration Tests
- [ ] Query library with user authentication
- [ ] History integration with query execution
- [ ] Sharing workflow end-to-end
- [ ] Search performance with large query sets

### Accessibility Tests
- [ ] Query library keyboard navigation
- [ ] Screen reader support for query metadata
- [ ] ARIA labels for sharing controls
- [ ] High contrast mode for history display

## Performance Considerations
- [ ] Efficient search indexing for large query libraries
- [ ] Lazy loading of query history with pagination
- [ ] Optimized diff calculation for large queries
- [ ] Bulk operations without blocking UI
- [ ] Efficient tag and folder organization

## Security Considerations
- [ ] Query sharing permission validation
- [ ] Sanitize query content to prevent XSS
- [ ] Secure handling of public query links
- [ ] User isolation for private queries
- [ ] Audit logging for query sharing activities

## AI Implementation Guidance

### Recommended Approach
1. Start with basic query storage service and CRUD operations
2. Implement query versioning with simple diff calculation
3. Create query library UI with search and filtering
4. Add folder and tag organization system
5. Enhance history panel with detailed execution information
6. Implement query sharing with permission controls
7. Add query templates and snippet functionality
8. Create analytics and usage tracking

### Code Examples
```typescript
// Query library management pattern
const useQueryLibrary = () => {
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [folders, setFolders] = useState<QueryFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState<QuerySearchFilters>({})
  
  const saveQuery = async (queryData: {
    name: string
    query: string
    connectionId: string
    folder?: string
    tags?: string[]
  }) => {
    const savedQuery = await queryStorageService.saveQuery({
      ...queryData,
      createdBy: currentUser.id,
      version: 1,
      executionCount: 0,
      isPublic: false,
      isTemplate: false,
      metadata: analyzeQuery(queryData.query),
      sharing: { isShared: false, shareLevel: 'read', sharedWith: [], shareGroups: [] }
    })
    
    setQueries(prev => [...prev, savedQuery])
    return savedQuery
  }
  
  const searchQueries = async (searchTerm: string) => {
    setLoading(true)
    try {
      const results = await queryStorageService.searchQueries(searchTerm, searchFilters)
      setQueries(results)
    } finally {
      setLoading(false)
    }
  }
  
  const organizeIntoFolder = async (queryIds: string[], folderId: string) => {
    const updates = await Promise.all(
      queryIds.map(id => queryStorageService.updateQuery(id, { folder: folderId }))
    )
    
    setQueries(prev => prev.map(query => {
      const updated = updates.find(u => u.id === query.id)
      return updated || query
    }))
  }
  
  return {
    queries,
    folders,
    loading,
    saveQuery,
    searchQueries,
    organizeIntoFolder,
    setSearchFilters
  }
}

// Query versioning pattern
const useQueryVersions = (queryId: string) => {
  const [versions, setVersions] = useState<QueryVersion[]>([])
  const [currentVersion, setCurrentVersion] = useState<number>(1)
  
  const createVersion = async (query: string, changelog?: string) => {
    const version = await queryVersionService.createVersion(queryId, query, changelog)
    setVersions(prev => [...prev, version])
    setCurrentVersion(version.version)
    return version
  }
  
  const compareVersions = async (version1: number, version2: number) => {
    return await queryVersionService.compareVersions(queryId, version1, version2)
  }
  
  const revertToVersion = async (version: number) => {
    const updatedQuery = await queryVersionService.revertToVersion(queryId, version)
    setCurrentVersion(version)
    return updatedQuery
  }
  
  useEffect(() => {
    if (queryId) {
      queryVersionService.getVersions(queryId).then(setVersions)
    }
  }, [queryId])
  
  return {
    versions,
    currentVersion,
    createVersion,
    compareVersions,
    revertToVersion
  }
}

// Query diff calculation
const calculateQueryDiff = (oldQuery: string, newQuery: string): QueryDiff => {
  const oldLines = oldQuery.split('\n')
  const newLines = newQuery.split('\n')
  
  const additions: DiffLine[] = []
  const deletions: DiffLine[] = []
  const modifications: DiffLine[] = []
  
  // Simple diff algorithm (in production, use a proper diff library)
  const maxLength = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === undefined) {
      additions.push({ lineNumber: i + 1, content: newLine, type: 'added' })
    } else if (newLine === undefined) {
      deletions.push({ lineNumber: i + 1, content: oldLine, type: 'removed' })
    } else if (oldLine !== newLine) {
      modifications.push({ lineNumber: i + 1, content: newLine, type: 'modified' })
    }
  }
  
  return {
    additions,
    deletions,
    modifications,
    summary: `${additions.length} additions, ${deletions.length} deletions, ${modifications.length} modifications`
  }
}
```

### Integration Points
- Connect to user authentication from F8 task
- Integrate with query execution from F4 task
- Use database connections for query context
- Connect to results display for re-running queries
- Integrate with caching system for performance

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Queries persist across browser sessions with full metadata
- [ ] Search functionality performs within 2 seconds
- [ ] Query versioning tracks changes with visual diffs
- [ ] Folder and tag organization works with drag-and-drop
- [ ] Query sharing with permissions functional
- [ ] Enhanced history shows detailed execution information
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests verify end-to-end workflows
- [ ] Performance benchmarks met for large query libraries
- [ ] Accessibility requirements verified
- [ ] Documentation updated with query management features

## Notes
- Consider implementing query recommendation engine
- Plan for advanced analytics and query optimization suggestions
- Design for future collaborative editing features
- Consider implementing query approval workflows for teams
- Plan for integration with external version control systems

---

*This task transforms basic query storage into a comprehensive query management and collaboration system.*
