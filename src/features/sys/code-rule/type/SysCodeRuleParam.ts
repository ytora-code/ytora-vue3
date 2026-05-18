import type BaseParam from '@/types/BaseParam'

/**
 * 系统编码规则请求参数
 */
export default interface SysCodeRuleParam extends BaseParam {

  /**
   * 规则编码，如 ORDER_NO、DDBM
   */
  ruleCode?: string

  /**
   * 规则名称
   */
  ruleName?: string

  /**
   * 编码模板，如 DDBM-${date:yyyy-MM-dd}-${seq:4}、DDBM-${date:yyyy}-${seq:4}、DDBM-${week}-${seq:4}、DDBM-${date:yyyy-MM-dd}-${uuid:32}、DDBM-${date:yyyy-MM-dd HH:mm}-${snow:20}
   */
  ruleTemplate?: string

  /**
   * seq流水起始值，默认0，表示第一次生成0000
   */
  seqStart?: number

  /**
   * seq流水步长，默认1
   */
  seqStep?: number

  /**
   * 日期时区
   */
  timezone?: string

}
