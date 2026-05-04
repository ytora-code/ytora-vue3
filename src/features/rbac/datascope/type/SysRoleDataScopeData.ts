import type BaseData from '@/types/BaseData'

/**
 * 角色-数据范围关系响应数据
 */
export default interface SysRoleDataScopeData extends BaseData {
  /**
   * 角色ID
   */
  roleId?: string

  /**
   * 数据规则ID
   */
  scopeId?: string
}
