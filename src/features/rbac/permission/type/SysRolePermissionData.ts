import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

/**
 * 角色-资源权限返回
 */
export interface SysRolePermissionData {
  /**
   * 资源树
   */
  tree: SysPermissionData[]

  /**
   * 角色拥有的所有资源 ID
   */
  permissionIds: string[]
}
