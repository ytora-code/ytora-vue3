import ClientItem from '@/features/monitor/sse/type/data/ClientItem'

export default interface AppSseMetricsData {
  /**
   * 当前SSE连接总数
   */
  connectionCount: number | null

  /**
   * 客户端连接与推送统计信息
   **/
  clients: ClientItem[] | null

  /**
   * 采样时间戳
   */
  timestamp: number | null
}
