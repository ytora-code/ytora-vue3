import { computed, ref, watch } from 'vue'
import type { VxeGridEvents, VxeGridProps } from 'vxe-table'
import { onlineDatabaseApi } from '../api/OnlineDatabaseApi'
import {
  extractColumnMetas,
  formatCellValue,
  resolveColumnField,
  resolveColumnTypeName,
  resolveColumnTitle,
} from './shared'
import { useOnlineDatabaseObjectMeta } from './useOnlineDatabaseObjectMeta'
import { useOnlineDatabasePageContext } from './useOnlineDatabasePageContext'
import type { OnlineDatabaseRecord } from '../type'

export const useOnlineDatabaseDataTab = () => {
  const { activeTableNode } = useOnlineDatabasePageContext()
  const { objectMeta } = useOnlineDatabaseObjectMeta()

  const gridLoading = ref(false)
  const pageNo = ref(1)
  const pageSize = ref(100)
  const total = ref(0)
  const whereClause = ref('')
  const customPageSize = ref<number | null>(pageSize.value)
  const currentOrderCol = ref<string>()
  const tableRows = ref<OnlineDatabaseRecord[]>([])
  let requestId = 0

  const columnMetas = computed(() => extractColumnMetas(objectMeta.value ?? undefined))

  /**
   * 根据表格列的类型，计算列宽度
   * @param field 字段名称
   * @param typeName 字段类型
   */
  const resolveTableColumnWidth = (field: string, typeName?: string) => {
    const normalizedField = field.trim().toLowerCase()
    const normalizedType = typeName?.trim().toLowerCase() ?? ''

    if (normalizedField === 'id' || normalizedField.endsWith('_id')) {
      return 140
    }

    if (
      normalizedType.includes('timestamp') ||
      normalizedType.includes('datetime') ||
      normalizedType.includes('date') ||
      normalizedType.includes('time')
    ) {
      return 200
    }

    if (
      normalizedType.includes('json') ||
      normalizedType.includes('text') ||
      normalizedType.includes('clob') ||
      normalizedType.includes('blob')
    ) {
      return 240
    }

    if (
      normalizedType.includes('array') ||
      normalizedType.endsWith('[]') ||
      normalizedType.startsWith('_')
    ) {
      return 140
    }

    if (
      normalizedType.includes('char') ||
      normalizedType.includes('varchar') ||
      normalizedType.includes('string')
    ) {
      return 180
    }

    if (normalizedType.includes('bool') || normalizedType === 'bit') {
      return 100
    }

    if (
      normalizedType.includes('int') ||
      normalizedType.includes('number') ||
      normalizedType.includes('decimal') ||
      normalizedType.includes('numeric') ||
      normalizedType.includes('float') ||
      normalizedType.includes('double')
    ) {
      return 120
    }

    return 140
  }

  /**
   * 表格列的属性
   */
  const tableColumns = computed<VxeGridProps<OnlineDatabaseRecord>['columns']>(() => {
    const fieldSet = new Set<string>()
    const orderedFields: string[] = []

    columnMetas.value.forEach((column) => {
      const field = resolveColumnField(column)
      if (field && !fieldSet.has(field)) {
        fieldSet.add(field)
        orderedFields.push(field)
      }
    })

    tableRows.value.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!fieldSet.has(key)) {
          fieldSet.add(key)
          orderedFields.push(key)
        }
      })
    })

    return orderedFields.map((field) => {
      const columnMeta = columnMetas.value.find((item) => resolveColumnField(item) === field)
      const title = resolveColumnTitle(field, columnMeta)
      const typeName = resolveColumnTypeName(columnMeta)

      return {
        field,
        title,
        sortable: true,
        width: resolveTableColumnWidth(field, typeName),
        formatter: ({ cellValue }: { cellValue: unknown }) => formatCellValue(cellValue),
      }
    })
  })

  const loadTableData = async () => {
    const node = activeTableNode.value
    if (!node?.dataSourceName || !node.schemaName || !node.objectName) {
      tableRows.value = []
      total.value = 0
      return
    }

    const currentRequestId = ++requestId
    gridLoading.value = true
    try {
      const result = await onlineDatabaseApi.fetchData(
        {
          ds: node.dataSourceName,
          schema: node.schemaName,
          name: node.objectName,
          where: whereClause.value,
          orderCol: currentOrderCol.value,
        },
        {
          pageNo: pageNo.value,
          pageSize: pageSize.value,
        },
      )

      if (currentRequestId === requestId) {
        tableRows.value = result.records ?? []
        pageNo.value = result.pageNo
        pageSize.value = result.pageSize
        customPageSize.value = result.pageSize
        total.value = result.total ?? 0
      }
    } finally {
      if (currentRequestId === requestId) {
        gridLoading.value = false
      }
    }
  }

  const resetTableState = () => {
    pageNo.value = 1
    pageSize.value = 100
    customPageSize.value = 100
    total.value = 0
    whereClause.value = ''
    currentOrderCol.value = undefined
    tableRows.value = []
  }

  const handleRefresh = async () => {
    pageNo.value = 1
    await loadTableData()
  }

  const handleResetWhere = async () => {
    whereClause.value = ''
    pageNo.value = 1
    await loadTableData()
  }

  const handlePageChange = async (nextPageNo: number) => {
    pageNo.value = nextPageNo
    await loadTableData()
  }

  const handlePageSizeChange = async (nextPageSize: number) => {
    pageNo.value = 1
    pageSize.value = nextPageSize
    customPageSize.value = nextPageSize
    await loadTableData()
  }

  const handleCustomPageSizeApply = async () => {
    const nextPageSize = Number(customPageSize.value)
    if (!Number.isFinite(nextPageSize)) {
      customPageSize.value = pageSize.value
      return
    }

    const normalizedPageSize = Math.max(1, Math.min(5000, Math.trunc(nextPageSize)))
    pageNo.value = 1
    pageSize.value = normalizedPageSize
    customPageSize.value = normalizedPageSize
    await loadTableData()
  }

  const handleSortChange: VxeGridEvents.SortChange<OnlineDatabaseRecord> = async (params) => {
    if (!params.field || !params.order) {
      currentOrderCol.value = undefined
    } else {
      currentOrderCol.value = `${params.field}${params.order === 'asc' ? '↑' : '↓'}`
    }

    pageNo.value = 1
    await loadTableData()
  }

  watch(
    activeTableNode,
    async () => {
      resetTableState()
      await loadTableData()
    },
    { immediate: true },
  )

  return {
    gridLoading,
    handlePageChange,
    handlePageSizeChange,
    handleCustomPageSizeApply,
    handleRefresh,
    handleResetWhere,
    handleSortChange,
    loadTableData,
    pageNo,
    pageSize,
    customPageSize,
    tableColumns,
    tableRows,
    total,
    whereClause,
  }
}
