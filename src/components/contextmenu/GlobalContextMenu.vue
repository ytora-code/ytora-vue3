<script setup lang="ts">
import { useContextMenuStore } from '@/stores/useContextMenu.ts'
import type { MenuKey } from '@/types/ContextMenu.ts'

const store = useContextMenuStore()

const handleSelect = (key: MenuKey) => {
  store.show = false
  if (store.currentHandler) {
    store.currentHandler(key)
  }
}
</script>

<template>
  <n-dropdown
    :animated="false"
    placement="bottom-start"
    trigger="manual"
    :x="store.x"
    :y="store.y"
    :options="store.options"
    :show="store.show"
    :on-clickoutside="store.closeMenu"
    @select="handleSelect"
  />
</template>

<style scoped>

</style>
