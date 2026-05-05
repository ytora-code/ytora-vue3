import type { Router } from 'vue-router'
import { useSSE } from '@/features/monitor/sse/composable/useSSE'
import { useTabsStore } from '@/stores/useTabsStore'
import { useUserStore } from '@/stores/userStore'
import { removeCookie } from '@/utils/cookies'

const { connect, disconnect, subscribe } = useSSE()

let logoutUnsubscribe: (() => void) | null = null
let activeRouter: Router | null = null

const cleanupLogoutListener = () => {
  logoutUnsubscribe?.()
  logoutUnsubscribe = null
  disconnect()
}

const handleForcedLogout = async (logoutReason: string) => {
  cleanupLogoutListener()

  removeCookie('Authorization')
  useUserStore().clearSession()
  useTabsStore().removeAllTabs()

  window.setTimeout(() => {
    notification.warning({
      title: logoutReason || '当前登录已失效，已为你退出登录',
      duration: 3000,
    })
  }, 0)

  if (activeRouter) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 250)
    })
    await activeRouter.replace('/login')
  }
}

export const ensureSessionLogoutSSE = (router: Router) => {
  activeRouter = router

  if (logoutUnsubscribe) {
    return
  }

  connect()
  logoutUnsubscribe = subscribe<string>('logout', async (payload) => {
    await handleForcedLogout(payload)
  })
}

export const teardownSessionLogoutSSE = () => {
  cleanupLogoutListener()
  activeRouter = null
}
