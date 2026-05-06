import { ref } from 'vue'
import loginApi from '@/components/login/api/LoginApi'
import sseApi from '../api/SseApi'

type EventHandler = (event: MessageEvent<string>) => void
type UnsubscribeFunction = () => void
type SsePrecheckStatus = 'ok' | 'expired' | 'retry'
type RespError = Error & { code?: number }

let globalEventSource: EventSource | null = null
let connectionCount = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

const eventHandlers = new Map<string, Set<EventHandler>>()
const domEventListeners = new Map<string, EventListener>()
const connectedRefs = new Set<ReturnType<typeof ref<boolean>>>()

const RECONNECT_DELAY = 5000

/**
 * 进行SSE连接前做一次测试连接
 */
const tryCheckSseConnection = async (): Promise<SsePrecheckStatus> => {
  try {
    await loginApi.check()
    return 'ok'
  } catch (error: unknown) {
    console.error('SSE 连接预检失败:', error)

    const code = (error as RespError).code
    if (code === 10 || code === 11) {
      return 'expired'
    }

    return 'retry'
  }
}

/**
 * SSE连接地址
 */
const resolveSseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_REQUEST_BASE_URL || '/'
  return `${baseUrl}sse/connect`
}

const syncConnectedState = (value: boolean) => {
  connectedRefs.forEach((state) => {
    state.value = value
  })
}

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

const scheduleReconnect = () => {
  if (connectionCount <= 0 || reconnectTimer) {
    return
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null

    if (connectionCount > 0) {
      void createEventSource()
    }
  }, RECONNECT_DELAY)
}

const dispatchEvent = (eventName: string, event: MessageEvent<string>) => {
  const handlers = eventHandlers.get(eventName)
  if (!handlers) {
    return
  }

  handlers.forEach((handler) => {
    try {
      handler(event)
    } catch (error) {
      console.error(`处理事件 ${eventName} 失败:`, error)
    }
  })
}

const bindEventListener = (eventName: string) => {
  if (!globalEventSource || domEventListeners.has(eventName)) {
    return
  }

  const listener: EventListener = (event) => {
    dispatchEvent(eventName, event as MessageEvent<string>)
  }

  domEventListeners.set(eventName, listener)
  globalEventSource.addEventListener(eventName, listener)
}

const rebindEventListeners = () => {
  Array.from(eventHandlers.keys()).forEach((eventName) => {
    bindEventListener(eventName)
  })
}

/**
 * 进行SSE连接
 */
const createEventSource = async () => {
  clearReconnectTimer()

  const status = await tryCheckSseConnection()

  if (connectionCount <= 0) {
    syncConnectedState(false)
    return
  }

  // SSE连接前的测试连接失败
  if (status === 'expired') {
    syncConnectedState(false)
    return
  }

  // SSE连接前的测试连接网络超时，重试
  if (status === 'retry') {
    syncConnectedState(false)
    scheduleReconnect()
    return
  }

  globalEventSource = new EventSource(resolveSseUrl(), {
    withCredentials: true,
  })

  globalEventSource.onopen = () => {
    syncConnectedState(true)
    rebindEventListeners()
  }

  globalEventSource.onerror = () => {
    syncConnectedState(false)

    if (globalEventSource) {
      globalEventSource.close()
      globalEventSource = null
      domEventListeners.clear()
    }

    scheduleReconnect()
  }
}

const resetGlobalState = () => {
  clearReconnectTimer()

  if (globalEventSource) {
    globalEventSource.close()
    globalEventSource = null
  }

  eventHandlers.clear()
  domEventListeners.clear()
  syncConnectedState(false)
}

export const parseSSEData = <T>(event: MessageEvent<string>): T => {
  return JSON.parse(event.data) as T
}

/**
 * SSE函数
 */
export function useSSE() {
  const isConnected = ref(false)
  connectedRefs.add(isConnected)

  /**
   * 连接SSE接口
   */
  const connect = (): void => {
    connectionCount += 1

    if (globalEventSource) {
      syncConnectedState(globalEventSource.readyState === EventSource.OPEN)
      return
    }

    void createEventSource()
  }

  /**
   * 断开SSE连接
   */
  const disconnect = (): void => {
    connectionCount = Math.max(0, connectionCount - 1)

    if (connectionCount === 0) {
      resetGlobalState()
    }

    connectedRefs.delete(isConnected)
  }

  /**
   * 监听某个 SSE 事件
   *
   * @param eventName 事件名
   * @param handler 事件发生时的回调函数，回调函数参数是原始的 MessageEvent
   */
  const on = (eventName: string, handler: EventHandler): UnsubscribeFunction => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set<EventHandler>())
    }

    eventHandlers.get(eventName)?.add(handler)

    if (globalEventSource) {
      bindEventListener(eventName)
    }

    // 向后端发起订阅
    sseApi.subscribe(eventName).then(() => {
      console.log(`订阅${eventName}成功`)
    })
    return (): void => {
      off(eventName, handler)
    }
  }

  const off = (eventName: string, handler: EventHandler): void => {
    const handlers = eventHandlers.get(eventName)
    if (!handlers) {
      return
    }

    handlers.delete(handler)
    if (handlers.size > 0) {
      return
    }

    eventHandlers.delete(eventName)

    const listener = domEventListeners.get(eventName)
    if (listener && globalEventSource) {
      globalEventSource.removeEventListener(eventName, listener)
    }
    domEventListeners.delete(eventName)

    // 向后端取消订阅
    sseApi.unSubscribe(eventName).then(() => {
      console.log(`取消订阅${eventName}成功`)
    })
  }

  /**
   * 业务注册自己感兴趣的事件
   *
   * <p>subscribe函数返回UnsubscribeFunction，表示反注册函数，调用UnsubscribeFunction，可以取消注册<p/>
   * <p>基于 {@link on} 函数实现<p/>
   *
   * @param eventName 事件名称
   * @param handler 事件发生时的回调函数，回调函数参数是解析后的业务数据 payload
   *
   * @return 反注册函数
   */
  const subscribe = <T>(
    eventName: string,
    handler: (payload: T, event: MessageEvent<string>) => void,
  ): UnsubscribeFunction => {
    return on(eventName, (event) => {
      handler(parseSSEData<T>(event), event)
    })
  }

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
    subscribe,
  }
}
