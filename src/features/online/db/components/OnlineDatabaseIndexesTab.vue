<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { extractIndexMetas, resolveIndexColumnsText } from '../composable/shared'
import { useOnlineDatabaseObjectMeta } from '../composable/useOnlineDatabaseObjectMeta'

const { loading, objectMeta } = useOnlineDatabaseObjectMeta()
const rootRef = ref(null)

const columns: DataTableColumns<Record<string, unknown>> = [
  { title: '索引名', key: 'name', minWidth: 220 },
  { title: '唯一索引', key: 'uniqueLabel', width: 100 },
  { title: '字段', key: 'columnsText', minWidth: 240 },
]

const rows = computed(() =>
  extractIndexMetas(objectMeta.value ?? undefined).map((meta) => ({
    name: meta.name ?? '-',
    uniqueLabel: meta.unique === true ? '是' : '否',
    columnsText: resolveIndexColumnsText(meta),
  })),
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
