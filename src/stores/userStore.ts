import { defineStore } from 'pinia'
import $router from '@/router'
import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import constantRoutes from '@/router/constantRoutes'
import toRoutes from '@/router/toRoutes'
import loginApi from '@/components/login/api/LoginApi'
import { getCookie, removeCookie } from '@/utils/cookies'

/**
 * 用户登录状态 store
 */
export const useUserStore = defineStore('user', () => {
  let initUserSessionPromise: Promise<boolean> | null = null

  /**
   * 用户ID
   */
  const id = ref('')
  /**
   * 用户名
   */
  const userName = ref('李小萌')
  /**
   * 真实姓名
   */
  const realName = ref('李小萌')
  /**
   * 头像
   */
  const avatar = ref('/avatar.jpg')
  /**
   * 手机号
   */
  const phone = ref('')
  /**
   * 邮箱
   */
  const email = ref('')
  /**
   * 部门
   */
  const departCode = ref('')
  /**
   * 部门名称
   */
  const departName = ref('')
  /**
   * 用户备注
   */
  const remark = ref('')

  /**
   * 当前用户的拥有的菜单，不能赋予初始值，每次路由跳转通过menus是否为空来判断是否刷新，如果赋予了初始值，那么就无法判断是否刷新了
   */
  const menus = ref<SysPermissionData[]>()
  /**
   * 该用户拥有 TABLE 组件
   */
  const tables = ref<SysPermissionData[]>([])

  /**
   * 该用户拥有 FORM 组件
   */
  const forms = ref<SysPermissionData[]>([])

  /**
   * 同步在线用户信息到 store
   * @param userDetail
   */
  const applyUserDetail = (
    userDetail: Awaited<ReturnType<typeof loginApi.getUserDetailByToken>>,
  ) => {
    id.value = userDetail.id
    userName.value = userDetail.userName
    realName.value = userDetail.realName
    avatar.value = userDetail.avatar
    phone.value = userDetail.phone
    email.value = userDetail.email
    remark.value = userDetail.remark
    departCode.value = userDetail.departCode
    departName.value = userDetail.departName
    updatePermission(userDetail.menus)
  }

  /**
   * 更新权限的函数，单独抽取出来作为一个方法，是因为当权限更新时，需要同步更新动态路由
   * @param dynamicPermissions
   */
  const updatePermission = (dynamicPermissions: Array<SysPermissionData>) => {
    const allPermissions: SysPermissionData[] = []
    allPermissions.push(...constantRoutes)
    allPermissions.push(...dynamicPermissions)
    menus.value = allPermissions
    const routes = toRoutes(dynamicPermissions, { flatten: true })
    // constantRoutes 静态路由已经被注册过了，这里仅需注册动态路由。
    // 动态业务页面统一挂到根布局 / 下，只替换 content 区域。
    if (routes) {
      routes.forEach((route) => {
        if (route.name && $router.hasRoute(route.name)) {
          return
        }
        $router.addRoute('/', route)
      })
    }
  }

  const clearSession = () => {
    id.value = ''
    userName.value = ''
    realName.value = ''
    avatar.value = ''
    phone.value = ''
    email.value = ''
    departCode.value = ''
    departName.value = ''
    remark.value = ''
    menus.value = undefined
    tables.value = []
    forms.value = []
  }

  /**
   * 初始化当前登录用户会话，恢复用户信息并提前注册动态路由
   */
  const initUserSession = async () => {
    if (menus.value) {
      return true
    }

    if (!getCookie('Authorization')) {
      return false
    }

    if (initUserSessionPromise) {
      return initUserSessionPromise
    }

    initUserSessionPromise = loginApi
      .getUserDetailByToken()
      .then((userDetail) => {
        applyUserDetail(userDetail)
        return true
      })
      .catch(async (error) => {
        console.log('授权不通过，清理登录态')
        console.log(error)
        await loginApi.doLogout().catch(() => undefined)
        removeCookie('Authorization')
        clearSession()
        return false
      })
      .finally(() => {
        initUserSessionPromise = null
      })

    return initUserSessionPromise
  }

  return {
    id,
    userName,
    realName,
    avatar,
    phone,
    email,
    departCode,
    departName,
    remark,
    menus,
    tables,
    forms,
    updatePermission,
    clearSession,
    initUserSession,
  }
})
