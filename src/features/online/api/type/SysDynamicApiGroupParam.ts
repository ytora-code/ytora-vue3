import type BaseParam from '@/types/BaseParam'

/**
 * 动态API接口分组请求参数
 */
export default interface SysDynamicApiGroupParam extends BaseParam {

  /**
   * 上级分组ID
   */
  pid?: string

  /**
   * 分组名称
   */
  name?: string

}
