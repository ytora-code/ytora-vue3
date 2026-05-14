import { ref, unref, watch, type MaybeRef } from 'vue'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import { message } from '@/utils/naiveApi'
import tableSchemaApi from '@/features/rbac/permission/api/SysTableSchemaApi'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import type SysTableSchemaData from '@/features/rbac/permission/type/SysTableSchemaData'

const useRolePermissionTable = (
  showRef: MaybeRef<boolean>,
  roleIdRef: MaybeRef<string | null>,
  permissionIdRef: MaybeRef<string | null>,
) => {
  const tableLoading = ref(false)
  const tablePageNo = ref(1)
  const tablePageSize = ref(10)
  const tableTotal = ref(0)
  const tableRecords = ref<SysPermissionData[]>([])
  const checkedTableKeys = ref<string[]>([])
  const tableSchemaModalVisible = ref(false)
  const tableSchemaLoading = ref(false)
  const tableSchemaSubmitLoading = ref(false)
  const currentTable = ref<SysPermissionData | null>(null)
  const tableSchemaRecords = ref<SysTableSchemaData[]>([])
  const checkedTableSchemaKeys = ref<string[]>([])

  const tableTableSchemas: DynamicTableSchema<SysPermissionData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '表格名称', key: 'permissionName', dataKey: 'permissionName', minWidth: 160 },
    { title: '表格编码', key: 'permissionCode', dataKey: 'permissionCode', minWidth: 180 },
    { title: '备注', key: 'remark', dataKey: 'remark', minWidth: 180, ellipsis: true },
    { title: '操作', key: 'action', type: 'slot', width: 120, fixed: 'right' },
  ]

  const tableColumnSchemas: DynamicTableSchema<SysTableSchemaData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '标题', key: 'title', dataKey: 'title' },
    { title: '字段 key', key: 'key', dataKey: 'key' },
    { title: '类型', key: 'type', dataKey: 'type' },
  ]

  const loadTables = async () => {
    const show = unref(showRef)
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!show || !roleId || !permissionId) {
      tableRecords.value = []
      checkedTableKeys.value = []
      tableTotal.value = 0
      return
    }

    tableLoading.value = true

    try {
      const [pageData, checkedKeys] = await Promise.all([
        tableSchemaApi.pageTables({
          permissionId,
          pageNo: tablePageNo.value,
          pageSize: tablePageSize.value,
        }),
        tableSchemaApi.listTablesForRole(roleId, permissionId),
      ])
      tableRecords.value = pageData.records
      tablePageNo.value = pageData.pageNo
      tablePageSize.value = pageData.pageSize
      tableTotal.value = pageData.total ?? pageData.records.length
      checkedTableKeys.value = checkedKeys
    } catch (error) {
      console.error(error)
      tableRecords.value = []
      checkedTableKeys.value = []
      tableTotal.value = 0
    } finally {
      tableLoading.value = false
    }
  }

  const refreshRoleTables = async () => {
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!roleId || !permissionId) {
      message.warning('缺少角色或资源信息，无法提交表格配置')
      return
    }

    try {
      await tableSchemaApi.refreshTablesForRole({
        roleId,
        permissionId,
        ids: checkedTableKeys.value.map((item) => String(item)),
      })
      await loadTables()
    } catch (error) {
      console.error(error)
    }
  }

  const handleTablePageChange = async (page: number) => {
    tablePageNo.value = page
    await loadTables()
  }

  const handleTablePageSizeChange = async (pageSize: number) => {
    tablePageNo.value = 1
    tablePageSize.value = pageSize
    await loadTables()
  }

  const closeTableSchemaModal = () => {
    tableSchemaModalVisible.value = false
    tableSchemaLoading.value = false
    tableSchemaSubmitLoading.value = false
    currentTable.value = null
    tableSchemaRecords.value = []
    checkedTableSchemaKeys.value = []
  }

  const openTableSchemaModal = async (table: SysPermissionData) => {
    const roleId = unref(roleIdRef)
    if (!roleId || !table?.id) {
      message.warning('缺少角色或表格信息，无法查看表格列')
      return
    }

    currentTable.value = table
    tableSchemaModalVisible.value = true
    tableSchemaLoading.value = true

    try {
      const [records, checkedKeys] = await Promise.all([
        tableSchemaApi.listSchemas({
          permissionId: table.id,
        }),
        tableSchemaApi.listSchemasForRole(roleId, String(table.id)),
      ])
      tableSchemaRecords.value = records
      checkedTableSchemaKeys.value = checkedKeys
    } catch (error) {
      console.error(error)
      tableSchemaRecords.value = []
      checkedTableSchemaKeys.value = []
    } finally {
      tableSchemaLoading.value = false
    }
  }

  const refreshRoleTableSchemas = async () => {
    const roleId = unref(roleIdRef)
    if (!roleId || !currentTable.value?.id) {
      message.warning('缺少角色或表格信息，无法提交表格列配置')
      return
    }

    tableSchemaSubmitLoading.value = true

    try {
      await tableSchemaApi.refreshSchemasForRole({
        roleId,
        tableId: String(currentTable.value.id),
        ids: checkedTableSchemaKeys.value.map((item) => String(item)),
      })
      checkedTableSchemaKeys.value = await tableSchemaApi.listSchemasForRole(
        roleId,
        String(currentTable.value.id),
      )
    } catch (error) {
      console.error(error)
    } finally {
      tableSchemaSubmitLoading.value = false
    }
  }

  watch(
    () => [unref(showRef), unref(roleIdRef), unref(permissionIdRef)] as const,
    async () => {
      await loadTables()
    },
    { immediate: true },
  )

  watch(
    () => unref(showRef),
    (show) => {
      if (!show) {
        closeTableSchemaModal()
      }
    },
  )

  return {
    tableLoading,
    tablePageNo,
    tablePageSize,
    tableTotal,
    tableRecords,
    checkedTableKeys,
    tableSchemaModalVisible,
    tableSchemaLoading,
    tableSchemaSubmitLoading,
    currentTable,
    tableSchemaRecords,
    checkedTableSchemaKeys,
    tableTableSchemas,
    tableColumnSchemas,
    refreshRoleTables,
    handleTablePageChange,
    handleTablePageSizeChange,
    closeTableSchemaModal,
    openTableSchemaModal,
    refreshRoleTableSchemas,
  }
}

export default useRolePermissionTable
