import { ref, unref, watch, type MaybeRef } from 'vue'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import { message } from '@/utils/naiveApi'
import formSchemaApi from '@/features/rbac/permission/api/SysFormSchemaApi'
import type SysFormSchemaData from '@/features/rbac/permission/type/SysFormSchemaData'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

const useRolePermissionForm = (
  showRef: MaybeRef<boolean>,
  roleIdRef: MaybeRef<string | null>,
  permissionIdRef: MaybeRef<string | null>,
) => {
  const formLoading = ref(false)
  const formPageNo = ref(1)
  const formPageSize = ref(10)
  const formTotal = ref(0)
  const formRecords = ref<SysPermissionData[]>([])
  const checkedFormKeys = ref<string[]>([])
  const formSchemaModalVisible = ref(false)
  const formSchemaLoading = ref(false)
  const formSchemaSubmitLoading = ref(false)
  const currentForm = ref<SysPermissionData | null>(null)
  const formSchemaRecords = ref<SysFormSchemaData[]>([])
  const checkedFormSchemaKeys = ref<string[]>([])

  const formTableSchemas: DynamicTableSchema<SysPermissionData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '表单名称', key: 'permissionName', dataKey: 'permissionName', minWidth: 160 },
    { title: '表单编码', key: 'permissionCode', dataKey: 'permissionCode', minWidth: 180 },
    { title: '备注', key: 'remark', dataKey: 'remark', minWidth: 180, ellipsis: true },
    { title: '操作', key: 'action', type: 'slot', width: 120, fixed: 'right' },
  ]

  const formItemSchemas: DynamicTableSchema<SysFormSchemaData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '标题', key: 'label', dataKey: 'label' },
    { title: '字段 key', key: 'key', dataKey: 'key' },
    { title: '类型', key: 'type', dataKey: 'type'   },
  ]

  const loadForms = async () => {
    const show = unref(showRef)
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!show || !roleId || !permissionId) {
      formRecords.value = []
      checkedFormKeys.value = []
      formTotal.value = 0
      return
    }

    formLoading.value = true

    try {
      const [pageData, checkedKeys] = await Promise.all([
        formSchemaApi.pageForms({
          permissionId,
          pageNo: formPageNo.value,
          pageSize: formPageSize.value,
        }),
        formSchemaApi.listFormsForRole(roleId, permissionId),
      ])
      formRecords.value = pageData.records
      formPageNo.value = pageData.pageNo
      formPageSize.value = pageData.pageSize
      formTotal.value = pageData.total ?? pageData.records.length
      checkedFormKeys.value = checkedKeys
    } catch (error) {
      console.error(error)
      formRecords.value = []
      checkedFormKeys.value = []
      formTotal.value = 0
    } finally {
      formLoading.value = false
    }
  }

  const refreshRoleForms = async () => {
    const roleId = unref(roleIdRef)
    const permissionId = unref(permissionIdRef)
    if (!roleId || !permissionId) {
      message.warning('缺少角色或资源信息，无法提交表单配置')
      return
    }

    try {
      await formSchemaApi.refreshFormsForRole({
        roleId,
        permissionId,
        ids: checkedFormKeys.value.map((item) => String(item)),
      })
      await loadForms()
    } catch (error) {
      console.error(error)
    }
  }

  const handleFormPageChange = async (page: number) => {
    formPageNo.value = page
    await loadForms()
  }

  const handleFormPageSizeChange = async (pageSize: number) => {
    formPageNo.value = 1
    formPageSize.value = pageSize
    await loadForms()
  }

  const closeFormSchemaModal = () => {
    formSchemaModalVisible.value = false
    formSchemaLoading.value = false
    formSchemaSubmitLoading.value = false
    currentForm.value = null
    formSchemaRecords.value = []
    checkedFormSchemaKeys.value = []
  }

  const openFormSchemaModal = async (form: SysPermissionData) => {
    const roleId = unref(roleIdRef)
    if (!roleId || !form?.id) {
      message.warning('缺少角色或表单信息，无法查看表单项')
      return
    }

    currentForm.value = form
    formSchemaModalVisible.value = true
    formSchemaLoading.value = true

    try {
      const [records, checkedKeys] = await Promise.all([
        formSchemaApi.listSchemas({
          permissionId: form.id,
          pageNo: 1,
          pageSize: 999,
        }),
        formSchemaApi.listSchemasForRole(roleId, String(form.id)),
      ])
      formSchemaRecords.value = records
      checkedFormSchemaKeys.value = checkedKeys
    } catch (error) {
      console.error(error)
      formSchemaRecords.value = []
      checkedFormSchemaKeys.value = []
    } finally {
      formSchemaLoading.value = false
    }
  }

  const refreshRoleFormSchemas = async () => {
    const roleId = unref(roleIdRef)
    if (!roleId || !currentForm.value?.id) {
      message.warning('缺少角色或表单信息，无法提交表单项配置')
      return
    }

    formSchemaSubmitLoading.value = true

    try {
      await formSchemaApi.refreshSchemasForRole({
        roleId,
        formId: String(currentForm.value.id),
        ids: checkedFormSchemaKeys.value.map((item) => String(item)),
      })
      checkedFormSchemaKeys.value = await formSchemaApi.listSchemasForRole(
        roleId,
        String(currentForm.value.id),
      )
    } catch (error) {
      console.error(error)
    } finally {
      formSchemaSubmitLoading.value = false
    }
  }

  watch(
    () => [unref(showRef), unref(roleIdRef), unref(permissionIdRef)] as const,
    async () => {
      await loadForms()
    },
    { immediate: true },
  )

  watch(
    () => unref(showRef),
    (show) => {
      if (!show) {
        closeFormSchemaModal()
      }
    },
  )

  return {
    formLoading,
    formPageNo,
    formPageSize,
    formTotal,
    formRecords,
    checkedFormKeys,
    formSchemaModalVisible,
    formSchemaLoading,
    formSchemaSubmitLoading,
    currentForm,
    formSchemaRecords,
    checkedFormSchemaKeys,
    formTableSchemas,
    formItemSchemas,
    refreshRoleForms,
    handleFormPageChange,
    handleFormPageSizeChange,
    closeFormSchemaModal,
    openFormSchemaModal,
    refreshRoleFormSchemas,
  }
}

export default useRolePermissionForm
