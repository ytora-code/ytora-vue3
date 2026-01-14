import { ref } from 'vue'
// 事件处理器类型定义
type EventHandler = (event: MessageEvent) => void
type UnsubscribeFunction = () => void

// 全局变量
let globalEventSource: EventSource | null = null
let connectionCount: number = 0
const eventHandlers = new Map<string, Set<EventHandler>>()

/**
 * SSE 接口事件订阅
 */
export function useSSE() {
  const isConnected = ref<boolean>(false)

  /**
   * 连接 SSE 接口
   * @param reconnect 该次连接是否属于重连，如果是正常连接，则引用计数+1，重连则不自增
   */
  const connect = (reconnect: boolean = false): void => {
    if (!reconnect) {
      // 引用计数+1
      connectionCount++
    }

    // 如果已经有连接，直接返回
    if (globalEventSource && globalEventSource.readyState === EventSource.OPEN) {
      isConnected.value = true
      return
    }

    console.log('建立全局 SSE 连接...')
    globalEventSource = new EventSource('http://localhost:9876/ytora/sys/sse/connect', {
      // 请求时携带 Cookie
      withCredentials: true,
    })

    globalEventSource.onopen = (): void => {
      isConnected.value = true
      console.log('全局 SSE 连接已建立')
    }

    globalEventSource.onerror = (): void => {
      isConnected.value = false
      console.log('SSE 连接错误，5秒后重连...')

      setTimeout(() => {
        if (connectionCount > 0) {
          // 还有组件在使用
          connect(true)
        }
      }, 5000)
    }

    globalEventSource.onmessage = (event: MessageEvent): void => {
      console.log('收到默认消息:', event.data)
    }
  }

  /**
   * 断开连接
   */
  const disconnect = (): void => {
    connectionCount--

    // 只有当没有组件使用时才真正断开
    if (connectionCount <= 0) {
      connectionCount = 0
      if (globalEventSource) {
        console.log('关闭全局 SSE 连接')
        globalEventSource.close()
        globalEventSource = null
        eventHandlers.clear()
      }
      isConnected.value = false
    }
  }

  /**
   * 监听指定事件
   */
  const on = (eventName: string, handler: EventHandler): UnsubscribeFunction | undefined => {
    if (!globalEventSource) {
      console.warn('请先调用 connect() 建立连接')
      return
    }

    // 如果是第一次监听这个事件，添加到 EventSource
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set<EventHandler>())

      globalEventSource.addEventListener(eventName, (event: Event) => {
        // 类型断言，因为我们知道这是 MessageEvent
        const messageEvent = event as MessageEvent

        // 分发给所有订阅者
        const handlers = eventHandlers.get(eventName)
        if (handlers) {
          handlers.forEach((callback: EventHandler) => {
            try {
              callback(messageEvent)
            } catch (error) {
              console.error(`处理事件 ${eventName} 失败:`, error)
            }
          })
        }
      })
    }

    // 添加处理器到集合
    const handlers = eventHandlers.get(eventName)
    if (handlers) {
      handlers.add(handler)
    }

    // 返回取消监听函数
    return (): void => {
      off(eventName, handler)
    }
  }

  /**
   * 取消监听
   */
  const off = (eventName: string, handler: EventHandler): void => {
    const handlers = eventHandlers.get(eventName)
    if (handlers) {
      handlers.delete(handler)

      // 没有处理器，移除事件监听
      if (handlers.size === 0) {
        eventHandlers.delete(eventName)
      }
    }
  }

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
  }
}
