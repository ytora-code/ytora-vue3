import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'

const login: SysPermission = {
  id: '1',
  pid: '0',
  permissionCode: '/login',
  permissionName: '登录',
  permissionType: 2,
  component: '/components/login/index.vue',
  visible: false,
  icon: '',
  children: [],
  sort: 1,
}

const home: SysPermission = {
  id: '2',
  pid: '0',
  permissionCode: '/',
  permissionName: '布局',
  permissionType: 2,
  component: '/components/layout/index.vue',
  redirect: '/home',
  visible: true,
  icon: 'home',
  sort: 1,
  children: [
    {
      id: '3',
      pid: '2',
      permissionCode: '/home',
      permissionName: '首页',
      permissionType: 2,
      component: '/view/home/index.vue',
      visible: true,
      icon: 'Avatar',
      sort: 1,
      children: [],
    },
  ],
}

/**
 * 防止控制台报警告：No match found for location with path "xxx"
 */
const notFound: SysPermission = {
  id: '4',
  pid: '0',
  permissionCode: '/:catchAll(.*)',
  permissionName: '404',
  permissionType: 2,
  component: '/layouts/404/index.vue',
  visible: false,
  children: [],
}

const constantRoutes: SysPermission[] = [
  login,
  home,
  //notFound
]

export default constantRoutes
