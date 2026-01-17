import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 存储过程元数据
 */
export default interface ProcedureMeta extends BaseResp {
  /**
   * 所属数据库
   */
  catalog: string

  /**
   * 所属模式
   */
  schema: string

  /**
   * 存储过程名称
   */
  name: string

  /**
   * 存储过程注释
   */
  comment: string

  /**
   * 存储过程类型
   */
  procedureType: number
}
