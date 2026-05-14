import { ref, unref, watch, type MaybeRef } from 'vue'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import { message } from '@/utils/naiveApi'
import dataScopeApi from '@/features/rbac/datascope/api/SysDataScopeApi'
import dataScopeGroupApi from '@/features/rbac/datascope/api/SysDataScopeGroupApi'
import type SysDataScopeData from '@/features/rbac/datascope/type/SysDataScopeData'
import type SysDataScopeGroupData from '@/features/rbac/datascope/type/SysDataScopeGroupData'
import usePermissionDataScope from './usePermissionDataScope'

const useRolePermissionDataScope = (
  showRef: MaybeRef<boolean>,
  roleIdRef: MaybeRef<string | null>,
  permissionIdRef: MaybeRef<string | null>,
) => {
  const scopeModalVisible = ref(false)
  const scopeLoading = ref(false)
  const scopeSubmitLoading = ref(false)
  const currentGroup = ref<SysDataScopeGroupData | null>(null)
  const scopeRecords = ref<SysDataScopeData[]>([])
  const checkedScopeKeys = ref<string[]>([])
  const checkedGroupKeys = ref<string[]>([])

  const {
    groupLoading,
    groupPageNo,
    groupPageSize,
    groupTotal,
    groupRecords,
    roleGroupTableSchemas,
    handleGroupPageChange,
    handleGroupPageSizeChange,
  } = usePermissionDataScope(permissionIdRef)

  const scopeTableSchemas: DynamicTableSchema<SysDataScopeData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '名称', key: 'name', dataKey: 'name', minWidth: 160 },
    { title: '类型', key: 'type', dataKey: 'type', minWidth: 160 },
    { title: '规则值', key: 'value', dataKey: 'value', minWidth: 260, ellipsis: true },
  ]

  const listRoleGroup = async () => {
    const show = unref(showRef)
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!show || !roleId || !permissionId) {
      checkedGroupKeys.value = []
      return
    }

    try {
      checkedGroupKeys.value = await dataScopeGroupApi.listGroup({
        roleId,
        permissionId,
      })
    } catch (error) {
      console.error(error)
      checkedGroupKeys.value = []
    }
  }

  const refreshRoleGroup = async () => {
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!roleId || !permissionId) {
      message.warning('缺少角色或资源信息，无法提交分组配置')
      return
    }

    try {
      await dataScopeGroupApi.refreshRoleGroup({
        roleId,
        permissionId,
        groupIds: checkedGroupKeys.value.map((item) => String(item)),
      })
      await listRoleGroup()
    } catch (error) {
      console.error(error)
    }
  }

  const closeScopeModal = () => {
    scopeModalVisible.value = false
    scopeLoading.value = false
    scopeSubmitLoading.value = false
    currentGroup.value = null
    scopeRecords.value = []
    checkedScopeKeys.value = []
  }

  const openScopeModal = async (group: SysDataScopeGroupData) => {
    const roleId = unref(roleIdRef)
    if (!roleId || !group?.id) {
      message.warning('缺少角色或分组信息，无法查看数据范围')
      return
    }

    currentGroup.value = group
    scopeModalVisible.value = true
    scopeLoading.value = true

    try {
      const [records, checkedKeys] = await Promise.all([
        dataScopeApi.listByGroupId({
          groupId: Number(group.id),
          pageNo: 1,
          pageSize: 999,
        }),
        dataScopeApi.listDataScopeByGroupId({
          roleId,
          groupId: String(group.id),
        }),
      ])
      scopeRecords.value = records
      checkedScopeKeys.value = checkedKeys
    } catch (error) {
      console.error(error)
      scopeRecords.value = []
      checkedScopeKeys.value = []
    } finally {
      scopeLoading.value = false
    }
  }

  const refreshRoleGroupDataScope = async () => {
    const roleId = unref(roleIdRef)
    if (!roleId || !currentGroup.value?.id) {
      message.warning('缺少角色或分组信息，无法提交数据范围配置')
      return
    }

    scopeSubmitLoading.value = true

    try {
      await dataScopeApi.refreshRoleGroupDataScope({
        roleId,
        groupId: String(currentGroup.value.id),
        scopeIds: checkedScopeKeys.value.map((item) => String(item)),
      })
      checkedScopeKeys.value = await dataScopeApi.listDataScopeByGroupId({
        roleId,
        groupId: String(currentGroup.value.id),
      })
    } catch (error) {
      console.error(error)
    } finally {
      scopeSubmitLoading.value = false
    }
  }

  watch(
    () => [unref(showRef), unref(roleIdRef), unref(permissionIdRef)] as const,
    async () => {
      await listRoleGroup()
    },
    { immediate: true },
  )

  watch(
    () => unref(showRef),
    (show) => {
      if (!show) {
        closeScopeModal()
      }
    },
  )

  return {
    groupLoading,
    groupPageNo,
    groupPageSize,
    groupTotal,
    groupRecords,
    roleGroupTableSchemas,
    handleGroupPageChange,
    handleGroupPageSizeChange,
    scopeModalVisible,
    scopeLoading,
    scopeSubmitLoading,
    currentGroup,
    scopeRecords,
    checkedScopeKeys,
    checkedGroupKeys,
    scopeTableSchemas,
    refreshRoleGroup,
    closeScopeModal,
    openScopeModal,
    refreshRoleGroupDataScope,
  }
}

export default useRolePermissionDataScope
