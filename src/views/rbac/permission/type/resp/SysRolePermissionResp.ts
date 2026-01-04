import type { SysRolePermissionTreeResp } from '@/views/rbac/permission/type/resp/SysRolePermissionTreeResp.ts'

/**
 * 角色-资源权限返回
 */
export interface SysRolePermissionResp {
  /**
   * 资源树
   */
  tree: SysRolePermissionTreeResp[]

  /**
   * 角色拥有的所有资源 ID
   */
  permissionIds: string[]
}
