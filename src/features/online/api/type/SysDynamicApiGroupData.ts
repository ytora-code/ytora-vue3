import type BaseData from '@/types/BaseData'

/**
 * 动态API接口分组响应数据
 */
export default interface SysDynamicApiGroupData extends BaseData {

  /**
   * 上级分组ID
   */
  pid?: string

  /**
   * 分组名称
   */
  name?: string

}
