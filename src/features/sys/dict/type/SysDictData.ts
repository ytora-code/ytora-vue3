import type BaseData from '@/types/BaseData'

/**
 * 字典响应数据
 */
export default interface SysDictData extends BaseData {
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
