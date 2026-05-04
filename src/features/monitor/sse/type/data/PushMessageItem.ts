export default interface PushMessageItem {
  /**
   * 推送时间戳
   */
  timestamp: number | null

  /**
   * 事件名称
   */
  event: string | null

  /**
   * 消息ID
   */
  messageId: string | null

  /**
   * 推送数据
   */
  payload: string | null

  /**
   * 推送数据字节数
   */
  payloadBytes: number | null
}
