/**
 * Permission Service
 * 
 * Handles role-based access control and permission checking
 */

import type { User } from '../types/auth'
import { ROLE_PERMISSIONS, Permission, UserRole } from '../types/auth'

export class PermissionService {
  
  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User | null, permission: Permission): boolean {
    if (!user || !user.role) return false
    
    const rolePermissions = ROLE_PERMISSIONS[user.role]
    return rolePermissions.includes(permission)
  }

  /**
   * Check if a user has any of the specified permissions
   */
  hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user || !permissions.length) return false
    
    return permissions.some(permission => this.hasPermission(user, permission))
  }

  /**
   * Check if a user has all of the specified permissions
   */
  hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user || !permissions.length) return false
    
    return permissions.every(permission => this.hasPermission(user, permission))
  }

  /**
   * Check if a user has a specific role
   */
  hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role
  }

  /**
   * Check if a user has any of the specified roles
   */
  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user || !roles.length) return false
    
    return roles.includes(user.role)
  }

  /**
   * Get all permissions for a user's role
   */
  getUserPermissions(user: User | null): Permission[] {
    if (!user || !user.role) return []
    
    return ROLE_PERMISSIONS[user.role] || []
  }

  /**
   * Check if a role has higher privileges than another role
   */
  isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 4,
      [UserRole.EDITOR]: 3,
      [UserRole.ANALYST]: 2,
      [UserRole.VIEWER]: 1
    }
    
    return roleHierarchy[roleA] > roleHierarchy[roleB]
  }

  /**
   * Check if user can manage another user (based on role hierarchy)
   */
  canManageUser(currentUser: User | null, targetUser: User): boolean {
    if (!currentUser) return false
    
    // Users can always manage themselves
    if (currentUser.id === targetUser.id) return true
    
    // Only admins can manage other users, and they can't demote other admins
    if (currentUser.role === UserRole.ADMIN) {
      return targetUser.role !== UserRole.ADMIN || currentUser.id === targetUser.id
    }
    
    return false
  }

  /**
   * Get available roles that a user can assign to others
   */
  getAssignableRoles(currentUser: User | null): UserRole[] {
    if (!currentUser) return []
    
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return [UserRole.EDITOR, UserRole.ANALYST, UserRole.VIEWER]
      default:
        return []
    }
  }

  /**
   * Check if user can access a specific resource
   */
  canAccessResource(user: User | null, resourceType: string, action: string): boolean {
    if (!user) return false
    
    // Map resource types and actions to permissions
    const permissionMap: Record<string, Record<string, Permission>> = {
      query: {
        create: Permission.QUERY_CREATE,
        read: Permission.QUERY_READ,
        update: Permission.QUERY_UPDATE,
        delete: Permission.QUERY_DELETE,
        execute: Permission.QUERY_EXECUTE
      },
      connection: {
        create: Permission.CONNECTION_CREATE,
        read: Permission.CONNECTION_READ,
        update: Permission.CONNECTION_UPDATE,
        delete: Permission.CONNECTION_DELETE,
        test: Permission.CONNECTION_TEST
      },
      user: {
        create: Permission.USER_CREATE,
        read: Permission.USER_READ,
        update: Permission.USER_UPDATE,
        delete: Permission.USER_DELETE
      },
      system: {
        settings: Permission.SYSTEM_SETTINGS,
        monitoring: Permission.SYSTEM_MONITORING,
        backup: Permission.SYSTEM_BACKUP
      },
      data: {
        export: Permission.DATA_EXPORT,
        import: Permission.DATA_IMPORT,
        share: Permission.DATA_SHARE
      }
    }
    
    const resourcePermissions = permissionMap[resourceType]
    if (!resourcePermissions) return false
    
    const requiredPermission = resourcePermissions[action]
    if (!requiredPermission) return false
    
    return this.hasPermission(user, requiredPermission)
  }

  /**
   * Filter items based on user permissions
   */
  filterByPermission<T extends { id: string }>(
    user: User | null,
    items: T[],
    permission: Permission
  ): T[] {
    if (!user) return []
    
    if (this.hasPermission(user, permission)) {
      return items
    }
    
    return []
  }

  /**
   * Get permission description for UI display
   */
  getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      [Permission.QUERY_CREATE]: 'Create new queries',
      [Permission.QUERY_READ]: 'View queries and results',
      [Permission.QUERY_UPDATE]: 'Edit existing queries',
      [Permission.QUERY_DELETE]: 'Delete queries',
      [Permission.QUERY_EXECUTE]: 'Execute queries',
      [Permission.CONNECTION_CREATE]: 'Create new database connections',
      [Permission.CONNECTION_READ]: 'View database connections',
      [Permission.CONNECTION_UPDATE]: 'Edit database connections',
      [Permission.CONNECTION_DELETE]: 'Delete database connections',
      [Permission.CONNECTION_TEST]: 'Test database connections',
      [Permission.USER_CREATE]: 'Create new users',
      [Permission.USER_READ]: 'View user information',
      [Permission.USER_UPDATE]: 'Edit user information',
      [Permission.USER_DELETE]: 'Delete users',
      [Permission.SYSTEM_SETTINGS]: 'Access system settings',
      [Permission.SYSTEM_MONITORING]: 'View system monitoring',
      [Permission.SYSTEM_BACKUP]: 'Perform system backups',
      [Permission.DATA_EXPORT]: 'Export data',
      [Permission.DATA_IMPORT]: 'Import data',
      [Permission.DATA_SHARE]: 'Share data with others'
    }
    
    return descriptions[permission] || 'Unknown permission'
  }

  /**
   * Get role description for UI display
   */
  getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Full system access and user management',
      [UserRole.EDITOR]: 'Create and edit queries, manage connections',
      [UserRole.ANALYST]: 'Execute queries and create visualizations',
      [UserRole.VIEWER]: 'Read-only access to queries and data'
    }
    
    return descriptions[role] || 'Unknown role'
  }

  /**
   * Check if user can perform bulk operations
   */
  canPerformBulkOperations(user: User | null, operation: string): boolean {
    if (!user) return false
    
    // Only certain roles can perform bulk operations
    const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR]
    
    if (!allowedRoles.includes(user.role)) return false
    
    // Check specific operation permissions
    switch (operation) {
      case 'delete_queries':
        return this.hasPermission(user, Permission.QUERY_DELETE)
      case 'export_data':
        return this.hasPermission(user, Permission.DATA_EXPORT)
      case 'manage_users':
        return this.hasPermission(user, Permission.USER_UPDATE)
      default:
        return false
    }
  }
}

// Create singleton instance
export const permissionService = new PermissionService()