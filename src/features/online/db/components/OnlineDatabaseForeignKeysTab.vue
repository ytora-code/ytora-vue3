<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { extractForeignKeyMetas, mapForeignKeyMetaToRow } from '../composable/shared'
import { useOnlineDatabaseObjectMeta } from '../composable/useOnlineDatabaseObjectMeta'

const { loading, objectMeta } = useOnlineDatabaseObjectMeta()
const rootRef = ref(null)

const columns: DataTableColumns<Record<string, unknown>> = [
  { title: '外键名', key: 'name', minWidth: 180 },
  { title: '当前列', key: 'sourceColumns', minWidth: 180 },
  { title: '引用表', key: 'targetTable', minWidth: 180 },
  { title: '引用列', key: 'targetColumns', minWidth: 180 },
  { title: '更新规则', key: 'updateRule', minWidth: 120 },
  { title: '删除规则', key: 'deleteRule', minWidth: 120 },
]

const rows = computed(() =>
  extractForeignKeyMetas(objectMeta.value ?? undefined).map(mapForeignKeyMetaToRow),
)
</script>

<template>
  <div ref="rootRef" class="online-db-meta-tab">
    <n-spin :show="loading" class="online-db-meta-tab__spin">
      <div class="online-db-meta-tab__body show-scrollbar">
        <n-data-table
          :columns="columns"
          :data="rows"
          :bordered="false"
          max-height="calc(100vh - 320px)"
          size="small"
          striped
        />
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.online-db-meta-tab {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.online-db-meta-tab__spin {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.online-db-meta-tab__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:deep(.online-db-meta-tab__spin .n-spin-content) {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
