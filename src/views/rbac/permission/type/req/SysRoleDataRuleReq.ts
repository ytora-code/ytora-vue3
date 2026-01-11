import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * 数据规则
 */
export default interface SysRoleDataRuleReq extends BaseReq {
  /**
   * 角色ID
   */
  roleId?: string

  /**
   * 资源ID
   */
  permissionId?: string

  /**
   * 原始规则ID数组
   */
  originDataRuleIds?: (string | number)[]

  /**
   * 最新的规则ID数组
   */
  currentDataRuleIds?: (string | number)[]
}
