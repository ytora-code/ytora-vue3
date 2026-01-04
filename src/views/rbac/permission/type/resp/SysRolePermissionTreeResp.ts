/**
 * 角色-资源树节点
 */
export interface SysRolePermissionTreeResp {
  /** 权限 ID（Tree 的 key） */
  id: string

  /** 父节点 ID */
  pid: string

  /** 权限名称（Tree 显示用） */
  permissionName: string

  /** 子节点 */
  children?: SysRolePermissionTreeResp[]
}
