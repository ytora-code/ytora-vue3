import type BaseParam from '@/types/BaseParam'

/**
 * 获取用户-角色关系的参数
 */
export default interface SysUserRoleMapperParam extends BaseParam {
  /**
   * 用户ID
   */
  userId?: string

  /**
   * 角色名称
   */
  roleName?: string

  /**
   * 角色编码
   */
  roleCode?: string
}
