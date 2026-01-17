import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 下午6:23
 * 视图元数据
 */
export default interface ViewMeta extends BaseResp {

  /**
   * 所属数据库
   */
  catalog: string;

  /**
   * 所属模式
   */
  schema: string;

  /**
   * 视图名称
   */
  viewName: string;

  /**
   * 视图注释
   */
  comment: string;

}
