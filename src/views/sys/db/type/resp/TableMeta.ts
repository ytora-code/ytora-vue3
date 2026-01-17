import type BaseResp from '@/types/resp/BaseResp.ts'
import type ColumnMeta from '@/views/sys/db/type/resp/ColumnMeta.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 表元数据
 */
export default interface TableMeta extends BaseResp {
  /**
   * 所属数据库
   */
  catalog: string

  /**
   * 所属模式
   */
  schema: string

  /**
   * 表名称
   */
  table: string

  /**
   * 表注释
   */
  comment: string

  /**
   * 表字段
   */
  columnMetas: ColumnMeta[]
}
