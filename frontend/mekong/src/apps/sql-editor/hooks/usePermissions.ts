/**
 * usePermissions Hook
 * 
 * Custom hook for permission checking and role-based access control
 */

import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { permissionService } from '../services/PermissionService'
import { Permission, UserRole } from '../types/auth'

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

  const isAdmin = useMemo(() => hasRole(UserRole.ADMIN), [user])
  const isEditor = useMemo(() => hasRole(UserRole.EDITOR), [user])
  const isAnalyst = useMemo(() => hasRole(UserRole.ANALYST), [user])
  const isViewer = useMemo(() => hasRole(UserRole.VIEWER), [user])

  // Common permission checks
  const can = useMemo(() => ({
    // Query permissions
    createQueries: hasPermission(Permission.QUERY_CREATE),
    readQueries: hasPermission(Permission.QUERY_READ),
    updateQueries: hasPermission(Permission.QUERY_UPDATE),
    deleteQueries: hasPermission(Permission.QUERY_DELETE),
    executeQueries: hasPermission(Permission.QUERY_EXECUTE),
    
    // Connection permissions
    createConnections: hasPermission(Permission.CONNECTION_CREATE),
    readConnections: hasPermission(Permission.CONNECTION_READ),
    updateConnections: hasPermission(Permission.CONNECTION_UPDATE),
    deleteConnections: hasPermission(Permission.CONNECTION_DELETE),
    testConnections: hasPermission(Permission.CONNECTION_TEST),
    
    // User management permissions
    createUsers: hasPermission(Permission.USER_CREATE),
    readUsers: hasPermission(Permission.USER_READ),
    updateUsers: hasPermission(Permission.USER_UPDATE),
    deleteUsers: hasPermission(Permission.USER_DELETE),
    
    // System permissions
    accessSystemSettings: hasPermission(Permission.SYSTEM_SETTINGS),
    viewSystemMonitoring: hasPermission(Permission.SYSTEM_MONITORING),
    performSystemBackup: hasPermission(Permission.SYSTEM_BACKUP),
    
    // Data permissions
    exportData: hasPermission(Permission.DATA_EXPORT),
    importData: hasPermission(Permission.DATA_IMPORT),
    shareData: hasPermission(Permission.DATA_SHARE)
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