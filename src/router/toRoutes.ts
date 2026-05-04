import type { RouteComponent, RouteRecordRaw } from 'vue-router'

import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

/**
 * 将 SysPermission 转为 vue-router 的路由对象。
 *
 * - 静态路由：保留原始嵌套结构，用于注册根布局和登录页
 * - 动态业务路由：只提取叶子节点，统一挂到根布局下
 */
const featureViews = import.meta.glob('@/features/**/*.vue')
const layoutViews = import.meta.glob('@/components/layouts/**/index.vue')
const loginViews = import.meta.glob('@/components/login/**/index.vue')

const viewComponents: Record<string, RouteComponent> = {}

Object.keys(featureViews).forEach((view) => {
  viewComponents[view] = featureViews[view] as RouteComponent
})

Object.keys(layoutViews).forEach((view) => {
  viewComponents[view] = layoutViews[view] as RouteComponent
})

Object.keys(loginViews).forEach((view) => {
  viewComponents[view] = loginViews[view] as RouteComponent
})

const normalizePath = (path: string) => {
  if (!path) return '/'

  let normalizedPath = path.trim()
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`
  }

  normalizedPath = normalizedPath.replace(/\/+$/, '')
  return normalizedPath || '/'
}

const hasComponent = (
  permission: SysPermissionData,
): permission is SysPermissionData & { component: string } => {
  return typeof permission.component === 'string' && permission.component.length > 0
}

const resolveComponent = (permission: SysPermissionData): RouteComponent | undefined => {
  if (!hasComponent(permission)) return undefined

  const normalizedComponentPath = normalizePath(permission.component)

  let component = viewComponents[`/src${normalizedComponentPath}`]

  if (!component) {
    component = viewComponents[`/src/features${normalizePath(permission.permissionCode)}/index.vue`]
  }

  if (!component) {
    component = viewComponents[normalizedComponentPath]
  }

  // 还是没找到，则返回默认地址
  if (!component) {
    component = viewComponents['/src/features/404/index.vue']
    // component = viewComponents['/src/components/layouts/index.vue']
  }

  return component
}

const createRouteRecord = (permission: SysPermissionData): RouteRecordRaw | null => {
  const component = resolveComponent(permission)
  if (!component) return null

  return {
    name: normalizePath(permission.permissionCode),
    path: normalizePath(permission.permissionCode),
    component,
    children: [],
    meta: {
      title: permission.permissionName,
      hidden: !permission.visible,
    },
    ...(permission.redirect ? { redirect: normalizePath(permission.redirect) } : {}),
  }
}

const createNestedRoutes = (permissions: SysPermissionData[]): RouteRecordRaw[] => {
  return permissions.filter(hasComponent).map((permission) => {
    const component = resolveComponent(permission)

    const route: RouteRecordRaw = {
      name: normalizePath(permission.permissionCode),
      path: normalizePath(permission.permissionCode),
      component,
      children: permission.children ? createNestedRoutes(permission.children) : [],
      meta: {
        title: permission.permissionName,
        hidden: !permission.visible,
      },
      ...(permission.redirect ? { redirect: normalizePath(permission.redirect) } : {}),
    }

    return route
  }) as RouteRecordRaw[]
}

const isLeafPermission = (permission: SysPermissionData) => {
  return !permission.children || permission.children.length === 0
}

const flattenLeafRoutes = (permissions: SysPermissionData[], routes: RouteRecordRaw[] = []) => {
  permissions.forEach((permission) => {
    if (isLeafPermission(permission)) {
      const route = createRouteRecord(permission)
      if (route) {
        routes.push(route)
      }
    }

    if (permission.children?.length) {
      flattenLeafRoutes(permission.children, routes)
    }
  })

  return routes
}

interface ToRoutesOptions {
  flatten?: boolean
}

const toRoutes = (
  permissions: SysPermissionData[],
  options: ToRoutesOptions = {},
): RouteRecordRaw[] => {
  if (!permissions?.length) {
    return []
  }

  if (!options.flatten) {
    return createNestedRoutes(permissions)
  }

  return flattenLeafRoutes(permissions).filter((route, index, routeArr) => {
    return routeArr.findIndex((item) => item.path === route.path) === index
  })
}

export { normalizePath }
export default toRoutes
