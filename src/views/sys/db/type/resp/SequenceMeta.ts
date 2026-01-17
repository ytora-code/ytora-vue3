import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 序列元数据
 */
export default interface SequenceMeta extends BaseResp {

  /**
   * 所属数据库
   */
  catalog: string;

  /**
   * 所属模式
   */
  schema: string;

  /**
   * 序列名称
   */
  name: string;

  /**
   * 序列注释
   */
  comment: string;

}
