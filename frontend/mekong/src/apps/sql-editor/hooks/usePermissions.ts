/**
 * usePermissions Hook
 * 
 * Custom hook for permission checking and role-based access control
 */

import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { permissionService } from '../services/PermissionService'
import type { Permission, UserRole } from '../types/auth'

export function usePermissions() {
  const { user } = useAuth()

  const permissions = useMemo(() => {
    if (!user) return []
    return permissionService.getUserPermissions(user)
  }, [user])

  const hasPermission = (permission: Permission): boolean => {
    return permissionService.hasPermission(user, permission)
  }

  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionService.hasAnyPermission(user, permissionList)
  }

  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionService.hasAllPermissions(user, permissionList)
  }

  const hasRole = (role: UserRole): boolean => {
    return permissionService.hasRole(user, role)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return permissionService.hasAnyRole(user, roles)
  }

  const canAccessResource = (resourceType: string, action: string): boolean => {
    return permissionService.canAccessResource(user, resourceType, action)
  }

  const canManageUser = (targetUser: { id: string; role: UserRole }): boolean => {
    if (!user) return false
    return permissionService.canManageUser(user, { ...targetUser, 
      email: '', name: '', firstName: '', lastName: '', preferences: {} as any,
      createdAt: '', updatedAt: '', isActive: true, emailVerified: true 
    })
  }

  const getAssignableRoles = (): UserRole[] => {
    return permissionService.getAssignableRoles(user)
  }

  const canPerformBulkOperations = (operation: string): boolean => {
    return permissionService.canPerformBulkOperations(user, operation)
  }

  const isAdmin = useMemo(() => hasRole('admin'), [user])
  const isEditor = useMemo(() => hasRole('editor'), [user])
  const isAnalyst = useMemo(() => hasRole('analyst'), [user])
  const isViewer = useMemo(() => hasRole('viewer'), [user])

  // Common permission checks
  const can = useMemo(() => ({
    // Query permissions
    createQueries: hasPermission('query:create'),
    readQueries: hasPermission('query:read'),
    updateQueries: hasPermission('query:update'),
    deleteQueries: hasPermission('query:delete'),
    executeQueries: hasPermission('query:execute'),
    
    // Connection permissions
    createConnections: hasPermission('connection:create'),
    readConnections: hasPermission('connection:read'),
    updateConnections: hasPermission('connection:update'),
    deleteConnections: hasPermission('connection:delete'),
    testConnections: hasPermission('connection:test'),
    
    // User management permissions
    createUsers: hasPermission('user:create'),
    readUsers: hasPermission('user:read'),
    updateUsers: hasPermission('user:update'),
    deleteUsers: hasPermission('user:delete'),
    
    // System permissions
    accessSystemSettings: hasPermission('system:settings'),
    viewSystemMonitoring: hasPermission('system:monitoring'),
    performSystemBackup: hasPermission('system:backup'),
    
    // Data permissions
    exportData: hasPermission('data:export'),
    importData: hasPermission('data:import'),
    shareData: hasPermission('data:share')
  }), [user])

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
    canManageUser,
    getAssignableRoles,
    canPerformBulkOperations,
    isAdmin,
    isEditor,
    isAnalyst,
    isViewer,
    can
  }
}