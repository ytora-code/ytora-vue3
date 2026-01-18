import type BaseResp from '@/types/resp/BaseResp.ts'
import type ColumnMeta from '@/views/sys/db/type/resp/ColumnMeta.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 视图元数据
 */
export default interface ViewMeta extends BaseResp {
  /**
   * 所属数据库
   */
  catalog: string

  /**
   * 所属模式
   */
  schema: string

  /**
   * 视图名称
   */
  name: string

  /**
   * 视图注释
   */
  comment: string

  /**
   * 视图字段
   */
  columnMetas: ColumnMeta[]

  /**
   * 视图没有主键
   */
  primaryKeys: undefined

  /**
   * 视图没有索引
   */
  indexMetas: undefined
}
