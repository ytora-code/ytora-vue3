import { defineStore } from 'pinia'
import { ref } from 'vue'
import $router from '@/router'
import constantRoutes from '@/router/constantRoutes.ts'
import toRoutes from '@/router/toRoutes.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
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
   * 当前用户的拥有的资源
   */
  const permissions = ref<SysPermission[]>()

  /**
   * 更新权限的函数，单独抽取出来作为一个方法，是因为当权限更新时，需要同步更新动态路由
   * @param dynamicPermissions
   */
  const updatePermission = (dynamicPermissions: Array<SysPermission>) => {
    const allPermissions: SysPermission[] = []
    allPermissions.push(...constantRoutes)
    allPermissions.push(...dynamicPermissions)
    permissions.value = allPermissions
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
    permissions,
    updatePermission,
  }
})
