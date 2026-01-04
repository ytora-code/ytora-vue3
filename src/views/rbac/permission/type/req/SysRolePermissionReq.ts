export default interface SysRolePermissionReq {
  /**
   * 角色ID
   */
  roleId?: string

  /**
   * 原始集合数组
   */
  originPermissionIds?: string[]

  /**
   * 最新的集合数组
   */
  currentPermissionIds?: string[]
}
