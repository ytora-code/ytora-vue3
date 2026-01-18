import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/18 下午3:28
 * 索引列元数据
 */
export default interface IndexColumnMeta extends BaseResp {
  column: string

  /**
   * 该列在复合索引中的次序（通常从 1 开始）
   */
  position: number

  /**
   * 排序规则
   */
  order: string
}
