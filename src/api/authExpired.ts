import type { Router } from 'vue-router'
import { nextTick } from 'vue'
import { removeCookie } from '@/utils/cookies'

let router: Router | null = null
let isHandlingAuthExpired = false

const buildLoginLocation = (redirectPath?: string) => {
  const loginUrl = new URL('/login', window.location.origin)

  if (redirectPath) {
    loginUrl.searchParams.set('redirect', redirectPath)
  }

  return `${loginUrl.pathname}${loginUrl.search}`
}

const redirectToLogin = async () => {
  if (!router) {
    const routerModule = await import('@/router')
    router = routerModule.default
  }

  const currentPath = router.currentRoute.value.path
  const redirectPath = currentPath === '/login' ? undefined : currentPath

  await nextTick()

  if (router.currentRoute.value.path !== '/login') {
    try {
      await router.replace({
        path: '/login',
        query: redirectPath
          ? {
              redirect: redirectPath,
            }
          : {},
      })
      return
    } catch (error) {
      console.error('路由跳转到登录页失败，准备降级为 location.replace', error)
    }
  }

  window.location.replace(buildLoginLocation(redirectPath))
}

export const handleAuthExpired = async (messageText?: string) => {
  if (isHandlingAuthExpired) {
    return
  }

  isHandlingAuthExpired = true

  try {
    removeCookie('Authorization')

    const [{ useUserStore }, { useTabsStore }, { teardownSessionLogoutSSE }] = await Promise.all([
      import('@/stores/userStore'),
      import('@/stores/useTabsStore'),
      import('@/components/login/composable/useSessionLogoutSSE'),
    ])

    teardownSessionLogoutSSE()
    useUserStore().clearSession()
    useTabsStore().removeAllTabs()

    notification.error({
      title: messageText ?? '登录已失效，请重新登录',
      duration: 3000,
      keepAliveOnHover: true,
    })

    await redirectToLogin()
  } finally {
    isHandlingAuthExpired = false
  }
}
