import type BaseData from '@/types/BaseData'

/**
 * 日志响应数据
 */
export default interface SysLogData extends BaseData {
  /**
   * 日志类型
   */
  type?: string
  /**
   * 链路跟踪 ID，用于聚合同一次调用的所有日志
   */
  traceId?: string
  /**
   * 所在线程信息
   */
  thread?: string
  /**
   * 日志发生的位置
   */
  happenPlace?: string
  /**
   * 日志主体内容
   */
  content?: string
  /**
   * 参数大小
   */
  paramLength?: number
  /**
   * 参数
   */
  params?: string
  /**
   * 返回值大小
   */
  resultLength?: number
  /**
   * 返回值
   */
  result?: string
  /**
   * 方法耗时
   */
  cost?: number
  /**
   * 操作人ip
   */
  ip?: string
  /**
   * HTTP 请求路径
   */
  requestUrl?: string
  /**
   * 错误堆栈信息
   */
  errorStack?: string
}
