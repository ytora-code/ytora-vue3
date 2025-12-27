/**
 * 约定对于一般请求，响应体json数据的结构由CommonResponse限制(非一般请求，下载文件接口)
 */
export default interface Result<T = unknown> {
  /**
   * 此次请求的状态码
   */
  code: number
  /**
   * 此次请求是否成功
   */
  success: boolean
  /**
   * 此次请求的提示信息
   */
  message: string
  /**耗时
   */
  time: number
  /**
   * 此次请求真正的返回数据
   */
  data: T
}
