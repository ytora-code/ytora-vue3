import type BaseParam from '@/types/BaseParam'

/**
 * 字典请求参数
 */
export default interface SysDictParam extends BaseParam {
  /**
   * 字典名称
   */
  dictName?: string
  /**
   * 字典编码
   */
  dictCode?: string
  /**
   * 字典项排序
   */
  index?: number
}
