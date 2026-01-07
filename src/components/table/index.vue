<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, h } from 'vue'
import { type DataTableColumn, NDataTable, type PaginationInfo } from 'naive-ui'
import CellRenderer from './ComponentCellRenderer.vue'
import type TableColumn from './type/TableColumn.ts'
import { useUserStore } from '@/stores/userStore.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'

const props = withDefaults(defineProps<{
  tableCode: string
  exclude?: string[]
  colCallback?: (columnArr: DataTableColumn<T>[]) => DataTableColumn<T>[]
  data?: T[]
  pageNo?: number
  pageSize?: number
  total?: number
}>(), { colCallback: (columnArr: DataTableColumn<T>[]) => columnArr })

const emit = defineEmits<{
  (e: 'onAction', payload: { eventKey: string; row: T }): void

  (e: 'pageChange', pageNo: number, pageSize: number): void
}>()

/**
 * 定义插槽
 */
defineSlots<
  Record<string, (props: { row: T; column: TableColumn; child: TableColumn }) => unknown>
>()

const slots = useSlots()

const userStore = useUserStore()
// const attrs = useAttrs()

/**
 * 递归转换权限树为自定义列配置
 */
const convertPermissionToColumn = (permissions: SysPermission[] | undefined): TableColumn[] => {
  if (!permissions) return []
  return permissions.map(
    (item): TableColumn => ({
      id: item.id,
      colType: (item.meta?.type as string) || '',
      key: (item.meta?.key as string) || item.permissionCode,
      width: (item.meta?.width as number) || 100,
      name: item.permissionName,
      permissionCode: item.permissionCode,
      attr: (item.meta?.attr as Record<string, unknown>) || {},
      children: convertPermissionToColumn(item.children)
    })
  )
}

/**
 * 计算 Naive UI 所需的 columns
 */
const columns = computed(() => {
  const components = userStore.components
  if (!components) return []
  const tableRoot = components.find((c) => c.permissionCode === props.tableCode)

  if (!tableRoot?.children) return []

  // 显式声明数组类型，解决 Computed Overload 报错
  const columns: DataTableColumn<T>[] = tableRoot.children
    .filter((item) => !!item.meta?.type)
    .filter((item) => {
      if (props.exclude) {
        if (props.exclude.includes(item.permissionCode)) {
          return false
        }
      }
      return true
    })
    .map((item): DataTableColumn<T> => {
      const type = item.meta?.type as string
      const colKey = (item.meta?.key as string) || item.permissionCode
      const meta = item.meta || {}
      const attr = (meta.attr as Record<string, unknown>) || {}

      const baseCol = {
        title: item.permissionName,
        key: colKey,
        align: (attr.align as 'left' | 'center' | 'right') || 'center',
        width: (meta.width as number) || 80,
        fixed: attr.fixed as 'left' | 'right' | undefined
      }

      // 索引列
      if (type === 'table-col::index') {
        return {
          ...baseCol,
          key: 'index',
          render: (_row, index) => {
            if (props.pageNo && props.pageSize && props.total) {
              return ((props.pageNo ?? 1) - 1) * (props.pageSize ?? 10) + index + 1
            }
            return index + 1
          }
        }
      }

      // flex列
      if (type === 'table-col::flex') {
        const config: TableColumn = {
          id: item.id,
          colType: 'table-col::flex',
          key: colKey,
          width: baseCol.width!,
          name: item.permissionName,
          permissionCode: item.permissionCode,
          attr: attr,
          children: convertPermissionToColumn(item.children)
        }

        return {
          ...baseCol,
          render(row) {
            return h(CellRenderer<T>, {
              column: config,
              row,
              slots,
              onAction: (payload) => emit('onAction', payload)
            })
          }
        }
      }

      // 普通列
      return {
        ...baseCol,
        ellipsis: attr.ellipsis ? { tooltip: true } : undefined
      }
    })
  return props.colCallback(columns)
})

/**
 * 获取所有列的总宽度
 */
const scrollX = computed(() => {
  // 累加 columns 中定义的每个 width
  return columns.value.reduce((total, col) => {
    return total + (Number(col.width) || 0)
  }, 0)
})

/**
 * 分页数据计算属性
 */
const pagination = computed(() => {
  // 检查是否所有分页参数都已提供
  const isPaginationEnabled = props.pageNo && props.pageSize && props.total
  if (!isPaginationEnabled) return false

  return {
    page: props.pageNo,
    pageSize: props.pageSize,
    itemCount: props.total,
    showSizePicker: true,
    pageSizes: [5, 10, 20, 50],
    showQuickJumper: true,
    // 完善 prefix 展示
    prefix: (info: PaginationInfo) => {
      const totalPage = Math.ceil((info.itemCount || 0) / (info.pageSize || 1))
      return `共 ${info.itemCount} 条记录 / 共 ${totalPage} 页`
    },
    // 当用户点击页码切换时触发
    onChange: (p: number) => {
      emit('pageChange', p, props.pageSize!)
    },
    // 当用户切换每页显示数量时触发
    onUpdatePageSize: (size: number) => {
      // 切换 pageSize 通常需要跳转回第一页
      emit('pageChange', 1, size)
    }
  }
})
</script>

<template>
  <n-card shadow-lg>
    <n-data-table
      remote
      v-bind="$attrs"
      :columns="columns"
      :data="data ?? []"
      :pagination="pagination"
      :scroll-x="scrollX"
      :style="{ minWidth: '80%' }"
    />
  </n-card>
</template>

<style scoped></style>
