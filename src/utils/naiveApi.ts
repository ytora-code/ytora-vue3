import type { useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui'

type MessageApi = ReturnType<typeof useMessage>
type NotificationApi = ReturnType<typeof useNotification>
type DialogApi = ReturnType<typeof useDialog>
type LoadingBarApi = ReturnType<typeof useLoadingBar>

type NaiveApiStore = {
  message: MessageApi | null
  notification: NotificationApi | null
  dialog: DialogApi | null
  loadingBar: LoadingBarApi | null
}

const naiveApiStore: NaiveApiStore = {
  message: null,
  notification: null,
  dialog: null,
  loadingBar: null,
}

const pendingTasks: Array<() => void> = []

const flushPendingTasks = () => {
  while (pendingTasks.length > 0) {
    pendingTasks.shift()?.()
  }
}

export const registerNaiveApis = (apis: Partial<NaiveApiStore>) => {
  Object.assign(naiveApiStore, apis)
  flushPendingTasks()
}

const createApiProxy = <T extends object>(name: keyof NaiveApiStore): T =>
  new Proxy({} as T, {
    get(_target, propKey) {
      return (...args: unknown[]) => {
        const api = naiveApiStore[name] as Record<PropertyKey, unknown> | null
        const method = api?.[propKey]

        if (typeof method === 'function') {
          return method(...args)
        }

        pendingTasks.push(() => {
          const readyApi = naiveApiStore[name] as Record<PropertyKey, unknown> | null
          const readyMethod = readyApi?.[propKey]
          if (typeof readyMethod === 'function') {
            readyMethod(...args)
          }
        })

        return undefined
      }
    },
  })

export const message = createApiProxy<MessageApi>('message')
export const notification = createApiProxy<NotificationApi>('notification')
export const dialog = createApiProxy<DialogApi>('dialog')
export const loadingBar = createApiProxy<LoadingBarApi>('loadingBar')
