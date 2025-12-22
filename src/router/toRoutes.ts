import type { RouteComponent, RouteRecordRaw } from 'vue-router'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'

/**
 * 将SysPermission对象转为vue-router的RouteRecordRaw对象
 */
const views = import.meta.glob('@/views/**/*.vue')
const layout = import.meta.glob('@/components/**/index.vue')
const viewComponents: Record<string, RouteComponent> = {}
Object.keys(views).forEach((view) => {
  viewComponents[view] = views[view] as RouteComponent
})
Object.keys(layout).forEach((view) => {
  viewComponents[view] = layout[view] as RouteComponent
})

const normalizePath = (path: string) => {
  if (path && !path.startsWith('/')) {
    path = '/' + path
  }
  //移除尾部斜杠
  path = path.trim().replace(/\/+$/, '')
  return path
}

/**
 * 类型谓词,告诉编译器：如果该方法返回true，那么认为SysPermission里面一定有component字段，并且类型是string
 * @param permission
 */
function hasComponent(
  permission: SysPermission,
): permission is SysPermission & { component: string } {
  return typeof permission.component === 'string' && permission.component.length > 0
}

const toRoutes = (permissions: SysPermission[]): RouteRecordRaw[] => {
  //permissions为空，或者permissions长度为0，其返回值都是假值，前面!取反就是真值，条件符合，进入if，返回空数组
  if (!permissions?.length) {
    return []
  }
  return (
    permissions
      //过滤掉permission.component为空，并且使用类型谓词将permission.component变成string
      .filter(hasComponent)
      .map((permission) => {
        //找到该路由对应的组件，先根据组件地址在src目录下寻找
        let component = viewComponents[`/src${normalizePath(permission.component)}`]
        //没找到，在根据路由寻找
        if (!component) {
          component =
            viewComponents[`/src/views${normalizePath(permission.permissionCode)}/index.vue`]
        }
        //没找到，则直接使用组件地址
        if (!component) {
          component = viewComponents[`${normalizePath(permission.component)}`]
        }
        //还是没找到，则返回默认地址
        if (!component) {
          component = viewComponents['/src/view/404/index.vue']
          //component = viewComponents['/src/layout/index.vue']
        }

        //将permission对象转为route对象
        const routeObj: RouteRecordRaw = {
          //路由名称
          name: normalizePath(permission.permissionCode),
          //路由地址
          path: normalizePath(permission.permissionCode),
          //该路由对应的组件
          component,
          //子路由
          children: permission.children ? toRoutes(permission.children) : [],
          meta: {
            title: permission.permissionName,
            hidden: !permission.visible,
          },
        }
        //重定向
        if (permission.redirect) {
          routeObj['redirect'] = permission.redirect
        }
        return routeObj
      }) as RouteRecordRaw[]
  )
}

export default toRoutes
