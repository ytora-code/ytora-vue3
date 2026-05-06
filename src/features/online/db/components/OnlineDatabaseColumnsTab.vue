<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import {
  extractColumnMetas,
  extractPrimaryKeys,
  resolveColumnComment,
  resolveColumnField,
  resolveColumnTypeName,
} from '../composable/shared'
import { useOnlineDatabaseObjectMeta } from '../composable/useOnlineDatabaseObjectMeta'
import type { OnlineDatabaseColumnMeta } from '../type'

const { loading, objectMeta } = useOnlineDatabaseObjectMeta()
const rootRef = ref(null)
const summaryRef = ref(null)

const primaryKeys = computed(() => extractPrimaryKeys(objectMeta.value ?? undefined))
const columnMetas = computed(() => extractColumnMetas(objectMeta.value ?? undefined))

const columns: DataTableColumns<Record<string, unknown>> = [
  { title: '#', key: 'ordinalPosition', width: 72 },
  { title: '字段名', key: 'columnName', minWidth: 180 },
  { title: '注释', key: 'comment', minWidth: 180 },
  { title: '数据库类型', key: 'typeName', minWidth: 140 },
  { title: '长度', key: 'columnLength', width: 90 },
  { title: '默认值', key: 'defaultValue', minWidth: 140 },
  { title: '自增', key: 'autoIncrementLabel', width: 90 },
  { title: '主键', key: 'primaryKeyLabel', width: 90 },
  { title: '可空', key: 'nullableLabel', width: 90 },
]

const rows = computed(() =>
  columnMetas.value.map((column: OnlineDatabaseColumnMeta) => ({
    ordinalPosition: column.ordinalPosition ?? '-',
    columnName: resolveColumnField(column) || '-',
    comment: resolveColumnComment(column) || '-',
    typeName: resolveColumnTypeName(column) || '-',
    columnLength: column.columnLength ?? '-',
    defaultValue: column.defaultValue ?? '-',
    autoIncrementLabel:
      column.autoIncrement === true ? '是' : column.autoIncrement === false ? '否' : '-',
    primaryKeyLabel:
      column.primaryKey === true
        ? '是'
        : primaryKeys.value.includes(resolveColumnField(column))
          ? '是'
          : '否',
    nullableLabel: column.nullable === true ? '是' : column.nullable === false ? '否' : '-',
  })),
)
</script>

<template>
  <div ref="rootRef" class="online-db-meta-tab">
    <span ref="summaryRef" class="online-db-meta-tab__summary">{{ objectMeta?.comment }}</span>
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
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.online-db-meta-tab__summary {
  color: var(--global-text-color-tertiary);
  font-size: 14px;
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
