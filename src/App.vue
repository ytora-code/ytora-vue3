<script setup lang="ts">
import { createTheme } from './utils/theme'

const themeOverrides = createTheme('#1890ff')
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view></router-view>
  </n-config-provider>
</template>

<style scoped>
.n-config-provider {
  width: 100%;
  height: 100%;
}
</style>
