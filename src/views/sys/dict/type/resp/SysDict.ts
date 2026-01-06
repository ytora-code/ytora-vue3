import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysDict extends BaseResp {

  /**
   * 字典名称
   */
  dictName?: string
  /**
   * 字典编码，唯一
   */
  dictCode: string
  /**
   * 字典排序
   */
  index: string

}
