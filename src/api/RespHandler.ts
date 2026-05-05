import type Result from '@/types/Result'
import type { Router } from 'vue-router'
import { removeCookie } from '@/utils/cookies'
import { nextTick } from 'vue'

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

const handleAuthExpired = async (messageText?: string) => {
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

/**
 * 因为存在约定，所以对应一般的请求，接口返回值肯定是CommonResponse类型(例外：文件下载接口)
 * 所以可以在这里根据CommonResponse的字段对返回值进行统一处理
 * 统一处理后，剔除通用参数(success、code、msg...)，将真正的数据data包装成Promise返回，再由调用方进行进一步处理
 * async修饰的函数，会将返回封装一层Promise
 */
const RespHandler = async <R = unknown>(result: Result<R>): Promise<R> => {
  //只有当code为0，才是请求成功
  if (result.code === 0) {
    //弹出正常提示
    if (result.message) {
      notification.success({ title: result.message, duration: 3000 })
    }
    return result.data
  }

  //除此之外的其他情况都视为请求失败
  else {
    // 响应码 10/11 表示需要重新登录，这类情况走统一的失效登录处理。
    if (result.code === 10 || result.code === 11) {
      await handleAuthExpired(result.message)
    } else {
      notification.error({
        title: result.message ?? '🍉',
        duration: 3000,
        keepAliveOnHover: true,
      })
    }

    return Promise.reject(new Error(result.message))
  }
}

export default RespHandler
