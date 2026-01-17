import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 函数元数据
 */
export default interface FunctionMeta extends BaseResp {
  /**
   * 所属数据库
   */
  catalog: string

  /**
   * 所属模式
   */
  schema: string

  /**
   * 函数名称
   */
  name: string

  /**
   * 函数注释
   */
  comment: string

  /**
   * 函数返回结果
   */
  returnType: number
}
