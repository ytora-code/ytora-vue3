import type BaseReq from '@/types/req/BaseReq.ts'
import type BaseResp from '@/types/resp/BaseResp.ts'
import type SysDataRule from '@/views/rbac/permission/type/resp/SysDataRule.ts'

/**
 * 数据规则
 */
export default interface SysRoleDataRuleResp extends BaseResp {
  /**
   * 数据规则名称
   */
  ruleName: string

  /**
   * 数据规则
   */
  dataRules: SysDataRule[]

  /**
   * 数据规则ID
   */
  ruleIds: string[]
}
