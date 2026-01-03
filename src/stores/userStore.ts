import { defineStore } from 'pinia'
import { ref } from 'vue'
import $router from '@/router'
import constantRoutes from '@/router/constantRoutes.ts'
import toRoutes from '@/router/toRoutes.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import type SysRole from '@/views/rbac/role/type/resp/SysRole.ts'
export const useUserStore = defineStore('user', () => {
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
   * 角色
   */
  const roles = ref<SysRole[]>([])
  /**
   * 当前用户的拥有的菜单，不能赋予初始值，每次路由跳转通过menus是否为空来判断是否刷新，如果赋予了初始值，那么就无法判断是否刷新了
   */
  const menus = ref<SysPermission[]>()
  /**
   * 该用户拥有页面组件
   */
  const components = ref<SysPermission[]>([])

  /**
   * 更新权限的函数，单独抽取出来作为一个方法，是因为当权限更新时，需要同步更新动态路由
   * @param dynamicPermissions
   */
  const updatePermission = (dynamicPermissions: Array<SysPermission>) => {
    const allPermissions: SysPermission[] = []
    allPermissions.push(...constantRoutes)
    allPermissions.push(...dynamicPermissions)
    menus.value = allPermissions
    const routes = toRoutes(dynamicPermissions)
    //constantRoutes静态路由已经被注册过了，这里仅需注册动态路由
    if (routes) {
      routes.forEach((route) => {
        $router.addRoute(route)
      })
    }
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
    roles,
    menus,
    components,
    updatePermission,
  }
})
