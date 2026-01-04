import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * 角色的实体类型
 */
export default interface SysUserRole extends BaseResp {
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
