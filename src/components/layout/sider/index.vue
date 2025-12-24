<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { h, onMounted, ref } from 'vue'
import { renderAsyncIcon } from '@/utils/icon'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore.ts'

const userStore = useUserStore()

const menuOptions = ref<MenuOption[]>([])

defineProps<{
  collapsed: boolean
}>()

const transformPermissionToMenu = (permissions: SysPermission[] | undefined): MenuOption[] => {
  if (!permissions) {
    return []
  }
  // 1. 先过滤掉不可见的
  const visibleItems = permissions.filter((item) => item.visible !== false)

  const result: MenuOption[] = []

  visibleItems.forEach((item) => {
    // 获取当前项的可见子项
    const visibleChildren = item.children?.filter((c) => c.visible !== false) || []

    // 如果菜单只有一个子菜单
    if (visibleChildren.length === 1) {
      // 如果只有一个子项，递归处理这个子项，并将其结果直接放入当前层级
      // 注意：这里用 spread (...) 是因为递归可能返回数组
      result.push(...transformPermissionToMenu(visibleChildren))
      return // 跳过当前父级的渲染
    }

    // 0个或多个子菜单
    const menuOption: MenuOption = {
      label: item.permissionName,
      key: item.permissionCode,
      icon: renderAsyncIcon(item.icon),
      children: visibleChildren.length > 0 ? transformPermissionToMenu(visibleChildren) : undefined,
    }

    // 设置路由跳转 (通常只有叶子节点需要 RouterLink)
    // 只要没有子菜单了，就加上跳转
    if (item.permissionType === 2 && item.permissionCode && visibleChildren.length === 0) {
      menuOption.label = () =>
        h(RouterLink, { to: item.permissionCode }, { default: () => item.permissionName })
    }

    result.push(menuOption)
  })

  return result
}

onMounted(async () => {
  try {
    // 转换并赋值给菜单组件
    menuOptions.value = transformPermissionToMenu(userStore.permissions)
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
})
</script>

<template>
  <n-scrollbar h-screen>
    <header flex items-center gap-3 p-3>
      <n-image width="64" height="64" :src="userStore.avatar" />
      <n-gradient-text size="20">{{ userStore.realName }}</n-gradient-text>
    </header>

    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </n-scrollbar>

</template>

<style scoped></style>
