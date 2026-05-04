import type BaseData from '@/types/BaseData'

/**
 * 角色响应数据
 */
export default interface SysRoleData extends BaseData {
  /**
   * 角色名称
   */
  roleName?: string
  /**
   * 角色编码
   */
  roleCode?: string
}
