import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysDictItem extends BaseResp {
  /**
   * 字典项值
   */
  dictItemValue?: string
  /**
   * 字典项值对应的显示文本
   */
  dictItemText: string
  /**
   * 字典排序
   */
  index: string
}
