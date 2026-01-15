import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'
import { loginApi } from '@/api/LoginApi.ts'
import { getCookie, removeCookie } from '@/utils/cookies.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { createDiscreteApi } from 'naive-ui'
import { defaultTheme } from '@/utils/theme.ts'

const { loadingBar } = createDiscreteApi(['loadingBar'], {
  configProviderProps: {
    themeOverrides: defaultTheme,
  },
})

/**
 * 注册路由守卫
 */
export function setupRouterGuard(router: Router) {
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
          //如果刷新了浏览器，则pinia数据会清空，此时需要重新给获取用户数据并保持到pinia
          if (!userStore.menus) {
            console.log('用户数据被刷新，重新请求授权')
            loginApi
              .getUserDetailByToken()
              .then((userDetail) => {
                userStore.id = userDetail.id
                userStore.userName = userDetail.userName
                userStore.realName = userDetail.realName
                userStore.avatar = userDetail.avatar
                userStore.phone = userDetail.phone
                userStore.email = userDetail.email
                userStore.remark = userDetail.remark
                userStore.roles = userDetail.roles
                userStore.departCode = userDetail.departCode
                userStore.departName = userDetail.departName
                userStore.tables = userDetail.tables
                userStore.forms = userDetail.forms
                userStore.updatePermission(userDetail.menus)

                //next()会造成刷新后白屏
                next({ ...to, replace: true })
              })
              .catch((error) => {
                console.log('授权不通过，跳到登录页面')
                console.log(error)

                //退出，然后跳转到登录页面
                loginApi.logout().finally(() => {
                  removeCookie('Authorization')
                  next({ path: '/login', query: { redirect: to.path } })
                })
              })
          }
          //没有刷新浏览器，可以放行
          else {
            next()
          }
        }
      }
    },
  )

  router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    console.log('来自', from.path)
    if (typeof to.meta.title === 'string') {
      document.title = to.meta.title
    }
    loadingBar.finish()
  })
}
