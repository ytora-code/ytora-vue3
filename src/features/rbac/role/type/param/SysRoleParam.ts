import type BaseParam from '@/types/BaseParam'

/**
 * 角色请求参数
 */
export default interface SysRoleParam extends BaseParam {
  /**
   * 角色名称
   */
  roleName?: string
  /**
   * 角色编码
   */
  roleCode?: string
}
