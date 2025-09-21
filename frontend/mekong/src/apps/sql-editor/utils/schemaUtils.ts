/**
 * Schema utility functions for tree transformation and manipulation
 */

import type {
  SchemaTreeNode,
  DatabaseIntrospectionResult,
  SchemaSearchFilters,
  ForeignKeyInfo
} from '../types/schema-tree'
import type { DatabaseEngine } from '../types/connections'

export interface TreeTransformOptions {
  includeColumns?: boolean
  includeIndexes?: boolean
  includeConstraints?: boolean
  maxDepth?: number
  lazyLoad?: boolean
}

export interface NodeUpdateOperation {
  type: 'expand' | 'collapse' | 'add_children' | 'update_metadata' | 'remove'
  nodeId: string
  data?: any
}

/**
 * Transform database introspection result to tree nodes
 */
export function transformSchemaToTreeNodes(
  introspectionResult: DatabaseIntrospectionResult,
  options: TreeTransformOptions = {}
): SchemaTreeNode[] {
  const {
    includeColumns = true,
    includeIndexes = false,
    includeConstraints = false,
    maxDepth = 4,
    lazyLoad = true
  } = options

  const { databases, connectionId } = introspectionResult

  return databases.map(database => {
    const databaseNode: SchemaTreeNode = {
      id: `${connectionId}.${database.name}`,
      name: database.name,
      type: 'database',
      icon: getIconForNodeType('database'),
      path: [database.name],
      hasChildren: database.schemas.length > 0,
      metadata: {
        charset: database.charset,
        collation: database.collation,
        sizeBytes: database.size
      }
    }

    if (!lazyLoad && maxDepth > 1) {
      databaseNode.children = database.schemas.map(schema => {
        const schemaNode: SchemaTreeNode = {
          id: `${connectionId}.${database.name}.${schema.name}`,
          name: schema.name,
          type: 'schema',
          icon: getIconForNodeType('schema'),
          path: [database.name, schema.name],
          parentId: databaseNode.id,
          hasChildren: schema.tables.length > 0 || schema.views.length > 0,
          metadata: {
            owner: schema.owner
          }
        }

        if (maxDepth > 2) {
          const tables = schema.tables.map(table => createTableNode(
            connectionId, database.name, schema.name, table, includeColumns, maxDepth
          ))
          const views = schema.views.map(view => createViewNode(
            connectionId, database.name, schema.name, view, includeColumns, maxDepth
          ))
          
          schemaNode.children = [...tables, ...views]
        }

        return schemaNode
      })
    }

    return databaseNode
  })
}

/**
 * Update node children in tree structure
 */
export function updateNodeChildren(
  nodes: SchemaTreeNode[],
  nodeId: string,
  children: SchemaTreeNode[]
): SchemaTreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        children,
        expanded: true,
        loading: false
      }
    }
    
    if (node.children) {
      return {
        ...node,
        children: updateNodeChildren(node.children, nodeId, children)
      }
    }
    
    return node
  })
}

/**
 * Find node in tree by ID
 */
export function findNodeById(nodes: SchemaTreeNode[], nodeId: string): SchemaTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }
    
    if (node.children) {
      const found = findNodeById(node.children, nodeId)
      if (found) return found
    }
  }
  
  return null
}

/**
 * Find nodes by path
 */
export function findNodesByPath(nodes: SchemaTreeNode[], path: string[]): SchemaTreeNode[] {
  const results: SchemaTreeNode[] = []
  
  function search(currentNodes: SchemaTreeNode[], currentPath: string[]) {
    for (const node of currentNodes) {
      // Check if this node matches the path so far
      const matchLength = Math.min(node.path.length, currentPath.length)
      const pathMatches = node.path.slice(0, matchLength).every((segment, index) =>
        segment === currentPath[index]
      )
      
      if (pathMatches) {
        if (node.path.length === path.length) {
          results.push(node)
        } else if (node.children && node.path.length < path.length) {
          search(node.children, currentPath)
        }
      }
    }
  }
  
  search(nodes, path)
  return results
}

/**
 * Filter nodes based on search criteria
 */
export function filterNodes(
  nodes: SchemaTreeNode[],
  query: string,
  filters?: SchemaSearchFilters
): SchemaTreeNode[] {
  const queryLower = query.toLowerCase()
  const results: SchemaTreeNode[] = []
  
  function searchNode(node: SchemaTreeNode): boolean {
    // Check if node matches query
    const nameMatch = node.name.toLowerCase().includes(queryLower)
    const pathMatch = node.path.some(segment => 
      segment.toLowerCase().includes(queryLower)
    )
    
    // Check filters
    if (filters) {
      if (filters.types && !filters.types.includes(node.type)) {
        return false
      }
      
      if (filters.schemas && filters.schemas.length > 0) {
        const schemaName = node.path.length > 1 ? node.path[1] : null
        if (!schemaName || !filters.schemas.includes(schemaName)) {
          return false
        }
      }
      
      if (!filters.includeSystemObjects && isSystemObject(node)) {
        return false
      }
    }
    
    return nameMatch || pathMatch
  }
  
  function traverse(currentNodes: SchemaTreeNode[]) {
    for (const node of currentNodes) {
      if (searchNode(node)) {
        results.push(node)
      }
      
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return results
}

/**
 * Get all leaf nodes (nodes without children)
 */
export function getLeafNodes(nodes: SchemaTreeNode[]): SchemaTreeNode[] {
  const leafNodes: SchemaTreeNode[] = []
  
  function traverse(currentNodes: SchemaTreeNode[]) {
    for (const node of currentNodes) {
      if (!node.children || node.children.length === 0) {
        leafNodes.push(node)
      } else {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return leafNodes
}

/**
 * Get all nodes of a specific type
 */
export function getNodesByType(
  nodes: SchemaTreeNode[],
  type: SchemaTreeNode['type']
): SchemaTreeNode[] {
  const results: SchemaTreeNode[] = []
  
  function traverse(currentNodes: SchemaTreeNode[]) {
    for (const node of currentNodes) {
      if (node.type === type) {
        results.push(node)
      }
      
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return results
}

/**
 * Build breadcrumb path for a node
 */
export function buildBreadcrumbPath(node: SchemaTreeNode): Array<{ name: string; type: string }> {
  return node.path.map((segment, index) => {
    const types = ['database', 'schema', 'table', 'column']
    return {
      name: segment,
      type: types[index] || 'unknown'
    }
  })
}

/**
 * Calculate tree statistics
 */
export function calculateTreeStats(nodes: SchemaTreeNode[]) {
  const stats = {
    totalNodes: 0,
    databases: 0,
    schemas: 0,
    tables: 0,
    views: 0,
    columns: 0,
    indexes: 0,
    constraints: 0,
    maxDepth: 0
  }
  
  function traverse(currentNodes: SchemaTreeNode[], depth: number) {
    stats.maxDepth = Math.max(stats.maxDepth, depth)
    
    for (const node of currentNodes) {
      stats.totalNodes++
      
      switch (node.type) {
        case 'database':
          stats.databases++
          break
        case 'schema':
          stats.schemas++
          break
        case 'table':
          stats.tables++
          break
        case 'view':
          stats.views++
          break
        case 'column':
          stats.columns++
          break
        case 'index':
          stats.indexes++
          break
        case 'constraint':
          stats.constraints++
          break
      }
      
      if (node.children) {
        traverse(node.children, depth + 1)
      }
    }
  }
  
  traverse(nodes, 0)
  return stats
}

/**
 * Validate tree structure integrity
 */
export function validateTreeStructure(nodes: SchemaTreeNode[]): Array<{ nodeId: string; issue: string }> {
  const issues: Array<{ nodeId: string; issue: string }> = []
  const seenIds = new Set<string>()
  
  function validate(currentNodes: SchemaTreeNode[], parentId?: string) {
    for (const node of currentNodes) {
      // Check for duplicate IDs
      if (seenIds.has(node.id)) {
        issues.push({ nodeId: node.id, issue: 'Duplicate node ID' })
      }
      seenIds.add(node.id)
      
      // Check parent relationship
      if (parentId && node.parentId !== parentId) {
        issues.push({ nodeId: node.id, issue: 'Incorrect parent ID' })
      }
      
      // Check path consistency
      if (node.path.length === 0) {
        issues.push({ nodeId: node.id, issue: 'Empty path' })
      }
      
      // Check hasChildren flag
      if (node.hasChildren && (!node.children || node.children.length === 0)) {
        issues.push({ nodeId: node.id, issue: 'hasChildren is true but no children present' })
      }
      
      if (node.children) {
        validate(node.children, node.id)
      }
    }
  }
  
  validate(nodes)
  return issues
}

/**
 * Helper functions
 */

function createTableNode(
  connectionId: string,
  database: string,
  schema: string,
  table: any,
  includeColumns: boolean,
  maxDepth: number
): SchemaTreeNode {
  const tableNode: SchemaTreeNode = {
    id: `${connectionId}.${database}.${schema}.${table.name}`,
    name: table.name,
    type: 'table',
    icon: getIconForNodeType('table'),
    path: [database, schema, table.name],
    parentId: `${connectionId}.${database}.${schema}`,
    hasChildren: includeColumns && table.columns.length > 0,
    metadata: {
      rowCount: table.rowCount,
      sizeBytes: table.sizeBytes,
      lastModified: table.lastModified,
      description: table.description,
      owner: table.owner
    }
  }

  if (includeColumns && maxDepth > 3 && table.columns) {
    tableNode.children = table.columns.map((column: any) => ({
      id: `${connectionId}.${database}.${schema}.${table.name}.${column.name}`,
      name: column.name,
      type: 'column' as const,
      icon: getIconForNodeType('column', column.primaryKey),
      path: [database, schema, table.name, column.name],
      parentId: tableNode.id,
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

  return tableNode
}

function createViewNode(
  connectionId: string,
  database: string,
  schema: string,
  view: any,
  includeColumns: boolean,
  maxDepth: number
): SchemaTreeNode {
  const viewNode: SchemaTreeNode = {
    id: `${connectionId}.${database}.${schema}.${view.name}`,
    name: view.name,
    type: 'view',
    icon: getIconForNodeType('view'),
    path: [database, schema, view.name],
    parentId: `${connectionId}.${database}.${schema}`,
    hasChildren: includeColumns && view.columns.length > 0,
    metadata: {
      rowCount: view.rowCount,
      lastModified: view.lastModified,
      description: view.description,
      owner: view.owner
    }
  }

  if (includeColumns && maxDepth > 3 && view.columns) {
    viewNode.children = view.columns.map((column: any) => ({
      id: `${connectionId}.${database}.${schema}.${view.name}.${column.name}`,
      name: column.name,
      type: 'column' as const,
      icon: getIconForNodeType('column'),
      path: [database, schema, view.name, column.name],
      parentId: viewNode.id,
      hasChildren: false,
      metadata: {
        dataType: column.dataType,
        nullable: column.nullable,
        description: column.description,
        position: column.position
      }
    }))
  }

  return viewNode
}

function getIconForNodeType(type: SchemaTreeNode['type'], isPrimaryKey?: boolean): string {
  switch (type) {
    case 'connection':
      return 'database'
    case 'database':
      return 'database'
    case 'schema':
      return 'folder'
    case 'table':
      return 'table'
    case 'view':
      return 'eye'
    case 'column':
      return isPrimaryKey ? 'key' : 'column'
    case 'index':
      return 'zap'
    case 'constraint':
      return 'shield'
    default:
      return 'help-circle'
  }
}

function isSystemObject(node: SchemaTreeNode): boolean {
  const systemSchemas = [
    'information_schema',
    'mysql',
    'performance_schema',
    'sys',
    'pg_catalog',
    'pg_toast'
  ]
  
  const schemaName = node.path.length > 1 ? node.path[1].toLowerCase() : ''
  return systemSchemas.includes(schemaName) || 
         node.name.toLowerCase().startsWith('sys_') ||
         node.name.toLowerCase().startsWith('pg_')
}

/**
 * Export all utility functions
 */
export {
  createTableNode,
  createViewNode,
  getIconForNodeType,
  isSystemObject
}