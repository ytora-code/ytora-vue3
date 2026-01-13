import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * 数据规则
 */
export default interface SysDataRule extends BaseResp {
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
   * 规则类型
   */
  ruleType_dict?: string

  /**
   * 规则值
   */
  ruleValue?: string
}
