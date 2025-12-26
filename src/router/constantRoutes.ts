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
  icon: 'HomeOutline',
  sort: 1,
  children: [
    {
      id: '3',
      pid: '2',
      permissionCode: '/home',
      permissionName: '首页',
      permissionType: 2,
      component: '/views/home/index.vue',
      visible: true,
      icon: 'HomeOutline',
      sort: 1,
      children: [],
    },
  ],
}

const constantRoutes: SysPermission[] = [login, home]

export default constantRoutes
