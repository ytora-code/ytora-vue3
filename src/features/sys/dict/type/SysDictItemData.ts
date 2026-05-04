import type BaseData from '@/types/BaseData'

/**
 * 字典项响应数据
 */
export default interface SysDictItemData extends BaseData {
  /**
   * 字典编码
   */
  dictCode?: string
  /**
   * 字典项值
   */
  itemValue?: string
  /**
   * 字典项文本
   */
  itemText?: string
  /**
   * 字典项排序
   */
  index?: number
  /**
   * 字典项颜色
   */
  color?: string
}
