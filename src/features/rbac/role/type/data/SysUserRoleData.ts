import BaseData from '@/types/BaseData'

/**
 * 用户-角色绑定关系数据
 */
export default interface SysUserRoleData extends BaseData {
  /**
   * 用户ID
   */
  userId?: string
  /**
   * 角色ID
   */
  roleId?: string
  /**
   * 角色名称
   */
  roleName?: string
  /**
   * 角色编码
   */
  roleCode?: string
  /**
   * 角色备注
   */
  roleRemark?: string
  /**
   * 是否拥有
   */
  owner: boolean
}
