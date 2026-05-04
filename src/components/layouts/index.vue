<script setup lang="ts">
import Sider from './sider/index.vue'
import Header from './header/index.vue'
import TagsView from './tags/index.vue'
import Content from './content/index.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <n-layout class="app-layout" has-sider>
    <n-layout-sider
      class="app-sider"
      :collapsed="appStore.sidebarCollapsed"
      bordered
      collapse-mode="width"
      :width="appStore.layout.sidebarWidth"
      :collapsed-width="appStore.layout.sidebarCollapsedWidth"
      @update:collapsed="appStore.setSidebarCollapsed"
    >
      <Sider />
    </n-layout-sider>

    <n-layout class="app-main">
      <n-layout-header class="app-header" bordered>
        <Header />
      </n-layout-header>

      <div class="app-tags">
        <TagsView />
      </div>

      <n-layout-content class="app-content">
        <Content />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
  background: var(--global-bg-color);
  transition:
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration);
}

.app-main,
.app-content {
  --n-color: var(--global-bg-color) !important;

  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--global-bg-color);
  transition: background-color var(--global-layout-transition-duration);
}

.app-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.app-layout :deep(> .n-layout-scroll-container) {
  height: 100%;
  overflow: hidden;
}

.app-main :deep(> .n-layout-scroll-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.app-content {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  box-shadow: var(--global-shadow-content);
  padding: var(--global-page-padding);
}

.app-tags {
  flex: 0 0 48px;
  min-height: 48px;
  overflow: visible;
}

.app-sider {
  --n-border-color: var(--global-border-color) !important;
  --n-color: var(--global-bg-sider) !important;

  z-index: 20;
  height: 100%;
  overflow: hidden;
  background: var(--global-bg-sider);
  box-shadow: var(--global-shadow-sider);
}

.app-header {
  --n-border-color: var(--global-border-color) !important;
  --n-color: var(--global-bg-header) !important;

  z-index: 10;
  flex: 0 0 var(--global-header-height);
  height: var(--global-header-height);
  overflow: hidden;
  background: var(--global-bg-header);
  box-shadow: var(--global-shadow-header);
  backdrop-filter: saturate(180%) blur(8px);
}

.app-sider,
.app-header {
  transition:
    width var(--global-layout-transition-duration),
    min-width var(--global-layout-transition-duration),
    max-width var(--global-layout-transition-duration),
    flex-basis var(--global-layout-transition-duration),
    color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration),
    border-color var(--global-layout-transition-duration),
    box-shadow var(--global-layout-transition-duration);
}

.app-sider :deep(.n-layout-sider-scroll-container) {
  background: var(--global-bg-sider);
  transition: background-color var(--global-layout-transition-duration);
}

.app-header :deep(.n-layout-header__border),
.app-sider :deep(.n-layout-sider__border) {
  background-color: var(--global-border-color);
  transition: background-color var(--global-layout-transition-duration);
}
</style>
