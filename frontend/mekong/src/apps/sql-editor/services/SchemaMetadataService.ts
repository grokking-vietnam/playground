/**
 * SchemaMetadataService - Main service for database introspection and schema management
 */

import type {
  SchemaTreeNode,
  SchemaNodeMetadata,
  DatabaseIntrospectionResult,
  SchemaSearchFilters,
  SchemaSearchResult,
  SchemaTreeCache
} from '../types/schema-tree'
import type { DatabaseConnection } from '../types/connections'
import { DatabaseIntrospector } from './DatabaseIntrospector'
import { SchemaCache } from './SchemaCache'

export class SchemaMetadataService {
  private introspector: DatabaseIntrospector
  private cache: SchemaCache
  private treeCache: SchemaTreeCache = {}

  constructor() {
    this.introspector = new DatabaseIntrospector()
    this.cache = new SchemaCache({
      maxSize: 20,
      ttl: 300000 // 5 minutes
    })
  }

  /**
   * Get schema tree for a connection
   */
  async getConnectionSchema(connectionId: string): Promise<SchemaTreeNode[]> {
    try {
      // Check tree cache first
      const cached = this.getCachedTreeNodes(connectionId)
      if (cached) {
        return cached
      }

      // Get database introspection result
      const introspectionResult = await this.getIntrospectionResult(connectionId)
      
      // Transform to tree nodes
      const rootNodes = this.transformToTreeNodes(introspectionResult)
      
      // Cache the tree
      this.setCachedTreeNodes(connectionId, rootNodes, introspectionResult)
      
      return rootNodes
    } catch (error) {
      console.error('Failed to get connection schema:', error)
      // Return empty array instead of throwing to prevent UI breakage
      return []
    }
  }

  /**
   * Get children for a specific tree node (lazy loading)
   */
  async getSchemaChildren(connectionId: string, parentPath: string[]): Promise<SchemaTreeNode[]> {
    try {
      const cachedTree = this.treeCache[connectionId]
      if (!cachedTree) {
        // If no cache, load full schema first
        await this.getConnectionSchema(connectionId)
        return this.getSchemaChildren(connectionId, parentPath)
      }

      // Build the correct parent ID based on the connection structure
      const parentId = `${connectionId}.${parentPath.join('.')}`
      const parentNode = cachedTree.nodeMap.get(parentId)
      
      console.log(`Looking for parent node with ID: ${parentId}`)
      console.log(`Found parent node:`, parentNode?.name, parentNode?.type)
      
      if (!parentNode || !parentNode.hasChildren) {
        console.log(`No parent node or no children for: ${parentId}`)
        return []
      }

      // If children already loaded, return them
      if (parentNode.children && parentNode.children.length > 0) {
        console.log(`Returning ${parentNode.children.length} cached children for: ${parentNode.name}`)
        return parentNode.children
      }

      // Load children dynamically based on node type
      console.log(`Loading children dynamically for: ${parentNode.name} (${parentNode.type})`)
      const children = await this.loadChildrenForNode(connectionId, parentNode)
      
      // Update the cached tree
      parentNode.children = children
      children.forEach(child => {
        cachedTree.nodeMap.set(child.id, child)
      })

      return children
    } catch (error) {
      console.error('Failed to get schema children:', error)
      return []
    }
  }

  /**
   * Search schema objects
   */
  async searchSchema(
    connectionId: string, 
    query: string, 
    filters?: SchemaSearchFilters
  ): Promise<SchemaSearchResult> {
    const startTime = Date.now()
    
    try {
      const cachedTree = this.treeCache[connectionId]
      if (!cachedTree) {
        // Load schema first if not cached
        await this.getConnectionSchema(connectionId)
        return this.searchSchema(connectionId, query, filters)
      }

      const results = this.performSearch(cachedTree, query, filters)
      const searchTime = Date.now() - startTime

      return {
        nodes: results,
        totalCount: results.length,
        searchTime
      }
    } catch (error) {
      console.error('Failed to search schema:', error)
      return {
        nodes: [],
        totalCount: 0,
        searchTime: Date.now() - startTime
      }
    }
  }

  /**
   * Get detailed metadata for a table
   */
  async getTableMetadata(connectionId: string, tablePath: string[]): Promise<SchemaNodeMetadata | null> {
    try {
      const introspectionResult = await this.getIntrospectionResult(connectionId)
      const [database, schema, tableName] = tablePath
      
      // Find the table in the introspection result
      const db = introspectionResult.databases.find(d => d.name === database)
      if (!db) return null

      const schemaObj = db.schemas.find(s => s.name === schema)
      if (!schemaObj) return null

      const table = [...schemaObj.tables, ...schemaObj.views].find(t => t.name === tableName)
      if (!table) return null

      return {
        rowCount: table.rowCount,
        sizeBytes: table.sizeBytes,
        lastModified: table.lastModified,
        description: table.description,
        owner: table.owner
      }
    } catch (error) {
      console.error('Failed to get table metadata:', error)
      return null
    }
  }

  /**
   * Refresh schema cache for a connection
   */
  async refreshSchema(connectionId: string): Promise<void> {
    // Clear caches
    this.cache.delete(connectionId)
    delete this.treeCache[connectionId]
    
    // Force reload schema
    console.log(`Refreshing schema for connection: ${connectionId}`)
    await this.getConnectionSchema(connectionId)
  }

  /**
   * Get cached schema if available
   */
  getCachedSchema(connectionId: string): DatabaseIntrospectionResult | null {
    return this.cache.get(connectionId) || null
  }

  /**
   * Private helper methods
   */

  private async getIntrospectionResult(connectionId: string): Promise<DatabaseIntrospectionResult> {
    // Check cache first
    let result = this.cache.get(connectionId)
    if (result) {
      return result
    }

    // For now, use mock data - in real implementation this would use DatabaseIntrospector
    result = await this.introspector.introspectDatabase(connectionId)
    
    // Cache the result
    this.cache.set(connectionId, result)
    
    return result
  }

  private transformToTreeNodes(introspectionResult: DatabaseIntrospectionResult): SchemaTreeNode[] {
    const { databases, connectionId } = introspectionResult
    
    console.log(`Transforming to tree nodes for connection: ${connectionId}`)
    console.log(`Found ${databases.length} databases`)
    
    return databases.map(database => {
      console.log(`Processing database: ${database.name} with ${database.schemas.length} schemas`)
      
      return {
      id: `${connectionId}.${database.name}`,
      name: database.name,
      type: 'database' as const,
      icon: 'database',
      path: [database.name],
      hasChildren: database.schemas.length > 0,
      metadata: {
        charset: database.charset,
        collation: database.collation,
        sizeBytes: database.size
      },
      children: database.schemas.map(schema => {
        const tableNodes = schema.tables.map(table => this.createTableNode(connectionId, database.name, schema.name, table))
        const viewNodes = schema.views.map(view => this.createViewNode(connectionId, database.name, schema.name, view))
        const allChildren = [...tableNodes, ...viewNodes].filter(Boolean)
        
        console.log(`Schema ${schema.name}: ${schema.tables.length} tables, ${schema.views.length} views, ${allChildren.length} total children`)
        
        return {
          id: `${connectionId}.${database.name}.${schema.name}`,
          name: schema.name,
          type: 'schema' as const,
          icon: 'folder',
          path: [database.name, schema.name],
          parentId: `${connectionId}.${database.name}`,
          hasChildren: allChildren.length > 0,
          metadata: {
            owner: schema.owner
          },
          children: allChildren
        }
      })
    }})
  }

  private createTableNode(connectionId: string, database: string, schema: string, table: any): SchemaTreeNode {
    return {
      id: `${connectionId}.${database}.${schema}.${table.name}`,
      name: table.name,
      type: 'table' as const,
      icon: 'table',
      path: [database, schema, table.name],
      parentId: `${connectionId}.${database}.${schema}`,
      hasChildren: table.columns.length > 0,
      metadata: {
        rowCount: table.rowCount,
        sizeBytes: table.sizeBytes,
        lastModified: table.lastModified,
        description: table.description,
        owner: table.owner
      },
      children: table.columns.map((column: any) => ({
        id: `${connectionId}.${database}.${schema}.${table.name}.${column.name}`,
        name: column.name,
        type: 'column' as const,
        icon: column.primaryKey ? 'key' : 'column',
        path: [database, schema, table.name, column.name],
        parentId: `${connectionId}.${database}.${schema}.${table.name}`,
        hasChildren: false,
        metadata: {
          dataType: column.dataType,
          nullable: column.nullable,
          primaryKey: column.primaryKey,
          foreignKey: column.foreignKey,
          defaultValue: column.defaultValue,
          autoIncrement: column.autoIncrement,
          description: column.description,
          position: column.position
        }
      }))
    }
  }

  private createViewNode(connectionId: string, database: string, schema: string, view: any): SchemaTreeNode {
    return {
      id: `${connectionId}.${database}.${schema}.${view.name}`,
      name: view.name,
      type: 'view' as const,
      icon: 'view',
      path: [database, schema, view.name],
      parentId: `${connectionId}.${database}.${schema}`,
      hasChildren: view.columns.length > 0,
      metadata: {
        rowCount: view.rowCount,
        lastModified: view.lastModified,
        description: view.description,
        owner: view.owner
      },
      children: view.columns.map((column: any) => ({
        id: `${connectionId}.${database}.${schema}.${view.name}.${column.name}`,
        name: column.name,
        type: 'column' as const,
        icon: 'column',
        path: [database, schema, view.name, column.name],
        parentId: `${connectionId}.${database}.${schema}.${view.name}`,
        hasChildren: false,
        metadata: {
          dataType: column.dataType,
          nullable: column.nullable,
          description: column.description,
          position: column.position
        }
      }))
    }
  }

  private async loadChildrenForNode(connectionId: string, node: SchemaTreeNode): Promise<SchemaTreeNode[]> {
    // For now, return empty array - would implement dynamic loading based on node type
    // In a real implementation, this would make specific database calls
    return []
  }

  private getCachedTreeNodes(connectionId: string): SchemaTreeNode[] | null {
    const cached = this.treeCache[connectionId]
    if (!cached) return null

    const now = Date.now()
    if (now > cached.expires) {
      delete this.treeCache[connectionId]
      return null
    }

    return cached.rootNodes
  }

  private setCachedTreeNodes(
    connectionId: string, 
    nodes: SchemaTreeNode[], 
    introspectionResult: DatabaseIntrospectionResult
  ): void {
    const nodeMap = new Map<string, SchemaTreeNode>()
    const searchIndex = this.buildSearchIndex(nodes, nodeMap)

    this.treeCache[connectionId] = {
      rootNodes: nodes,
      nodeMap,
      searchIndex,
      timestamp: Date.now(),
      expires: Date.now() + 300000 // 5 minutes
    }
  }

  private buildSearchIndex(nodes: SchemaTreeNode[], nodeMap: Map<string, SchemaTreeNode>) {
    const byName = new Map<string, SchemaTreeNode[]>()
    const byType = new Map<SchemaTreeNode['type'], SchemaTreeNode[]>()
    const byPath = new Map<string, SchemaTreeNode>()

    const processNode = (node: SchemaTreeNode) => {
      nodeMap.set(node.id, node)
      
      // Index by name
      const nameKey = node.name.toLowerCase()
      if (!byName.has(nameKey)) {
        byName.set(nameKey, [])
      }
      byName.get(nameKey)!.push(node)

      // Index by type
      if (!byType.has(node.type)) {
        byType.set(node.type, [])
      }
      byType.get(node.type)!.push(node)

      // Index by path
      const pathKey = node.path.join('.')
      byPath.set(pathKey, node)

      // Process children
      if (node.children) {
        node.children.forEach(processNode)
      }
    }

    nodes.forEach(processNode)

    return { byName, byType, byPath }
  }

  private performSearch(
    cachedTree: NonNullable<SchemaTreeCache[string]>, 
    query: string, 
    filters?: SchemaSearchFilters
  ): SchemaTreeNode[] {
    const queryLower = query.toLowerCase()
    const results: SchemaTreeNode[] = []

    // Search by name
    for (const [name, nodes] of cachedTree.searchIndex.byName) {
      if (name.includes(queryLower)) {
        results.push(...nodes.filter(node => this.matchesFilters(node, filters)))
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = Array.from(new Set(results))
    
    return uniqueResults.sort((a, b) => {
      // Exact matches first
      const aExact = a.name.toLowerCase() === queryLower
      const bExact = b.name.toLowerCase() === queryLower
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Then by type priority
      const typePriority: Record<SchemaTreeNode['type'], number> = { 
        table: 1, 
        view: 2, 
        column: 3, 
        schema: 4, 
        database: 5,
        connection: 6,
        index: 7,
        constraint: 8
      }
      return (typePriority[a.type] || 99) - (typePriority[b.type] || 99)
    })
  }

  private matchesFilters(node: SchemaTreeNode, filters?: SchemaSearchFilters): boolean {
    if (!filters) return true

    if (filters.types && !filters.types.includes(node.type)) {
      return false
    }

    if (filters.schemas && filters.schemas.length > 0) {
      const schemaName = node.path.length > 1 ? node.path[1] : null
      if (!schemaName || !filters.schemas.includes(schemaName)) {
        return false
      }
    }

    // Add more filter logic as needed
    return true
  }
}