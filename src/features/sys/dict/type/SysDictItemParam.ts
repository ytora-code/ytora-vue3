import type BaseParam from '@/types/BaseParam'

/**
 * 字典项请求参数
 */
export default interface SysDictItemParam extends BaseParam {
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
