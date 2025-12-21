<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import { CaretDownOutline } from '@vicons/ionicons5'
import { h, onMounted, ref } from 'vue'
import { renderAsyncIcon } from '@/utils/icon'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'

const userStore = useUserStore()

const menuOptions = ref<MenuOption[]>([])

const collapsed = ref(false)

function expandIcon() {
  return h(NIcon, null, { default: () => h(CaretDownOutline) })
}

const transformPermissionToMenu = (permissions: SysPermission[]): MenuOption[] => {
  return permissions
    .filter((item) => item.visible !== false) // 过滤掉隐藏菜单
    .map((item) => {
      const menuOption: MenuOption = {
        label: item.permissionName,
        key: item.permissionCode, // 或者 item.id
        // 如果有子项，递归调用
        children:
          item.children && item.children.length > 0
            ? transformPermissionToMenu(item.children)
            : undefined,
        // 存储图标（这里可以直接存渲染函数，也可以存字符串等 renderIcon 处理）
        icon: renderAsyncIcon(item.icon),
      }

      //设置路由跳转
      // 同样可以在 render-label 里处理逻辑
      if (item.permissionType === 2 && item.permissionCode) {
        menuOption.label = () =>
          h(
            RouterLink,
            { to: { name: item.permissionCode } },
            { default: () => item.permissionName },
          )
      }

      return menuOption
    })
}

const a: SysPermission[] = [
  {
    id: '1',
    permissionName: '控制台',
    permissionCode: '/login',
    permissionType: 2,
    icon: 'SpeedometerOutline',
    component: '/views/dashboard/index.vue',
    visible: true,
    sort: 1,
  },
  {
    id: '2',
    permissionName: '系统管理',
    permissionCode: '/home',
    permissionType: 1,
    icon: 'SettingsOutline',
    visible: true,
    sort: 2,
    children: [
      {
        id: '3',
        permissionName: '用户管理',
        permissionCode: '/home',
        permissionType: 2,
        icon: 'PeopleOutline',
        component: '/views/rbac/user/index.vue',
        visible: true,
      },
      {
        id: '4',
        permissionName: '角色管理',
        permissionCode: '/home',
        permissionType: 2,
        icon: 'ShieldCheckmarkOutline',
        component: '/views/rbac/role/index.vue',
        visible: true,
      },
      {
        id: '5',
        permissionName: '权限菜单',
        permissionCode: '/home',
        permissionType: 2,
        icon: 'KeyOutline',
        component: '/views/rbac/permission/index.vue',
        visible: true,
      },
    ],
  },
  {
    id: '6',
    permissionName: '内容管理',
    permissionCode: '/home',
    permissionType: 1,
    icon: 'BookOutline',
    visible: true,
    sort: 3,
    children: [
      {
        id: '7',
        permissionName: '文章列表',
        permissionCode: '/home',
        permissionType: 2,
        icon: 'DocumentTextOutline',
        component: '/views/content/article/index.vue',
        visible: true,
      },
    ],
  },
  {
    id: '8',
    permissionName: '隐藏测试',
    permissionCode: '/home',
    permissionType: 2,
    icon: 'EyeOffOutline',
    component: '/views/test/index.vue',
    visible: false,
  },
]

onMounted(async () => {
  try {
    // 转换并赋值给菜单组件
    menuOptions.value = transformPermissionToMenu(a)
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
})
</script>

<template>
  <div h-screen>
    <header flex items-center gap-3 p-3>
      <n-image width="66" height="66" :src="userStore.avatar" />
      <n-gradient-text size="20">{{ userStore.realName }}</n-gradient-text>
    </header>

    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :expand-icon="expandIcon"
    />
  </div>
</template>

<style scoped></style>
