<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import AppLogo from '@/components/layouts/sider/AppLogo.vue'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/userStore'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'

interface MenuSkeleton {
  key?: string | number
  children?: MenuSkeleton[]
}

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()

const menuOptions = ref<MenuOption[]>([])
const activeKey = computed(() => route.path)
const expandedKeys = ref<string[]>([])

const getParentKeys = (targetKey: string, options: MenuSkeleton[]): string[] => {
  const parents: string[] = []

  const find = (nodes: MenuSkeleton[], path: string[]): boolean => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        parents.push(...path)
        return true
      }

      if (node.children?.length) {
        const currentPath = node.key === undefined ? path : [...path, String(node.key)]
        if (find(node.children, currentPath)) return true
      }
    }

    return false
  }

  find(options, [])
  return parents
}

const syncMenuState = () => {
  if (!menuOptions.value.length || appStore.sidebarCollapsed) return

  const parents = getParentKeys(route.path, menuOptions.value as MenuSkeleton[])
  expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...parents]))
}

const transformPermissionToMenu = (permissions: SysPermissionData[] | undefined): MenuOption[] => {
  if (!permissions) return []

  return permissions
    .filter((item) => item.visible !== false && item.permissionType === 2)
    .flatMap((item) => {
      const visibleChildren = item.children?.filter((child) => child.visible !== false) || []

      if (visibleChildren.length === 1) {
        return transformPermissionToMenu(visibleChildren)
      }

      const menuOption: MenuOption = {
        label: item.permissionName,
        key: item.permissionCode,
        icon: renderIcon(item.icon),
        children: visibleChildren.length ? transformPermissionToMenu(visibleChildren) : undefined,
      }

      if (item.permissionCode && !visibleChildren.length) {
        menuOption.label = () =>
          h(RouterLink, { to: item.permissionCode }, { default: () => item.permissionName })
      }

      return [menuOption]
    })
}

onMounted(() => {
  menuOptions.value = transformPermissionToMenu(userStore.menus)
  syncMenuState()
})

watch(
  () => route.path,
  () => {
    syncMenuState()
  },
)

watch(
  () => userStore.menus,
  (menus) => {
    menuOptions.value = transformPermissionToMenu(menus)
    syncMenuState()
  },
)
</script>

<template>
  <div class="layout-sider">
    <AppLogo :collapsed="appStore.sidebarCollapsed" />

    <n-scrollbar class="layout-sider__menu">
      <n-menu
        v-model:expanded-keys="expandedKeys"
        :collapsed="appStore.sidebarCollapsed"
        :collapsed-width="appStore.layout.sidebarCollapsedWidth"
        :collapsed-icon-size="appStore.layout.sidebarMenuIconSize"
        :options="menuOptions"
        :value="activeKey"
      />
    </n-scrollbar>
  </div>
</template>

<style scoped>
.layout-sider {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--global-bg-sider);
  transition:
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration);
}

.layout-sider__menu {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 8px 12px;
}

.layout-sider :deep(.app-logo) {
  border-bottom: 1px solid var(--global-border-color);
}

.layout-sider :deep(.n-menu .n-menu-item-content) {
  margin: 2px 0;
  border-radius: var(--global-border-radius);
}

.layout-sider :deep(.n-menu .n-menu-item-content::before) {
  border-radius: var(--global-border-radius);
}
</style>
