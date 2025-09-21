/**
 * Hook for managing schema tree state with real data
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { 
  SchemaTreeNode, 
  SchemaSearchFilters, 
  SchemaSearchResult 
} from '../types/schema-tree'
import { SchemaMetadataService } from '../services/SchemaMetadataService'

export interface UseSchemaTreeOptions {
  connectionId: string
  autoLoad?: boolean
  enableSearch?: boolean
  cacheTimeout?: number
}

export interface UseSchemaTreeResult {
  nodes: SchemaTreeNode[]
  loading: boolean
  error: string | null
  selectedNode: SchemaTreeNode | null
  expandedNodeIds: Set<string>
  searchQuery: string
  searchResults: SchemaSearchResult | null
  searchLoading: boolean
  
  // Actions
  loadSchema: () => Promise<void>
  refreshSchema: () => Promise<void>
  expandNode: (node: SchemaTreeNode) => Promise<void>
  selectNode: (node: SchemaTreeNode) => void
  setSearchQuery: (query: string) => void
  searchSchema: (query: string, filters?: SchemaSearchFilters) => Promise<void>
  clearSearch: () => void
}

export function useSchemaTree(options: UseSchemaTreeOptions): UseSchemaTreeResult {
  const { connectionId, autoLoad = true, enableSearch = true } = options
  
  // Core state
  const [nodes, setNodes] = useState<SchemaTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<SchemaTreeNode | null>(null)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SchemaSearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  
  // Service instance
  const serviceRef = useRef<SchemaMetadataService>()
  
  // Initialize service
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new SchemaMetadataService()
    }
  }, [])
  
  // Load root schema nodes
  const loadSchema = useCallback(async () => {
    if (!connectionId || !serviceRef.current) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const schemaNodes = await serviceRef.current.getConnectionSchema(connectionId)
      setNodes(schemaNodes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load schema'
      setError(errorMessage)
      console.error('Failed to load schema:', err)
    } finally {
      setLoading(false)
    }
  }, [connectionId])
  
  // Load schema on mount or connection change
  useEffect(() => {
    if (connectionId && autoLoad) {
      // Clear previous state when connection changes
      setNodes([])
      setError(null)
      setSelectedNode(null)
      setExpandedNodeIds(new Set())
      
      // Load new schema
      loadSchema()
    }
  }, [connectionId, autoLoad]) // Removed loadSchema from dependencies to prevent infinite loop
  
  // Refresh schema (clear cache and reload)
  const refreshSchema = useCallback(async () => {
    if (!connectionId || !serviceRef.current) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await serviceRef.current.refreshSchema(connectionId)
      const schemaNodes = await serviceRef.current.getConnectionSchema(connectionId)
      setNodes(schemaNodes)
      
      // Clear expanded nodes as structure might have changed
      setExpandedNodeIds(new Set())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh schema'
      setError(errorMessage)
      console.error('Failed to refresh schema:', err)
    } finally {
      setLoading(false)
    }
  }, [connectionId])
  
  // Expand a node and load its children
  const expandNode = useCallback(async (node: SchemaTreeNode) => {
    if (!connectionId || !serviceRef.current) {
      return
    }
    
    const newExpandedNodeIds = new Set(expandedNodeIds)
    
    if (newExpandedNodeIds.has(node.id)) {
      // Collapse the node
      newExpandedNodeIds.delete(node.id)
      setExpandedNodeIds(newExpandedNodeIds)
      return
    }
    
    // Expand the node
    newExpandedNodeIds.add(node.id)
    setExpandedNodeIds(newExpandedNodeIds)
    
    // Load children if not already loaded
    if (node.hasChildren && (!node.children || node.children.length === 0)) {
      try {
        // Mark node as loading
        setNodes(currentNodes => updateNodeInTree(currentNodes, node.id, { loading: true }))
        
        const children = await serviceRef.current.getSchemaChildren(connectionId, node.path)
        
        // Update the node with its children
        setNodes(currentNodes => updateNodeInTree(currentNodes, node.id, { 
          children, 
          loading: false 
        }))
      } catch (err) {
        console.error('Failed to load children for node:', node.name, err)
        
        // Mark node as not loading
        setNodes(currentNodes => updateNodeInTree(currentNodes, node.id, { loading: false }))
      }
    }
  }, [connectionId, expandedNodeIds])
  
  // Select a node
  const selectNode = useCallback((node: SchemaTreeNode) => {
    setSelectedNode(node)
  }, [])
  
  // Search schema
  const searchSchema = useCallback(async (query: string, filters?: SchemaSearchFilters) => {
    if (!connectionId || !serviceRef.current || !enableSearch) {
      return
    }
    
    if (!query.trim()) {
      clearSearch()
      return
    }
    
    setSearchLoading(true)
    
    try {
      const results = await serviceRef.current.searchSchema(connectionId, query, filters)
      setSearchResults(results)
    } catch (err) {
      console.error('Failed to search schema:', err)
      setSearchResults(null)
    } finally {
      setSearchLoading(false)
    }
  }, [connectionId, enableSearch])
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults(null)
  }, [])
  
  // Handle search query changes with debouncing
  useEffect(() => {
    if (!enableSearch) return
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchSchema(searchQuery)
      } else {
        clearSearch()
      }
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchSchema, clearSearch, enableSearch])
  
  return {
    nodes,
    loading,
    error,
    selectedNode,
    expandedNodeIds,
    searchQuery,
    searchResults,
    searchLoading,
    
    // Actions
    loadSchema,
    refreshSchema,
    expandNode,
    selectNode,
    setSearchQuery,
    searchSchema,
    clearSearch
  }
}

// Helper function to update a node in the tree
function updateNodeInTree(
  nodes: SchemaTreeNode[], 
  nodeId: string, 
  updates: Partial<SchemaTreeNode>
): SchemaTreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, ...updates }
    }
    
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(node.children, nodeId, updates)
      }
    }
    
    return node
  })
}