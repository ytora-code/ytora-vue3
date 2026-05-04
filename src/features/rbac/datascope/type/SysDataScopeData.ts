import type BaseData from '@/types/BaseData'

/**
 * 数据范围响应数据
 */
export default interface SysDataScopeData extends BaseData {
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
