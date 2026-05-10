import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

const login: SysPermissionData = {
  id: '1',
  pid: '0',
  permissionCode: '/login',
  permissionName: '登录',
  permissionType: 2,
  component: '/components/login/index.vue',
  visible: false,
  icon: '',
  children: [],
  index: 1,
}

const home: SysPermissionData = {
  id: '2',
  pid: '0',
  permissionCode: '/',
  permissionName: '布局',
  permissionType: 2,
  component: '/components/layouts/index.vue',
  redirect: '/home',
  visible: true,
  icon: 'i-lucide-house',
  index: 1,
  children: [
    {
      id: '3',
      pid: '2',
      permissionCode: '/home',
      permissionName: '首页',
      permissionType: 2,
      component: '/features/home/index.vue',
      visible: true,
      icon: 'i-lucide-house',
      index: 1,
      children: [],
    },
  ],
}

const guide: SysPermissionData = {
  id: 'online-api-dsl-guide',
    pid: '2',
  permissionCode: '/online/api/dsl-guide',
  permissionName: '动态API DSL 语法说明',
  permissionType: 2,
  component: '/features/online/api/guide/index.vue',
  visible: false,
  icon: '',
  index: 999,
  children: [],
}

const notFound: SysPermissionData = {
  id: '404',
  pid: '0',
  permissionCode: '/:pathMatch(.*)*',
  permissionName: '404',
  permissionType: 2,
  component: '/features/404/index.vue',
  visible: false,
  icon: '',
  index: 999,
  children: [],
}

const constantRoutes: SysPermissionData[] = [login, home, guide, notFound]

export default constantRoutes
