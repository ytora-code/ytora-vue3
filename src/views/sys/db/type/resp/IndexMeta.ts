import type BaseResp from '@/types/resp/BaseResp.ts'
import type IndexColumnMeta from '@/views/sys/db/type/resp/IndexColumnMeta.ts'

/**
 * created by YT on 2026/1/18 下午3:26
 * 索引元数据
 */
export default interface IndexMeta extends BaseResp {
  /**
   * 索引名称
   */
  name: string

  /**
   * 是否唯一
   */
  unique: boolean

  /**
   * 索引列元数据
   */
  columns: IndexColumnMeta[]
}
