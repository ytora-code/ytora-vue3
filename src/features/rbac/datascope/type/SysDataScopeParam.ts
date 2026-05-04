import type BaseParam from '@/types/BaseParam'

/**
 * 数据范围请求参数
 */
export default interface SysDataScopeParam extends BaseParam {
  /**
   * 所属分组ID
   */
  groupId?: number

  /**
   * 数据范围名称
   */
  name?: string

  /**
   * 数据范围匹配的列
   */
  column?: string

  /**
   * 数据范围类型
   */
  type?: string

  /**
   * 数据范围的规则
   */
  value?: string
}
