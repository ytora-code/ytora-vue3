/**
 * created by YT on 2026/1/18 上午1:28
 * 表/视图数据拉取请求
 */
export default interface FetchDataReq {
  /**
   * 目标数据的数据源
   */
  ds?: string
  /**
   * 目标数据的schema
   */
  schema?: string
  /**
   * 目标数据所在表/视图的名称
   */
  name?: string
  /**
   * 查询条件
   */
  where?: string
  /**
   * 排序字段，默认：id↑
   */
  orderCol?: string
}
