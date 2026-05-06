<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { VxeGrid } from 'vxe-table'
import { useOnlineDatabaseDataTab } from '../composable/useOnlineDatabaseDataTab'

const {
  customPageSize,
  gridLoading,
  handleCustomPageSizeApply,
  handlePageChange,
  handlePageSizeChange,
  handleRefresh,
  handleResetWhere,
  handleSortChange,
  pageNo,
  pageSize,
  tableColumns,
  tableRows,
  total,
  whereClause,
} = useOnlineDatabaseDataTab()

const fullscreenContainerRef = ref<{ requestFullscreen: () => Promise<void> } | null>(null)
const isFullscreen = ref(false)
const viewportHeight = ref(window.innerHeight)

const fullscreenButtonText = computed(() => (isFullscreen.value ? '退出全屏' : '全屏'))
const gridHeight = computed(() => {
  const reservedHeight = isFullscreen.value ? 100 : 360
  return Math.max(viewportHeight.value - reservedHeight, 260)
})

const syncFullscreenState = () => {
  isFullscreen.value = document.fullscreenElement === fullscreenContainerRef.value
  viewportHeight.value = window.innerHeight
}

const syncViewportHeight = () => {
  viewportHeight.value = window.innerHeight
}

const toggleFullscreen = async () => {
  const element = fullscreenContainerRef.value
  if (!element) {
    return
  }

  if (document.fullscreenElement === element) {
    await document.exitFullscreen()
    return
  }

  await element.requestFullscreen()
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState)
  window.addEventListener('resize', syncViewportHeight)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  window.removeEventListener('resize', syncViewportHeight)
})
</script>

<template>
  <div ref="fullscreenContainerRef" class="online-db-data-tab">
    <div class="online-db-data-tab__query-bar">
      <n-input
        v-model:value="whereClause"
        placeholder="查询条件"
        clearable
        @keyup.enter="handleRefresh"
      />
      <n-button type="primary" @click="handleRefresh">查询</n-button>
      <n-button @click="handleResetWhere">清空</n-button>
      <n-button :title="fullscreenButtonText" quaternary circle @click="toggleFullscreen">
        <template #icon>
          <span :class="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'" />
        </template>
      </n-button>
    </div>

    <vxe-grid
      size="small"
      class="online-db-data-tab__grid show-scrollbar"
      :columns="tableColumns"
      :data="tableRows"
      border
      round
      stripe
      show-header-overflow="title"
      show-overflow="title"
      :column-config="{ resizable: true }"
      :row-config="{ isHover: true }"
      :sort-config="{ remote: true, trigger: 'cell' }"
      :height="gridHeight"
      :virtual-x-config="{ enabled: true, gt: 10 }"
      :virtual-y-config="{ enabled: true, gt: 20 }"
      @sort-change="handleSortChange"
    >
      <template #loading>
        <div v-if="gridLoading" class="online-db-data-tab__loading">数据加载中...</div>
      </template>
    </vxe-grid>

    <div class="online-db-data-tab__pagination-bar">
      <div class="online-db-data-tab__page-size-editor">
        <span class="online-db-data-tab__page-size-label">每页</span>
        <n-input-number
          v-model:value="customPageSize"
          :min="1"
          :max="5000"
          :show-button="false"
          size="small"
          placeholder="自定义条数"
          @keyup.enter="handleCustomPageSizeApply"
        />
        <span class="online-db-data-tab__page-size-label">条</span>
        <n-button size="small" @click="handleCustomPageSizeApply">应用</n-button>
      </div>

      <n-pagination
        :page="pageNo"
        :page-size="pageSize"
        :item-count="total"
        :page-slot="5"
        :page-sizes="[50, 100, 200, 500]"
        :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
        show-size-picker
        show-quick-jumper
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.online-db-data-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 4px;
  overflow: hidden;
  background: var(--global-bg-container);
}

.online-db-data-tab__query-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  gap: 12px;
  min-width: 0;
}

.online-db-data-tab__query-bar :deep(.n-input) {
  width: 100%;
  min-width: 0;
}

.online-db-data-tab__grid {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  color: var(--global-text-color);
  background: var(--global-bg-container);
  --vxe-ui-font-color: var(--global-text-color);
  --vxe-ui-font-primary-color: var(--global-color-primary);
  --vxe-ui-font-disabled-color: var(--global-text-color-tertiary);
  --vxe-ui-layout-background-color: var(--global-bg-container);
  --vxe-ui-loading-background-color: color-mix(
    in srgb,
    var(--global-bg-container) 72%,
    transparent
  );
  --vxe-ui-table-header-background-color: var(--global-fill-color);
  --vxe-ui-table-header-font-color: var(--global-text-color);
  --vxe-ui-table-footer-font-color: var(--global-text-color);
  --vxe-ui-table-border-color: var(--global-border-color);
  --vxe-ui-table-row-hover-background-color: color-mix(
    in srgb,
    var(--global-fill-color) 72%,
    var(--global-bg-container)
  );
  --vxe-ui-table-row-striped-background-color: color-mix(
    in srgb,
    var(--global-fill-color) 38%,
    var(--global-bg-container)
  );
  --vxe-ui-table-row-hover-striped-background-color: color-mix(
    in srgb,
    var(--global-fill-color) 78%,
    var(--global-bg-container)
  );
  --vxe-ui-table-row-current-background-color: color-mix(
    in srgb,
    var(--global-color-primary) 16%,
    var(--global-bg-container)
  );
  --vxe-ui-table-row-hover-current-background-color: color-mix(
    in srgb,
    var(--global-color-primary) 22%,
    var(--global-bg-container)
  );
  --vxe-ui-table-column-current-background-color: color-mix(
    in srgb,
    var(--global-color-primary) 12%,
    var(--global-bg-container)
  );
  --vxe-ui-table-column-hover-background-color: color-mix(
    in srgb,
    var(--global-fill-color) 72%,
    var(--global-bg-container)
  );
  --vxe-ui-table-column-hover-current-background-color: color-mix(
    in srgb,
    var(--global-fill-color) 72%,
    var(--global-bg-container)
  );
  --vxe-ui-table-fixed-scrolling-box-shadow-color: rgb(0 0 0 / 0.24);
}

.online-db-data-tab__grid:deep(.vxe-table--body-wrapper),
.online-db-data-tab__grid:deep(.vxe-table--scroll-x-virtual),
.online-db-data-tab__grid:deep(.vxe-table--scroll-y-virtual),
.online-db-data-tab__grid:deep(.vxe-grid--table-wrapper),
.online-db-data-tab__grid:deep(.vxe-grid--table-container) {
  scrollbar-width: auto;
}

.online-db-data-tab__grid:deep(.vxe-table--body-wrapper::-webkit-scrollbar),
.online-db-data-tab__grid:deep(.vxe-table--scroll-x-virtual::-webkit-scrollbar),
.online-db-data-tab__grid:deep(.vxe-table--scroll-y-virtual::-webkit-scrollbar),
.online-db-data-tab__grid:deep(.vxe-grid--table-wrapper::-webkit-scrollbar),
.online-db-data-tab__grid:deep(.vxe-grid--table-container::-webkit-scrollbar) {
  display: block;
  width: 8px;
  height: 8px;
}

.online-db-data-tab__grid:deep(.vxe-table--body-wrapper::-webkit-scrollbar-thumb),
.online-db-data-tab__grid:deep(.vxe-table--scroll-x-virtual::-webkit-scrollbar-thumb),
.online-db-data-tab__grid:deep(.vxe-table--scroll-y-virtual::-webkit-scrollbar-thumb),
.online-db-data-tab__grid:deep(.vxe-grid--table-wrapper::-webkit-scrollbar-thumb),
.online-db-data-tab__grid:deep(.vxe-grid--table-container::-webkit-scrollbar-thumb) {
  background: color-mix(in srgb, var(--global-text-color-tertiary) 68%, transparent);
  border-radius: 999px;
}

.online-db-data-tab__grid:deep(.vxe-table--body-wrapper::-webkit-scrollbar-thumb:hover),
.online-db-data-tab__grid:deep(.vxe-table--scroll-x-virtual::-webkit-scrollbar-thumb:hover),
.online-db-data-tab__grid:deep(.vxe-table--scroll-y-virtual::-webkit-scrollbar-thumb:hover),
.online-db-data-tab__grid:deep(.vxe-grid--table-wrapper::-webkit-scrollbar-thumb:hover),
.online-db-data-tab__grid:deep(.vxe-grid--table-container::-webkit-scrollbar-thumb:hover) {
  background: color-mix(in srgb, var(--global-text-color-secondary) 78%, transparent);
}

.online-db-data-tab__grid:deep(.vxe-table),
.online-db-data-tab__grid:deep(.vxe-table--main-wrapper),
.online-db-data-tab__grid:deep(.vxe-table--header-wrapper),
.online-db-data-tab__grid:deep(.vxe-table--body-wrapper),
.online-db-data-tab__grid:deep(.vxe-table--footer-wrapper) {
  background: var(--global-bg-container);
}

.online-db-data-tab__grid:deep(.vxe-header--column),
.online-db-data-tab__grid:deep(.vxe-body--column),
.online-db-data-tab__grid:deep(.vxe-footer--column) {
  color: var(--global-text-color);
  border-color: var(--global-border-color);
}

.online-db-data-tab__grid:deep(.vxe-cell),
.online-db-data-tab__grid:deep(.vxe-header--column .vxe-cell),
.online-db-data-tab__grid:deep(.vxe-body--column .vxe-cell) {
  color: inherit;
}

.online-db-data-tab__grid:deep(.vxe-table--header-wrapper),
.online-db-data-tab__grid:deep(.vxe-header--gutter),
.online-db-data-tab__grid:deep(.vxe-table--header-border-line) {
  background: var(--global-fill-color);
}

.online-db-data-tab__grid:deep(.vxe-table--border-line) {
  border-color: var(--global-border-color);
}

.online-db-data-tab__pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.online-db-data-tab__page-size-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.online-db-data-tab__page-size-label {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.online-db-data-tab__page-size-editor :deep(.n-input-number) {
  width: 112px;
}

.online-db-data-tab__page-size-editor :deep(.n-input__input-el) {
  text-align: center;
}

.online-db-data-tab__pagination-bar :deep(.n-pagination) {
  min-width: 0;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .online-db-data-tab__pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .online-db-data-tab__page-size-editor {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .online-db-data-tab__page-size-editor {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .online-db-data-tab__page-size-editor :deep(.n-input-number) {
    width: 100%;
  }

  .online-db-data-tab__pagination-bar :deep(.n-pagination) {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .online-db-data-tab__pagination-bar {
    align-items: stretch;
  }

  .online-db-data-tab__pagination-bar :deep(.n-pagination) {
    overflow-x: auto;
  }

  .online-db-data-tab__pagination-bar :deep(.n-pagination .n-pagination-item) {
    flex-shrink: 0;
  }
}

.online-db-data-tab__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  color: var(--global-text-color-tertiary);
  font-size: 13px;
}

@media (max-width: 768px) {
  .online-db-data-tab__query-bar {
    grid-template-columns: 1fr;
  }
}
</style>
