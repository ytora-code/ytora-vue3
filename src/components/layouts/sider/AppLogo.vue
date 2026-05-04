<script setup lang="ts">
import { computed } from 'vue'
import { appConfig } from '@/config/app'

defineProps<{
  collapsed?: boolean
}>()

const appInitial = computed(() => appConfig.name.slice(0, 1).toUpperCase())
</script>

<template>
  <div class="app-logo" :class="{ 'is-collapsed': collapsed }">
    <div class="app-logo__mark-wrap">
      <div class="app-logo__mark">{{ appInitial }}</div>
    </div>
    <span v-if="!collapsed" class="app-logo__name">{{ appConfig.name }}</span>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  flex: 0 0 var(--global-header-height);
  align-items: center;
  height: var(--global-header-height);
  overflow: hidden;
  transition: color var(--global-layout-transition-duration);
}

.app-logo__mark-wrap {
  display: grid;
  flex: 0 0 var(--global-sidebar-collapsed-width);
  width: var(--global-sidebar-collapsed-width);
  height: 100%;
  place-items: center;
}

.app-logo__mark {
  display: grid;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  place-items: center;
  color: #ffffff;
  font-weight: 700;
  background: var(--global-color-primary);
  border-radius: var(--global-border-radius);
}

.app-logo__name {
  min-width: 0;
  max-width: 140px;
  overflow: hidden;
  color: var(--global-text-color);
  font-size: 16px;
  font-weight: 650;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transition:
    max-width var(--global-layout-transition-duration),
    opacity var(--global-layout-transition-duration),
    color var(--global-layout-transition-duration);
}

.app-logo.is-collapsed .app-logo__name {
  max-width: 0;
  opacity: 0;
}
</style>
