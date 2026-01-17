import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 下午9:12
 * 列元数据
 */
export default interface ColumnMeta extends BaseResp {
  /**
   * 字段名称
   */
  columnName: string

  /**
   * 字段类型
   */
  columnType: string

  /**
   * 字段长度
   */
  columnLength: number

  /**
   * 字段进度
   */
  decimalDigits: number

  /**
   * 字段备注
   */
  columnComment: string

  /**
   * 是否自动递增
   */
  autoIncrement: boolean

  /**
   * 是否非空
   */
  nullable: boolean
}
