<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { renderAsyncIcon } from '@/utils/icon'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import { useUserStore } from '@/stores/userStore.ts'

/**
 * 定义一个极简的接口用于路径搜索。
 * 作用：绕过 Naive UI 复杂的 MenuOption 类型，解决 "Type instantiation is excessively deep" 报错，
 * 同时满足 Lint 不使用 any 的要求
 */
interface MenuSkeleton {
  key?: string | number
  children?: MenuSkeleton[]
}

const userStore = useUserStore()
const route = useRoute()

// 侧边栏属性
defineProps<{
  collapsed: boolean
}>()

// 菜单数据源
const menuOptions = ref<MenuOption[]>([])

// 当前选中的菜单项 Key (基于当前路由路径)
const activeKey = computed(() => route.path as string)

// 当前展开的父菜单 Key 数组
const expandedKeys = ref<string[]>([])

/**
 * 递归寻找目标 key 的所有父级 key
 */
const getParentKeys = (targetKey: string, options: MenuSkeleton[]): string[] => {
  const parents: string[] = []

  const find = (nodes: MenuSkeleton[], path: string[]): boolean => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        parents.push(...path)
        return true
      }
      if (node.children && node.children.length > 0) {
        // 将当前 key 加入路径并继续向下寻找
        if (find(node.children, [...path, String(node.key)])) return true
      }
    }
    return false
  }

  find(options, [])
  return parents
}

/**
 * 根据当前路由同步菜单的展开状态
 */
const syncMenuState = () => {
  if (menuOptions.value.length > 0) {
    // 使用类型断言 'as MenuSkeleton[]' 避开深度类型检查
    const parents = getParentKeys(route.path, menuOptions.value as MenuSkeleton[])
    // 合并已展开的 Key 并去重
    expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...parents]))
  }
}

/**
 * 将权限列表转换为 Naive UI 菜单格式
 */
const transformPermissionToMenu = (permissions: SysPermission[] | undefined): MenuOption[] => {
  if (!permissions) return []

  const visibleItems = permissions.filter((item) => item.visible !== false)
  const result: MenuOption[] = []

  visibleItems.forEach((item) => {
    const visibleChildren = item.children?.filter((c) => c.visible !== false) || []

    // 业务逻辑：如果只有一个子项，则直接平铺子项（不渲染父级）
    if (visibleChildren.length === 1) {
      result.push(...transformPermissionToMenu(visibleChildren))
      return
    }

    const menuOption: MenuOption = {
      label: item.permissionName,
      key: item.permissionCode, // 这里的 code 需与路由 path 一致
      icon: renderAsyncIcon(item.icon),
      children: visibleChildren.length > 0 ? transformPermissionToMenu(visibleChildren) : undefined,
    }

    // 设置路由跳转：通常仅叶子节点或特定类型的菜单需要跳转
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
    // 1. 初始化菜单树
    menuOptions.value = transformPermissionToMenu(userStore.permissions)
    // 2. 初始加载时，根据当前 URL 定位并展开菜单
    syncMenuState()
  } catch (error) {
    console.error('加载菜单失败:', error)
  }
})

// 监听路由变化，页面内点击跳转时，侧边栏自动展开
watch(
  () => route.path,
  () => {
    syncMenuState()
  },
)
</script>

<template>
  <n-scrollbar h-screen>
    <header flex items-center gap-3 p-3>
      <n-image width="64" height="64" :src="userStore.avatar" />
      <n-gradient-text v-if="!collapsed" size="20" font-bold>{{
        userStore.realName
      }}</n-gradient-text>
    </header>

    <n-menu
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="activeKey"
      v-model:expanded-keys="expandedKeys"
    />
  </n-scrollbar>
</template>

<style scoped></style>
