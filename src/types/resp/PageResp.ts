/**
 * 约定对于一般分页请求，响应体json数据结构在CommonResponse的基础上，还多了分页的结构
 */
export default interface PageResp<T> {
  /**
   * 当前分页数
   */
  pageNo: number,
  /**
   * 每页尺寸
   */
  pageSize: number,

  /**
   * 总分页数
   */
  pages?: number,
  /**
   * 总记录数
   */
  total?: number,
  /**
   * 数据区域
   */
  records: Array<T>
}
