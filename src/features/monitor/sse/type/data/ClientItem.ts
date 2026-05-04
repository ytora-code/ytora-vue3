import PushMessageItem from './PushMessageItem'

export default interface ClientItem {
  /**
   * 客户端ID
   */
  clientId: string | null

  /**
   * 建连请求路径
   */
  requestUri: string | null

  /**
   * 客户端IP
   */
  clientIp: string | null

  /**
   * UserAgent
   */
  userAgent: string | null

  /**
   * 建连时间戳
   */
  connectedAt: number | null

  /**
   * 累计推送数据大小(Bytes)
   */
  totalPayloadBytes: number | null

  /**
   * 最近推送的10条数据
   */
  recentMessages: PushMessageItem[] | null
}
