import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * 数据规则
 */
export default interface SysDataRuleReq extends BaseReq {
  /**
   * 资源ID
   */
  permissionId?: string

  /**
   * 规则名称
   */
  ruleName?: string

  /**
   * 规则字段
   */
  ruleField?: string

  /**
   * 规则类型
   */
  ruleType?: string

  /**
   * 规则值
   */
  ruleValue?: string
}
