import type BaseParam from '@/types/BaseParam'

/**
 * 角色-数据范围关系请求参数
 */
export default interface SysRoleDataScopeParam extends BaseParam {
  /**
   * 角色ID
   */
  roleId?: string

  /**
   * 数据规则ID
   */
  scopeId?: string
}
