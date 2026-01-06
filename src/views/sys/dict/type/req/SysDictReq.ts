import type BaseReq from '@/types/req/BaseReq.ts'

export default interface SysDictReq extends BaseReq {
  /**
   * 父字典ID
   */
  pid?: string
  /**
   * 字典名称
   */
  dictName?: string
  /**
   * 字典编码，唯一
   */
  dictCode?: string
  /**
   * 字典项值
   */
  dictItemValue?: string
  /**
   * 字典项值对应的显示文本
   */
  dictItemText?: string
  /**
   * 字典排序
   */
  index?: number
  /**
   * 1-字典/2-字典项
   */
  type?: number
}
