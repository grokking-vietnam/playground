/**
 * SchemaTree Component - Real data tree component with lazy loading
 */

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronDown, Database, Folder, Table, Eye, Key, HelpCircle, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SchemaTreeNode, SchemaSearchFilters } from '../../types/schema-tree'

export interface SchemaTreeProps {
  connectionId: string
  nodes: SchemaTreeNode[]
  loading?: boolean
  onNodeExpand?: (node: SchemaTreeNode) => void
  onNodeSelect?: (node: SchemaTreeNode) => void
  onNodeContextMenu?: (node: SchemaTreeNode, event: React.MouseEvent) => void
  selectedNodeId?: string
  expandedNodeIds?: Set<string>
  searchQuery?: string
  searchFilters?: SchemaSearchFilters
}

export interface SchemaTreeNodeProps {
  node: SchemaTreeNode
  level: number
  isSelected: boolean
  isExpanded: boolean
  onExpand: (node: SchemaTreeNode) => void
  onSelect: (node: SchemaTreeNode) => void
  onContextMenu: (node: SchemaTreeNode, event: React.MouseEvent) => void
}

const getNodeIcon = (node: SchemaTreeNode) => {
  const iconProps = { className: "h-4 w-4", 'aria-hidden': true }
  
  switch (node.type) {
    case 'connection':
    case 'database':
      return <Database {...iconProps} />
    case 'schema':
      return <Folder {...iconProps} />
    case 'table':
      return <Table {...iconProps} />
    case 'view':
      return <Eye {...iconProps} />
    case 'column':
      return node.metadata?.primaryKey ? 
        <Key {...iconProps} className="h-4 w-4 text-yellow-600" /> : 
        <div className="h-4 w-4 border border-muted-foreground rounded-sm" />
    case 'index':
      return <Zap {...iconProps} />
    case 'constraint':
      return <Shield {...iconProps} />
    default:
      return <HelpCircle {...iconProps} />
  }
}

const getNodeTitle = (node: SchemaTreeNode) => {
  const parts = [node.name]
  
  if (node.metadata) {
    if (node.metadata.dataType) {
      parts.push(`${node.metadata.dataType}`)
    }
    
    if (node.metadata.rowCount !== undefined) {
      const rowCount = node.metadata.rowCount.toLocaleString()
      parts.push(`${rowCount} rows`)
    }
    
    if (node.metadata.nullable === false) {
      parts.push('NOT NULL')
    }
    
    if (node.metadata.primaryKey) {
      parts.push('PK')
    }
    
    if (node.metadata.foreignKey) {
      parts.push(`FK → ${node.metadata.foreignKey.referencedTable}`)
    }
  }
  
  return parts.join(' | ')
}

const getNodeDescription = (node: SchemaTreeNode) => {
  if (node.metadata?.description) {
    return node.metadata.description
  }
  
  switch (node.type) {
    case 'database':
      return `Database with ${node.children?.length || 0} schemas`
    case 'schema':
      return `Schema owned by ${node.metadata?.owner || 'unknown'}`
    case 'table':
      return `Table with ${node.children?.length || 0} columns`
    case 'view':
      return `View with ${node.children?.length || 0} columns`
    case 'column':
      return `Column of type ${node.metadata?.dataType || 'unknown'}`
    default:
      return `${node.type} object`
  }
}

interface SchemaTreeNodeComponentProps extends SchemaTreeNodeProps {
  expandedNodeIds?: Set<string>
  selectedNodeId?: string
}

const SchemaTreeNodeComponent: React.FC<SchemaTreeNodeComponentProps> = ({
  node,
  level,
  isSelected,
  isExpanded,
  onExpand,
  onSelect,
  onContextMenu,
  expandedNodeIds = new Set(),
  selectedNodeId
}) => {
  const hasChildren = node.hasChildren || (node.children && node.children.length > 0)
  
  // Debug logging
  React.useEffect(() => {
    if (node.type === 'schema') {
      console.log(`Schema node ${node.name}:`, {
        hasChildren,
        childrenCount: node.children?.length || 0,
        isExpanded,
        children: node.children?.map(c => c.name) || []
      })
    }
  }, [node, hasChildren, isExpanded])
  
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onExpand(node)
    }
  }, [hasChildren, onExpand, node])
  
  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(node)
  }, [onSelect, node])
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(node, e)
  }, [onContextMenu, node])
  
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 text-sm cursor-pointer hover:bg-accent rounded-sm group",
          isSelected && "bg-accent",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        title={getNodeTitle(node)}
      >
        {/* Expand/Collapse Toggle */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="h-4 w-4" />
        )}
        
        {/* Node Icon */}
        <div className="flex-shrink-0">
          {getNodeIcon(node)}
        </div>
        
        {/* Node Name and Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">
              {node.name}
            </span>
            
            {/* Type Badge */}
            <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
              {node.type}
            </span>
            
            {/* Metadata Indicators */}
            {node.metadata?.primaryKey && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded">
                PK
              </span>
            )}
            
            {node.metadata?.foreignKey && (
              <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                FK
              </span>
            )}
            
            {node.metadata?.nullable === false && (
              <span className="text-xs text-red-600 bg-red-100 px-1 rounded">
                NOT NULL
              </span>
            )}
          </div>
          
          {/* Additional Info */}
          <div className="text-xs text-muted-foreground truncate">
            {node.metadata?.dataType && (
              <span>{node.metadata.dataType}</span>
            )}
            
            {node.metadata?.rowCount !== undefined && (
              <span className="ml-2">
                {node.metadata.rowCount.toLocaleString()} rows
              </span>
            )}
            
            {node.metadata?.sizeBytes && (
              <span className="ml-2">
                {(node.metadata.sizeBytes / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
          </div>
        </div>
        
        {/* Loading Indicator */}
        {node.loading && (
          <div className="flex-shrink-0">
            <div className="animate-spin h-3 w-3 border border-muted-foreground border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      
      {/* Child Nodes */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <SchemaTreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isSelected={selectedNodeId === child.id}
              isExpanded={expandedNodeIds.has(child.id)}
              onExpand={onExpand}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              expandedNodeIds={expandedNodeIds}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const SchemaTree: React.FC<SchemaTreeProps> = ({
  connectionId,
  nodes,
  loading = false,
  onNodeExpand,
  onNodeSelect,
  onNodeContextMenu,
  selectedNodeId,
  expandedNodeIds = new Set(),
  searchQuery,
  searchFilters
}) => {
  // Use external expandedNodeIds directly instead of internal state
  const handleNodeExpand = useCallback((node: SchemaTreeNode) => {
    console.log(`Expanding node: ${node.name} (${node.id})`)
    if (onNodeExpand) {
      onNodeExpand(node)
    }
  }, [onNodeExpand])
  
  const handleNodeSelect = useCallback((node: SchemaTreeNode) => {
    if (onNodeSelect) {
      onNodeSelect(node)
    }
  }, [onNodeSelect])
  
  const handleNodeContextMenu = useCallback((node: SchemaTreeNode, event: React.MouseEvent) => {
    if (onNodeContextMenu) {
      onNodeContextMenu(node, event)
    }
  }, [onNodeContextMenu])
  
  // Filter nodes based on search query and filters
  const filteredNodes = React.useMemo(() => {
    if (!searchQuery && !searchFilters) {
      return nodes
    }
    
    // Simple filtering - in a real implementation, this would use the search utilities
    return nodes.filter(node => {
      if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      if (searchFilters?.types && !searchFilters.types.includes(node.type)) {
        return false
      }
      
      return true
    })
  }, [nodes, searchQuery, searchFilters])
  
  if (loading && nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border border-muted-foreground border-t-transparent rounded-full" />
          Loading schema...
        </div>
      </div>
    )
  }
  
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          {searchQuery ? 'No matching objects found' : 'No schema objects available'}
        </div>
      </div>
    )
  }
  
  return (
    <div className="schema-tree">
      {filteredNodes.map((node) => (
        <SchemaTreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          isSelected={selectedNodeId === node.id}
          isExpanded={expandedNodeIds.has(node.id)}
          onExpand={handleNodeExpand}
          onSelect={handleNodeSelect}
          onContextMenu={handleNodeContextMenu}
          expandedNodeIds={expandedNodeIds}
          selectedNodeId={selectedNodeId}
        />
      ))}
    </div>
  )
}