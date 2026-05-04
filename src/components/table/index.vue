<script setup lang="ts" generic="TRow extends TableRowData = TableRowData">
import { computed, h, ref } from 'vue'
import type { Component } from 'vue'
import {
  NDataTable,
  NEmpty,
  type DataTableColumns,
  type DataTableRowKey,
  type PaginationProps,
} from 'naive-ui'

import ComponentCellRenderer from './ComponentCellRenderer.vue'
import { useTableSchema } from './composable/useTableSchema'
import type DynamicTableSchema from './type/DynamicTableSchema'
import type { DynamicTableSlots } from './type/DynamicTableSlots'
import type ResolvedDynamicTableSchema from './type/ResolvedDynamicTableSchema'
import type { TableRowData, TableRowKeyField } from './type/TableRenderContext'

type TableSize = 'small' | 'medium' | 'large'
type RowKeyResolver = TableRowKeyField<TRow> | ((row: TRow) => DataTableRowKey)

const props = withDefaults(
  defineProps<{
    data?: TRow[]
    schemas?: DynamicTableSchema<TRow>[]
    rowKey?: RowKeyResolver
    checkedRowKeys?: DataTableRowKey[]
    loading?: boolean
    size?: TableSize
    striped?: boolean
    bordered?: boolean
    singleLine?: boolean
    singleColumn?: boolean
    remote?: boolean
    pagination?: false | PaginationProps
    scrollX?: number
    minHeight?: number | string
    maxHeight?: number | string
    minWidth?: number | string
    maxWidth?: number | string
    emptyDescription?: string
  }>(),
  {
    data: () => [],
    schemas: () => [],
    rowKey: () => 'id' as RowKeyResolver,
    checkedRowKeys: () => [],
    loading: false,
    size: 'medium',
    striped: true,
    bordered: false,
    singleLine: false,
    singleColumn: false,
    remote: false,
    pagination: false,
    scrollX: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    emptyDescription: '暂无数据',
  },
)

const emit = defineEmits<{
  (e: 'update:data', value: TRow[]): void
  (e: 'update:checkedRowKeys', value: DataTableRowKey[]): void
  (
    e: 'selection-change',
    payload: {
      checkedRowKeys: DataTableRowKey[]
      checkedRows: TRow[]
    },
  ): void
  (
    e: 'cell-change',
    payload: {
      key: string
      dataKey: string
      value: unknown
      row: TRow
      rowIndex: number
      schema: ResolvedDynamicTableSchema<TRow>
    },
  ): void
  (
    e: 'row-click',
    payload: {
      row: TRow
      rowIndex: number
    },
  ): void
  (e: 'sort-change', value: unknown): void
}>()

const slots = defineSlots<DynamicTableSlots<TRow>>()
const tableRef = ref<{ scrollTo: (options?: unknown) => void } | null>(null)
const isScrollbarVisible = ref(false)

const { resolvedSchemas } = useTableSchema({
  schemas: () => props.schemas,
})

const _minHeight = computed(() => {
  return props.minHeight ?? '210px'
})

const _maxHeight = computed(() => {
  return props.maxHeight ?? 'calc(100vh - 420px)'
})

/*
 * 统一管理行主键的解析逻辑，
 * 让选择、点击事件和行比对都使用同一套标识策略。
 */
const resolveRowKey = (row: TRow): DataTableRowKey => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }

  const value = (row as Record<string, unknown>)[props.rowKey]
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  return JSON.stringify(row)
}

const checkedRows = computed(() => {
  const checkedKeySet = new Set(props.checkedRowKeys)
  return props.data.filter((row) => checkedKeySet.has(resolveRowKey(row)))
})

const containerStyle = computed<Record<string, string>>(() => {
  const nextStyle: Record<string, string> = {}

  for (const [key, value] of Object.entries({
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  })) {
    if (value !== undefined) {
      nextStyle[key] = typeof value === 'number' ? `${value}px` : value
    }
  }

  return nextStyle
})

const updateCellValue = (
  schema: ResolvedDynamicTableSchema<TRow>,
  rowIndex: number,
  value: unknown,
) => {
  if (!schema.dataKey) return

  const currentRow = props.data[rowIndex]
  if (!currentRow) return

  const nextRow = {
    ...currentRow,
    [schema.dataKey]: value,
  }
  const nextData = props.data.map((row, index) => (index === rowIndex ? nextRow : row))

  emit('update:data', nextData)
  emit('cell-change', {
    key: schema.key,
    dataKey: schema.dataKey,
    value,
    row: nextRow,
    rowIndex,
    schema,
  })
}

const getColumnEllipsis = (schema: ResolvedDynamicTableSchema<TRow>) =>
  schema.ellipsis ? { tooltip: true } : false

/*
 * 统一管理单元格真实值的解析逻辑。
 * 每一列都可以通过 valueResolver 自定义真实值，
 * 未提供时再回退到默认的 dataKey/index 取值规则。
 */
const resolveCellValue = (
  schema: ResolvedDynamicTableSchema<TRow>,
  row: TRow,
  rowIndex: number,
) => {
  if (schema.valueResolver) {
    return schema.valueResolver(row, rowIndex, schema)
  }

  if (schema.type === 'index') {
    return (schema.indexStart ?? 1) + rowIndex
  }

  if (!schema.dataKey) return undefined
  return (row as Record<string, unknown>)[schema.dataKey]
}

const buildColumn = (schema: ResolvedDynamicTableSchema<TRow>): unknown => {
  if (schema.type === 'selection') {
    return {
      type: 'selection',
      key: schema.key,
      fixed: schema.fixed,
      width: schema.width ?? 48,
      align: schema.align,
    }
  }

  if (schema.type === 'index') {
    return {
      key: schema.key,
      title: schema.title,
      fixed: schema.fixed,
      width: schema.width ?? 64,
      align: schema.align,
      render: (row: TRow, rowIndex: number) => resolveCellValue(schema, row, rowIndex),
    }
  }

  return {
    key: schema.key,
    title: schema.title,
    fixed: schema.fixed,
    width: schema.width,
    minWidth: schema.minWidth,
    align: schema.align,
    className:
      schema.type === 'image'
        ? ['dynamic-table__image-column', schema.className].filter(Boolean).join(' ')
        : schema.className,
    sorter: schema.sorter ?? false,
    ellipsis: getColumnEllipsis(schema),
    render: (row: TRow, rowIndex: number) =>
      h(
        ComponentCellRenderer as Component,
        {
          row,
          rowIndex,
          schema,
          value: resolveCellValue(schema, row, rowIndex),
          setValue: (value: unknown) => updateCellValue(schema, rowIndex, value),
        },
        slots,
      ),
  }
}

const columns = computed<DataTableColumns<TRow>>(
  () => resolvedSchemas.value.map((schema) => buildColumn(schema)) as DataTableColumns<TRow>,
)

/*
 * 优先使用外部显式传入的 scrollX。
 * 未传入时，根据当前可见列的宽度信息估算表格总宽度，
 * 让大多数场景下的横向滚动由组件内部自动完成。
 */
const mergedScrollX = computed(() => {
  if (props.scrollX !== undefined) {
    return props.scrollX
  }

  const totalWidth = resolvedSchemas.value.reduce((sum, schema) => {
    if (schema.width) return sum + schema.width
    if (schema.minWidth) return sum + schema.minWidth

    if (schema.type === 'selection') return sum + 48
    if (schema.type === 'index') return sum + 64
    if (schema.type === 'switch') return sum + 120
    if (schema.type === 'image') return sum + 88

    return sum + 120
  }, 0)

  return totalWidth > 0 ? totalWidth : undefined
})

const handleCheckedRowKeysUpdate = (keys: DataTableRowKey[]) => {
  emit('update:checkedRowKeys', keys)

  const checkedKeySet = new Set(keys)
  emit('selection-change', {
    checkedRowKeys: keys,
    checkedRows: props.data.filter((row) => checkedKeySet.has(resolveRowKey(row))),
  })
}

const handleSorterUpdate = (sortState: unknown) => {
  emit('sort-change', sortState)
}

const getRowProps = (row: TRow) => {
  const rowIndex = props.data.findIndex((item) => resolveRowKey(item) === resolveRowKey(row))

  return {
    style: 'cursor: pointer;',
    onClick: () => {
      emit('row-click', {
        row,
        rowIndex,
      })
    },
  }
}

const scrollTo = (options?: unknown) => {
  tableRef.value?.scrollTo(options)
}

const getCheckedRows = () => checkedRows.value

defineExpose({
  scrollTo,
  getCheckedRows,
})
</script>

<template>
  <div
    class="dynamic-table"
    :class="{ 'show-scrollbar': isScrollbarVisible }"
    :style="containerStyle"
    @mouseenter="isScrollbarVisible = true"
    @mouseleave="isScrollbarVisible = false"
  >
    <n-data-table
      ref="tableRef"
      class="dynamic-table__inner"
      :columns="columns"
      :data="data"
      :row-key="resolveRowKey"
      :checked-row-keys="checkedRowKeys"
      :loading="loading"
      :size="size"
      :striped="striped"
      :bordered="bordered"
      :single-line="singleLine"
      :single-column="singleColumn"
      :remote="remote"
      :pagination="pagination"
      :scroll-x="mergedScrollX"
      :min-height="_minHeight"
      :max-height="_maxHeight"
      :row-props="getRowProps"
      @update:checked-row-keys="handleCheckedRowKeysUpdate"
      @update:sorter="handleSorterUpdate"
    >
      <template #empty>
        <slot name="empty">
          <n-empty :description="emptyDescription" size="small" />
        </slot>
      </template>
    </n-data-table>
  </div>
</template>

<style scoped>
.dynamic-table {
  width: 100%;
  min-width: 0;
}

.dynamic-table__inner {
  width: 100%;
  border: #ededf3 solid 1px;
}

.dynamic-table :deep(.n-data-table-base-table) {
  scrollbar-width: inherit;
}

.dynamic-table__inner :deep(.n-data-table-th),
.dynamic-table__inner :deep(.n-data-table-td) {
  white-space: nowrap;
}

.dynamic-table__inner :deep(.n-data-table-td) {
  vertical-align: middle;
}

/* 图片类型的列需要减小padding，以免行被图片撑得过高 */
.dynamic-table__inner :deep(.dynamic-table__image-column) {
  padding: 3px;
}

@media (max-width: 768px) {
  .dynamic-table__inner :deep(.n-data-table-table) {
    min-width: 100%;
  }
}
</style>
