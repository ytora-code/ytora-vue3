import type {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  Router,
} from 'vue-router'
import { getCookie } from '@/utils/cookies'
import { useTabsStore } from '@/stores/useTabsStore'
import { useUserStore } from '@/stores/userStore'

/**
 * 注册路由守卫
 */
const setupRouterGuard = (router: Router) => {
  /**
   * 每次路由跳转前，都会回调前置守卫
   * @param to 到哪去
   * @param from 从哪来
   * @param next 调用该回调函数放行路由
   */
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      loadingBar.start()
      const userStore = useUserStore()
      const token = getCookie('Authorization')
      //未登录
      if (!token) {
        //如果要跳转的路由login，直接放行
        if (to.path === '/login') {
          next()
        }
        //否则需要先登录，跳转到登录页面
        else {
          // Message.warning("请先登录")
          next({ path: '/login', query: { redirect: to.path } })
        }
      }

      //已登录
      else {
        //已经登录则不能访问登录页面
        if (to.path === '/login') {
          next({ path: '/home' })
        }
        //访问其他页面时
        else {
          if (!userStore.menus) {
            userStore
              .initUserSession()
              .then((initialized) => {
                if (initialized) {
                  next({ ...to, replace: true })
                  return
                }

                next({ path: '/login', query: { redirect: to.path } })
              })
              .catch((error) => {
                console.log('恢复用户会话失败，跳到登录页面')
                console.log(error)
                next({ path: '/login', query: { redirect: to.path } })
              })

            return
          }

          //没有刷新浏览器，可以放行
          next()
        }
      }
    },
  )

  router.afterEach((to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
    const tabsStore = useTabsStore()
    tabsStore.addVisitedTab(to as RouteLocationNormalizedLoaded)
    if (typeof to.meta.title === 'string') {
      document.title = to.meta.title
    }
    loadingBar.finish()
  })
}

export default setupRouterGuard
