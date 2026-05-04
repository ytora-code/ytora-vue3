<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    showSearch?: boolean
    showToolbar?: boolean
    showTable?: boolean
    showPagination?: boolean
    sectionPadding?: number
    compact?: boolean
  }>(),
  {
    showSearch: true,
    showToolbar: true,
    showTable: true,
    showPagination: true,
    sectionPadding: 16,
    compact: false,
  },
)

const containerStyle = computed<Record<string, string>>(() => ({
  '--page-layout-padding': `${props.sectionPadding}px`,
}))
</script>

<template>
  <div class="page-layout" :class="{ 'page-layout--compact': compact }" :style="containerStyle">
    <section
      v-if="showSearch && $slots.search"
      class="page-layout__panel page-layout__panel--search"
    >
      <div class="page-layout__section page-layout__section--search">
        <slot name="search" />
      </div>
    </section>

    <section class="page-layout__panel page-layout__panel--content">
      <div
        v-if="showToolbar && $slots.toolbar"
        class="page-layout__section page-layout__section--toolbar"
      >
        <slot name="toolbar" />
      </div>

      <div v-if="showToolbar && $slots.toolbar && showTable" class="page-layout__divider" />

      <div v-if="showTable" class="page-layout__section page-layout__section--table">
        <slot name="table" />
      </div>

      <div v-if="showPagination && $slots.pagination && showTable" class="page-layout__divider" />

      <div
        v-if="showPagination && $slots.pagination"
        class="page-layout__section page-layout__section--pagination"
      >
        <slot name="pagination" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-layout {
  --page-layout-padding: 16px;

  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100%;
}

.page-layout__panel {
  overflow: hidden;
  border: 1px solid var(--global-border-color);
  border-radius: calc(var(--global-border-radius) + 2px);
  background: var(--global-bg-container);
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.04),
    0 10px 24px -20px rgb(15 23 42 / 0.1);
  transition:
    border-color var(--global-layout-transition-duration),
    background-color var(--global-layout-transition-duration),
    box-shadow var(--global-layout-transition-duration);
}

.page-layout__section {
  min-width: 0;
  padding: var(--page-layout-padding);
}

.page-layout__section--search {
  padding-bottom: 16px;
}

.page-layout__section--toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  background: color-mix(in srgb, var(--global-fill-color) 26%, var(--global-bg-container));
}

.page-layout__section--table {
  padding-top: 14px;
  padding-bottom: 14px;
  overflow: hidden;
}

.page-layout__section--pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 12px;
  padding-bottom: 12px;
}

.page-layout__divider {
  height: 1px;
  margin: 0 var(--page-layout-padding);
  background: color-mix(in srgb, var(--global-border-color) 86%, transparent);
}

.page-layout--compact .page-layout__section {
  padding: 12px;
}

.page-layout--compact .page-layout__divider {
  margin: 0 12px;
}

@media (max-width: 768px) {
  .page-layout__section {
    padding: 12px;
  }

  .page-layout__divider {
    margin: 0 12px;
  }

  .page-layout__section--toolbar,
  .page-layout__section--pagination {
    justify-content: flex-start;
  }
}
</style>
