<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
import NaiveApiBridge from './components/NaiveApiBridge.vue'
import { naiveThemeOverrides } from '@/utils/theme'

import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <n-config-provider
    :theme="appStore.naiveTheme"
    :theme-overrides="naiveThemeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <NaiveApiBridge />
            <div
              class="app-root"
              :class="{ 'app-root--dark': appStore.isDark }"
              :style="appStore.appCssVars"
            >
              <router-view />
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style scoped>
.n-config-provider {
  width: 100%;
  height: 100%;
}

.app-root {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  color: var(--global-text-color);
  color-scheme: light;
  background: var(--global-bg-color);
  transition:
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration);
}

.app-root--dark {
  color-scheme: dark;
}
</style>
