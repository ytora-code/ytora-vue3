<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { useLoginCore } from '@/components/login/composable/useLoginCore'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/userStore'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const { doLogout } = useLoginCore()

const isFullscreen = ref(false)

const sidebarIcon = computed(() =>
  appStore.sidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close',
)
const themeIcon = computed(() => (appStore.isDark ? 'i-lucide-sun' : 'i-lucide-moon'))
const fullscreenIcon = computed(() =>
  isFullscreen.value ? 'i-lucide-minimize' : 'i-lucide-maximize',
)
const sidebarTitle = computed(() => (appStore.sidebarCollapsed ? '展开菜单' : '折叠菜单'))
const themeTitle = computed(() => (appStore.isDark ? '浅色主题' : '深色主题'))
const fullscreenTitle = computed(() => (isFullscreen.value ? '退出全屏' : '进入全屏'))
const pageTitle = computed(() => String(route.meta.title || route.name || '首页'))

const userOptions: DropdownOption[] = [
  {
    label: '个人中心',
    key: 'profile',
  },
  {
    label: '消息通知',
    key: 'notification',
  },
  {
    label: '退出登录',
    key: 'logout',
  },
]

const syncFullscreenState = () => {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

const toggleFullscreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }

  await document.documentElement.requestFullscreen()
}

const handleUserOptionSelect = (key: string | number) => {
  if (key === 'logout') {
    dialog.warning({
      title: '退出登录',
      content: '确定退出当前登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await doLogout()
      },
    })
  }
}

onMounted(() => {
  syncFullscreenState()
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})
</script>

<template>
  <div class="layout-header">
    <div class="layout-header__left">
      <n-button quaternary circle :title="sidebarTitle" @click="appStore.toggleSidebar">
        <template #icon>
          <span :class="sidebarIcon" />
        </template>
      </n-button>

      <n-breadcrumb>
        <n-breadcrumb-item>{{ pageTitle }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="layout-header__right">
      <n-button quaternary circle :title="themeTitle" @click="appStore.toggleTheme">
        <template #icon>
          <span :class="themeIcon" />
        </template>
      </n-button>

      <n-button quaternary circle :title="fullscreenTitle" @click="toggleFullscreen">
        <template #icon>
          <span :class="fullscreenIcon" />
        </template>
      </n-button>

      <n-dropdown trigger="click" :options="userOptions" @select="handleUserOptionSelect">
        <button class="layout-header__user" type="button">
          <n-avatar :size="32" :src="userStore.avatar" />
          <span class="layout-header__username">
            {{ userStore.realName || userStore.userName }}
          </span>
          <span class="i-lucide-chevron-down layout-header__chevron" />
        </button>
      </n-dropdown>
    </div>
  </div>
</template>

<style scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  min-width: 0;
  padding: 0 16px;
  background: var(--global-bg-header);
  transition:
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration);
}

.layout-header__left,
.layout-header__right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.layout-header__left {
  gap: 12px;
}

.layout-header__right {
  flex-shrink: 0;
  gap: 8px;
}

.layout-header__user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 10px 0 6px;
  color: var(--global-text-color);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--global-border-radius);
  transition:
    background-color var(--global-layout-transition-duration),
    border-color var(--global-layout-transition-duration);
}

.layout-header__user:hover {
  background: var(--global-fill-color);
  border-color: var(--global-border-color);
}

.layout-header :deep(.n-breadcrumb .n-breadcrumb-item) {
  color: var(--global-text-color-secondary);
  transition: color var(--global-layout-transition-duration);
}

.layout-header__username {
  max-width: 120px;
  overflow: hidden;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout-header__chevron {
  color: var(--global-text-color-tertiary);
  transition: color var(--global-layout-transition-duration);
}
</style>
