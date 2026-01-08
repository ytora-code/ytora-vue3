<script setup lang="ts">
import AppProvider from '@/components/provider/AppProvider.vue'
import GlobalContextMenu from '@/components/contextmenu/GlobalContextMenu.vue'
import { setupGlobalContextMenu } from '@/utils/contextMenuHandler'

onMounted(() => {
  // 全局监听右键点击
  setupGlobalContextMenu()
})
</script>

<template>
  <AppProvider>
    <router-view></router-view>
    <GlobalContextMenu />
  </AppProvider>
</template>

<style scoped>

</style>
