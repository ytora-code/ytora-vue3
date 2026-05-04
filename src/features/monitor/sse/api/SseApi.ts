import BaseApi from '@/api/BaseApi'
import SseSendParam from '@/features/monitor/sse/type/param/SseSendParam'
import AppSseMetricsData from '@/features/monitor/sse/type/data/AppSseMetricsData'

class SseApi extends BaseApi {
  constructor() {
    super('/sse')
  }

  /**
   * 发送消息
   */
  send = (param: SseSendParam) => {
    return this.post<unknown, SseSendParam>('send', param)
  }

  /**
   * 查询消息推送事件
   */
  listEvent = () => {
    return this.get<Record<string, object>>('listEvent')
  }

  /**
   * 启动消息推送事件
   */
  startEvent = (eventName: string) => {
    return this.get<string, { eventName: string }>('startEvent', { eventName })
  }

  /**
   * 停止消息推送事件
   */
  stopEvent = (eventName: string) => {
    return this.get<string, { eventName: string }>('stopEvent', { eventName })
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', { ids: ids.join(',') })
  }

  /**
   * 查询SSE客户端
   */
  listClient = () => {
    return this.get<AppSseMetricsData>('listClient')
  }
}

export default new SseApi()
