import type BaseParam from '@/types/BaseParam'

/**
 * 部门请求参数
 */
export default interface SseSendParam extends BaseParam {
  /**
   * 事件类型
   */
  eventName: string

  /**
   * 消息发送给，null代表广播
   */
  to?: string

  /**
   * 消息内容
   */
  message: string
}
