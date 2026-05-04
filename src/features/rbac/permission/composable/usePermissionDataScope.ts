import { computed, h, nextTick, ref, unref, watch, type MaybeRef } from 'vue'
import { NInput, type FormRules, type TreeOption } from 'naive-ui'

import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import sysDepartApi from '@/features/rbac/depart/api/SysDepartApi'
import {
  collectMatchedExpandedKeys,
  getNodeKey,
  toTreeOption,
} from '@/features/rbac/depart/composable/departShared'
import type SysDepartData from '@/features/rbac/depart/type/SysDepartData'
import sysDataScopeApi from '@/features/rbac/datascope/api/SysDataScopeApi'
import sysDataScopeGroupApi from '@/features/rbac/datascope/api/SysDataScopeGroupApi'
import type SysDataScopeData from '@/features/rbac/datascope/type/SysDataScopeData'
import type SysDataScopeGroupData from '@/features/rbac/datascope/type/SysDataScopeGroupData'
import type SysDataScopeGroupParam from '@/features/rbac/datascope/type/SysDataScopeGroupParam'
import type SysDataScopeParam from '@/features/rbac/datascope/type/SysDataScopeParam'
import userApi from '@/features/rbac/user/api/UserApi'
import type SysUserData from '@/features/rbac/user/type/SysUserData'
import type SysUserParam from '@/features/rbac/user/type/SysUserParam'
import { dialog, message } from '@/utils/naiveApi'
import usePermissionManager from './usePermissionManager'

type GroupFormModel = Required<Pick<SysDataScopeGroupParam, 'name' | 'code'>> & {
  id?: string
  permissionId?: number
}

type ScopeFormModel = Required<Pick<SysDataScopeParam, 'name' | 'column' | 'type' | 'value'>> & {
  id?: string
  groupId?: number
}

type GroupSearchFormModel = {
  name: string
}

type ScopeSearchFormModel = {
  name: string
}

type UserSearchFormModel = Pick<SysUserParam, 'userName' | 'realName'>

type DepartSearchFormModel = {
  departName: string
}

const BUILTIN_SCOPE_TYPE_LABELS: Record<string, string> = {
  ALL: '查看全部数据',
  ROOT_DEPT: '查看当前主体（组织根）数据',
  DEPT_AND_CHILD: '查看当前部门及子部门数据',
  CRUEENT_DEPT_AND_CHILD: '查看当前部门及子部门数据',
  SELF_CREATED: '查看本人创建的数据',
  ASSIGNED_DEPART: '查看指定部门的数据',
  ASSIGNED_USER: '查看指定人员创建的数据',
}

const ASSIGNED_USER_TYPE = 'ASSIGNED_USER'
const ASSIGNED_DEPART_TYPE = 'ASSIGNED_DEPART'

const usePermissionDataScope = (
  externalPermissionId?: MaybeRef<string | number | null | undefined>,
) => {
  const { currentPermission } =
    externalPermissionId === undefined ? usePermissionManager() : { currentPermission: null }

  const permissionId = computed<number | null>(() => {
    const rawId =
      externalPermissionId === undefined
        ? currentPermission?.value?.id
        : unref(externalPermissionId)
    if (!rawId) return null
    const numericId = Number(rawId)
    return Number.isFinite(numericId) ? numericId : null
  })

  const groupSearchFormModel = ref<GroupSearchFormModel>({
    name: '',
  })
  const groupLoading = ref(false)
  const groupPageNo = ref(1)
  const groupPageSize = ref(10)
  const groupTotal = ref(0)
  const groupRecords = ref<SysDataScopeGroupData[]>([])
  const checkedGroupKeys = ref<Array<string | number>>([])

  const groupModalVisible = ref(false)
  const groupModalLoading = ref(false)
  const groupSubmitLoading = ref(false)
  const groupFormRef = ref<{ validate: () => Promise<void> } | null>(null)

  const scopeDrawerVisible = ref(false)
  const scopeDrawerLoading = ref(false)
  const scopeSearchFormModel = ref<ScopeSearchFormModel>({
    name: '',
  })
  const scopeRecords = ref<SysDataScopeData[]>([])
  const checkedScopeKeys = ref<Array<string | number>>([])
  const currentGroup = ref<SysDataScopeGroupData | null>(null)

  const scopeModalVisible = ref(false)
  const scopeModalLoading = ref(false)
  const scopeSubmitLoading = ref(false)
  const scopeFormRef = ref<{ validate: () => Promise<void> } | null>(null)
  const syncingScopeFormModel = ref(false)

  const userPickerVisible = ref(false)
  const userPickerLoading = ref(false)
  const userPickerSearchFormModel = ref<UserSearchFormModel>({
    userName: '',
    realName: '',
  })
  const userPickerPageNo = ref(1)
  const userPickerPageSize = ref(10)
  const userPickerTotal = ref(0)
  const userPickerRecords = ref<SysUserData[]>([])
  const checkedUserPickerKeys = ref<Array<string | number>>([])
  const selectedUserMap = ref<Record<string, SysUserData>>({})

  const departPickerVisible = ref(false)
  const departPickerLoading = ref(false)
  const departPickerSearchFormModel = ref<DepartSearchFormModel>({
    departName: '',
  })
  const departTreeData = ref<TreeOption[]>([])
  const checkedDepartKeys = ref<Array<string | number>>([])
  const expandedDepartKeys = ref<Array<string | number>>([])

  function createInitialGroupFormModel(): GroupFormModel {
    return {
      permissionId: permissionId.value ?? undefined,
      name: '',
      code: '',
    }
  }

  function createInitialScopeFormModel(): ScopeFormModel {
    return {
      groupId: currentGroup.value?.id ? Number(currentGroup.value.id) : undefined,
      name: '',
      column: '',
      type: '',
      value: '',
    }
  }

  const groupFormModel = ref<GroupFormModel>(createInitialGroupFormModel())
  const scopeFormModel = ref<ScopeFormModel>(createInitialScopeFormModel())

  const setScopeFormModel = (model: ScopeFormModel) => {
    syncingScopeFormModel.value = true
    scopeFormModel.value = model
    void nextTick(() => {
      syncingScopeFormModel.value = false
    })
  }

  const getBuiltinScopeLabel = (type?: string) => {
    if (!type) return null
    return BUILTIN_SCOPE_TYPE_LABELS[type] ?? null
  }

  const isBuiltinScopeType = computed(() =>
    Boolean(getBuiltinScopeLabel(scopeFormModel.value.type)),
  )
  const isAssignedUserType = computed(() => scopeFormModel.value.type === ASSIGNED_USER_TYPE)
  const isAssignedDepartType = computed(() => scopeFormModel.value.type === ASSIGNED_DEPART_TYPE)
  const shouldShowScopeName = computed(() => Boolean(scopeFormModel.value.type))
  const shouldShowScopeColumnField = computed(
    () =>
      Boolean(scopeFormModel.value.type) &&
      !isBuiltinScopeType.value &&
      !isAssignedUserType.value &&
      !isAssignedDepartType.value,
  )
  const shouldShowScopeValueField = computed(
    () =>
      Boolean(scopeFormModel.value.type) &&
      (!isBuiltinScopeType.value || isAssignedUserType.value || isAssignedDepartType.value),
  )
  const scopeValueFieldPlaceholder = computed(() => {
    if (isAssignedUserType.value) return '点击选择用户'
    if (isAssignedDepartType.value) return '点击选择部门'
    return '请输入规则值或表达式'
  })

  const groupRules: FormRules = {
    name: [{ required: true, message: '请输入分组名称', trigger: ['input', 'blur'] }],
    code: [{ required: true, message: '请输入分组编码', trigger: ['input', 'blur'] }],
  }

  const scopeRules: FormRules = {
    name: [{ required: true, message: '请输入数据范围名称', trigger: ['input', 'blur'] }],
    type: [{ required: true, message: '请选择数据范围类型', trigger: ['change', 'blur'] }],
  }

  const groupDrawerTitle = computed(() =>
    groupFormModel.value.id ? '编辑数据范围组' : '新增数据范围组',
  )
  const scopeDrawerTitle = computed(() =>
    currentGroup.value?.name ? `数据范围：${currentGroup.value.name}` : '数据范围',
  )
  const scopeFormDrawerTitle = computed(() =>
    scopeFormModel.value.id ? '编辑数据范围' : '新增数据范围',
  )

  const groupTableSchemas: DynamicTableSchema<SysDataScopeGroupData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '分组名称', key: 'name', dataKey: 'name', minWidth: 160 },
    { title: '分组编码', key: 'code', dataKey: 'code', minWidth: 140 },
    { title: '创建时间', key: 'createTime', dataKey: 'createTime', minWidth: 200 },
    { title: '操作', key: 'action', type: 'slot', width: 220, fixed: 'right' },
  ]

  const roleGroupTableSchemas: DynamicTableSchema<SysDataScopeGroupData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '分组名称', key: 'name', dataKey: 'name', minWidth: 160 },
    { title: '分组编码', key: 'code', dataKey: 'code', minWidth: 140 },
    { title: '创建时间', key: 'createTime', dataKey: 'createTime', minWidth: 200 },
    { title: '操作', key: 'action', type: 'slot', width: 140, fixed: 'right' },
  ]

  const scopeTableSchemas: DynamicTableSchema<SysDataScopeData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '名称', key: 'name', dataKey: 'name', minWidth: 160 },
    { title: '规则值', key: 'value', dataKey: 'value', minWidth: 240, ellipsis: true },
    { title: '操作', key: 'action', type: 'slot', width: 140, fixed: 'right' },
  ]

  const userPickerTableSchemas: DynamicTableSchema<SysUserData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '账号', key: 'userName', dataKey: 'userName', minWidth: 140 },
    { title: '姓名', key: 'realName', dataKey: 'realName', minWidth: 140 },
    { title: '电话', key: 'phone', dataKey: 'phone', minWidth: 140 },
    { title: '邮箱', key: 'email', dataKey: 'email', minWidth: 180 },
  ]

  const groupSearchFormSchemas: DynamicFormSchema<GroupSearchFormModel>[] = [
    {
      type: 'input',
      key: 'name',
      dataKey: 'name',
      placeholder: '请输入分组名称',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const scopeSearchFormSchemas: DynamicFormSchema<ScopeSearchFormModel>[] = [
    {
      type: 'input',
      key: 'name',
      dataKey: 'name',
      placeholder: '请输入名称',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const userSearchFormSchemas: DynamicFormSchema<UserSearchFormModel>[] = [
    {
      type: 'input',
      key: 'userName',
      dataKey: 'userName',
      label: '账号',
      placeholder: '请输入账号',
      span: 6,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'realName',
      dataKey: 'realName',
      label: '姓名',
      placeholder: '请输入姓名',
      span: 6,
      prop: { clearable: true },
    },
  ]

  const departSearchFormSchemas: DynamicFormSchema<DepartSearchFormModel>[] = [
    {
      type: 'input',
      key: 'departName',
      dataKey: 'departName',
      label: '部门名称',
      placeholder: '请输入部门名称',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const groupFormSchemas: DynamicFormSchema<GroupFormModel>[] = [
    {
      type: 'input',
      key: 'name',
      dataKey: 'name',
      label: '分组名称',
      labelPosition: 'left',
      placeholder: '请输入分组名称',
      span: 24,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'code',
      dataKey: 'code',
      label: '分组编码',
      labelPosition: 'left',
      placeholder: '请输入分组编码',
      span: 24,
      prop: { clearable: true },
    },
  ]

  const openUserPicker = async () => {
    selectedUserMap.value = {}
    checkedUserPickerKeys.value = []
    userPickerSearchFormModel.value = {
      userName: '',
      realName: '',
    }
    userPickerPageNo.value = 1
    userPickerVisible.value = true
    await loadUserPickerPage()
  }

  const openDepartPicker = async () => {
    departPickerSearchFormModel.value.departName = ''
    departPickerVisible.value = true
    await loadDepartTree()

    const departCodeKeyMap = buildDepartCodeKeyMap(departTreeData.value)
    checkedDepartKeys.value = scopeFormModel.value.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => departCodeKeyMap.get(item))
      .filter((item): item is string | number => item !== undefined)
  }

  const scopeFormSchemas = computed<DynamicFormSchema<ScopeFormModel>[]>(() => [
    {
      type: 'dict',
      key: 'type',
      dataKey: 'type',
      label: '类型',
      labelPosition: 'left',
      dictCode: 'DATA_SCOPE',
      placeholder: '请选择类型',
      span: 24,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'name',
      dataKey: 'name',
      label: '名称',
      labelPosition: 'left',
      placeholder: '请输入名称',
      span: 24,
      hidden: !shouldShowScopeName.value,
      disabled: isBuiltinScopeType.value,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'column',
      dataKey: 'column',
      label: '匹配列',
      labelPosition: 'left',
      placeholder: '例如 dept_id',
      span: 24,
      hidden: !shouldShowScopeColumnField.value,
      rules: shouldShowScopeColumnField.value
        ? [{ required: true, message: '请输入匹配列', trigger: ['input', 'blur'] }]
        : [],
      prop: { clearable: true },
    },
    {
      type: isAssignedUserType.value || isAssignedDepartType.value ? 'input' : 'textarea',
      key: 'value',
      dataKey: 'value',
      label: '规则值',
      labelPosition: 'left',
      placeholder: scopeValueFieldPlaceholder.value,
      span: 24,
      hidden: !shouldShowScopeValueField.value,
      rules: shouldShowScopeValueField.value
        ? [{ required: true, message: '请输入规则值', trigger: ['input', 'blur'] }]
        : [],
      render:
        isAssignedUserType.value || isAssignedDepartType.value
          ? ({ value }) =>
              h(NInput, {
                value: String(value ?? ''),
                placeholder: scopeValueFieldPlaceholder.value,
                readonly: true,
                style: {
                  width: '100%',
                },
                onClick: () => {
                  if (isAssignedUserType.value) {
                    void openUserPicker()
                    return
                  }
                  if (isAssignedDepartType.value) {
                    void openDepartPicker()
                  }
                },
              })
          : undefined,
      prop:
        isAssignedUserType.value || isAssignedDepartType.value
          ? { clearable: true }
          : {
              autosize: {
                minRows: 3,
                maxRows: 6,
              },
            },
    },
  ])

  const loadGroupPage = async () => {
    if (!permissionId.value) {
      groupRecords.value = []
      groupTotal.value = 0
      checkedGroupKeys.value = []
      return
    }

    groupLoading.value = true

    try {
      const result = await sysDataScopeGroupApi.page({
        permissionId: permissionId.value,
        name: groupSearchFormModel.value.name.trim() || undefined,
        pageNo: groupPageNo.value,
        pageSize: groupPageSize.value,
      })
      groupRecords.value = result.records
      groupTotal.value = result.total ?? result.records.length
      groupPageNo.value = result.pageNo
      groupPageSize.value = result.pageSize
      checkedGroupKeys.value = checkedGroupKeys.value.filter((key) =>
        result.records.some((item) => String(item.id) === String(key)),
      )
    } catch (error) {
      console.error(error)
      groupRecords.value = []
      groupTotal.value = 0
      checkedGroupKeys.value = []
    } finally {
      groupLoading.value = false
    }
  }

  const loadScopes = async () => {
    if (!currentGroup.value?.id) {
      scopeRecords.value = []
      checkedScopeKeys.value = []
      return
    }

    scopeDrawerLoading.value = true

    try {
      const result = await sysDataScopeApi.listByGroupId({
        groupId: Number(currentGroup.value.id),
        name: scopeSearchFormModel.value.name.trim() || undefined,
        pageNo: 1,
        pageSize: 999,
      })
      scopeRecords.value = result
      checkedScopeKeys.value = checkedScopeKeys.value.filter((key) =>
        result.some((item) => String(item.id) === String(key)),
      )
    } catch (error) {
      console.error(error)
      scopeRecords.value = []
      checkedScopeKeys.value = []
    } finally {
      scopeDrawerLoading.value = false
    }
  }

  const handleGroupSearch = async () => {
    groupPageNo.value = 1
    await loadGroupPage()
  }

  const resetGroupSearch = async () => {
    groupSearchFormModel.value.name = ''
    groupPageNo.value = 1
    await loadGroupPage()
  }

  const handleGroupPageChange = async (pageNo: number) => {
    groupPageNo.value = pageNo
    await loadGroupPage()
  }

  const handleGroupPageSizeChange = async (pageSize: number) => {
    groupPageNo.value = 1
    groupPageSize.value = pageSize
    await loadGroupPage()
  }

  const openCreateGroup = () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    groupFormModel.value = createInitialGroupFormModel()
    groupModalVisible.value = true
  }

  const openEditGroup = async (groupId: string | number) => {
    groupModalVisible.value = true
    groupModalLoading.value = true

    try {
      const result = await sysDataScopeGroupApi.queryById(groupId)
      groupFormModel.value = {
        id: result.id,
        permissionId: result.permissionId,
        name: result.name ?? '',
        code: result.code ?? '',
      }
    } catch (error) {
      console.error(error)
      groupModalVisible.value = false
    } finally {
      groupModalLoading.value = false
    }
  }

  const closeGroupModal = () => {
    groupModalVisible.value = false
    groupModalLoading.value = false
    groupSubmitLoading.value = false
    groupFormModel.value = createInitialGroupFormModel()
  }

  const submitGroup = async () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    await groupFormRef.value?.validate()
    groupSubmitLoading.value = true

    try {
      await sysDataScopeGroupApi.upsert({
        id: groupFormModel.value.id,
        permissionId: permissionId.value,
        name: groupFormModel.value.name.trim(),
        code: groupFormModel.value.code.trim(),
      })
      closeGroupModal()
      await loadGroupPage()
    } catch (error) {
      console.error(error)
    } finally {
      groupSubmitLoading.value = false
    }
  }

  const confirmDeleteGroups = (ids: Array<string | number>) => {
    dialog.warning({
      title: '删除确认',
      content: '确定删除选中的数据范围组吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysDataScopeGroupApi.deleteByIds(ids)
          checkedGroupKeys.value = checkedGroupKeys.value.filter(
            (key) => !ids.some((id) => String(id) === String(key)),
          )
          if (
            currentGroup.value?.id &&
            ids.some((id) => String(id) === String(currentGroup.value?.id))
          ) {
            closeScopeDrawer()
          }
          await loadGroupPage()
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleDeleteGroup = (groupId?: string | number) => {
    if (!groupId) return
    confirmDeleteGroups([groupId])
  }

  const handleBatchDeleteGroups = () => {
    if (!checkedGroupKeys.value.length) {
      message.warning('请先选择要删除的数据范围组')
      return
    }
    confirmDeleteGroups(checkedGroupKeys.value)
  }

  const openScopeDrawer = async (group: SysDataScopeGroupData) => {
    currentGroup.value = group
    scopeSearchFormModel.value.name = ''
    checkedScopeKeys.value = []
    scopeDrawerVisible.value = true
    await loadScopes()
  }

  const closeScopeDrawer = () => {
    scopeDrawerVisible.value = false
    scopeDrawerLoading.value = false
    scopeSearchFormModel.value.name = ''
    scopeRecords.value = []
    checkedScopeKeys.value = []
    currentGroup.value = null
  }

  const handleScopeSearch = async () => {
    await loadScopes()
  }

  const resetScopeSearch = async () => {
    scopeSearchFormModel.value.name = ''
    await loadScopes()
  }

  const openCreateScope = () => {
    if (!currentGroup.value?.id) {
      message.warning('请先选择数据范围组')
      return
    }

    setScopeFormModel(createInitialScopeFormModel())
    scopeModalVisible.value = true
  }

  const openEditScope = async (scopeId: string | number) => {
    scopeModalVisible.value = true
    scopeModalLoading.value = true

    try {
      const result = await sysDataScopeApi.queryById(scopeId)
      setScopeFormModel({
        id: result.id,
        groupId: result.groupId,
        name: result.name ?? '',
        column: result.column ?? '',
        type: result.type ?? '',
        value: result.value ?? '',
      })
    } catch (error) {
      console.error(error)
      scopeModalVisible.value = false
    } finally {
      scopeModalLoading.value = false
    }
  }

  const closeScopeModal = () => {
    scopeModalVisible.value = false
    scopeModalLoading.value = false
    scopeSubmitLoading.value = false
    setScopeFormModel(createInitialScopeFormModel())
  }

  const submitScope = async () => {
    if (!currentGroup.value?.id) {
      message.warning('请先选择数据范围组')
      return
    }

    await scopeFormRef.value?.validate()
    scopeSubmitLoading.value = true

    try {
      await sysDataScopeApi.upsert({
        id: scopeFormModel.value.id,
        groupId: Number(currentGroup.value.id),
        name: scopeFormModel.value.name.trim(),
        column: shouldShowScopeColumnField.value ? scopeFormModel.value.column.trim() : '',
        type: scopeFormModel.value.type.trim(),
        value: shouldShowScopeValueField.value ? scopeFormModel.value.value.trim() : '',
      })
      closeScopeModal()
      await loadScopes()
    } catch (error) {
      console.error(error)
    } finally {
      scopeSubmitLoading.value = false
    }
  }

  const confirmDeleteScopes = (ids: Array<string | number>) => {
    dialog.warning({
      title: '删除确认',
      content: '确定删除选中的数据范围吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysDataScopeApi.deleteByIds(ids)
          checkedScopeKeys.value = checkedScopeKeys.value.filter(
            (key) => !ids.some((id) => String(id) === String(key)),
          )
          await loadScopes()
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleDeleteScope = (scopeId?: string | number) => {
    if (!scopeId) return
    confirmDeleteScopes([scopeId])
  }

  const handleBatchDeleteScopes = () => {
    if (!checkedScopeKeys.value.length) {
      message.warning('请先选择要删除的数据范围')
      return
    }
    confirmDeleteScopes(checkedScopeKeys.value)
  }

  const loadUserPickerPage = async () => {
    userPickerLoading.value = true

    try {
      const result = await userApi.page({
        userName: userPickerSearchFormModel.value.userName?.trim() || undefined,
        realName: userPickerSearchFormModel.value.realName?.trim() || undefined,
        pageNo: userPickerPageNo.value,
        pageSize: userPickerPageSize.value,
      })
      userPickerRecords.value = result.records
      userPickerTotal.value = result.total ?? result.records.length
      userPickerPageNo.value = result.pageNo
      userPickerPageSize.value = result.pageSize
    } catch (error) {
      console.error(error)
      userPickerRecords.value = []
      userPickerTotal.value = 0
    } finally {
      userPickerLoading.value = false
    }
  }

  const handleUserPickerSearch = async () => {
    userPickerPageNo.value = 1
    await loadUserPickerPage()
  }

  const resetUserPickerSearch = async () => {
    userPickerSearchFormModel.value = {
      userName: '',
      realName: '',
    }
    userPickerPageNo.value = 1
    await loadUserPickerPage()
  }

  const handleUserPickerPageChange = async (pageNo: number) => {
    userPickerPageNo.value = pageNo
    await loadUserPickerPage()
  }

  const handleUserPickerPageSizeChange = async (pageSize: number) => {
    userPickerPageNo.value = 1
    userPickerPageSize.value = pageSize
    await loadUserPickerPage()
  }

  const handleUserPickerSelectionChange = (payload: {
    checkedRowKeys: Array<string | number>
    checkedRows: SysUserData[]
  }) => {
    const nextMap = { ...selectedUserMap.value }
    userPickerRecords.value.forEach((row) => {
      if (row.id) {
        delete nextMap[String(row.id)]
      }
    })
    payload.checkedRows.forEach((row) => {
      if (row.id) {
        nextMap[String(row.id)] = row
      }
    })
    selectedUserMap.value = nextMap
    checkedUserPickerKeys.value = Object.keys(nextMap)
  }

  const closeUserPicker = () => {
    userPickerVisible.value = false
  }

  const confirmUserPicker = () => {
    scopeFormModel.value.value = Object.values(selectedUserMap.value)
      .map((item) => item.userName?.trim() || '')
      .filter(Boolean)
      .join(',')
    closeUserPicker()
  }

  const buildDepartKeyCodeMap = (nodes: TreeOption[]) => {
    const map = new Map<string, string>()

    const walk = (items: TreeOption[]) => {
      items.forEach((item) => {
        const raw = item.raw as SysDepartData | undefined
        const key = getNodeKey(item)
        if (key !== '' && raw?.departCode) {
          map.set(String(key), raw.departCode)
        }
        const children = Array.isArray(item.children) ? item.children : []
        if (children.length) {
          walk(children)
        }
      })
    }

    walk(nodes)
    return map
  }

  const buildDepartCodeKeyMap = (nodes: TreeOption[]) => {
    const map = new Map<string, string | number>()

    const walk = (items: TreeOption[]) => {
      items.forEach((item) => {
        const raw = item.raw as SysDepartData | undefined
        const key = getNodeKey(item)
        if (key !== '' && raw?.departCode) {
          map.set(raw.departCode, key)
        }
        const children = Array.isArray(item.children) ? item.children : []
        if (children.length) {
          walk(children)
        }
      })
    }

    walk(nodes)
    return map
  }

  const loadDepartTree = async () => {
    departPickerLoading.value = true

    try {
      const result = await sysDepartApi.tree(departPickerSearchFormModel.value.departName.trim())
      departTreeData.value = result.map((item) => toTreeOption(item))
      expandedDepartKeys.value = collectMatchedExpandedKeys(
        departTreeData.value,
        departPickerSearchFormModel.value.departName,
      )
    } catch (error) {
      console.error(error)
      departTreeData.value = []
      expandedDepartKeys.value = []
    } finally {
      departPickerLoading.value = false
    }
  }

  const closeDepartPicker = () => {
    departPickerVisible.value = false
  }

  const handleDepartPickerSearch = async () => {
    await loadDepartTree()
  }

  const resetDepartPickerSearch = async () => {
    departPickerSearchFormModel.value.departName = ''
    await loadDepartTree()
  }

  const confirmDepartPicker = () => {
    const keyCodeMap = buildDepartKeyCodeMap(departTreeData.value)
    scopeFormModel.value.value = checkedDepartKeys.value
      .map((key) => keyCodeMap.get(String(key)) ?? '')
      .filter(Boolean)
      .join(',')
    closeDepartPicker()
  }

  watch(
    permissionId,
    async () => {
      groupSearchFormModel.value.name = ''
      groupPageNo.value = 1
      checkedGroupKeys.value = []
      closeScopeDrawer()
      await loadGroupPage()
    },
    { immediate: true },
  )

  watch(
    () => scopeFormModel.value.type,
    (type, previousType) => {
      if (syncingScopeFormModel.value) {
        return
      }

      const builtinLabel = getBuiltinScopeLabel(type)

      if (!type) {
        scopeFormModel.value.name = ''
        scopeFormModel.value.column = ''
        scopeFormModel.value.value = ''
        return
      }

      if (builtinLabel) {
        scopeFormModel.value.name = builtinLabel
        scopeFormModel.value.column = ''
        if (type !== previousType) {
          scopeFormModel.value.value = ''
        }
        return
      }

      if (
        getBuiltinScopeLabel(previousType) &&
        scopeFormModel.value.name === getBuiltinScopeLabel(previousType)
      ) {
        scopeFormModel.value.name = ''
      }

      if (type !== previousType) {
        scopeFormModel.value.column = ''
        scopeFormModel.value.value = ''
      }
    },
  )

  return {
    permissionId,
    groupSearchFormModel,
    groupLoading,
    groupPageNo,
    groupPageSize,
    groupTotal,
    groupRecords,
    checkedGroupKeys,
    groupModalVisible,
    groupModalLoading,
    groupSubmitLoading,
    groupFormRef,
    groupFormModel,
    scopeDrawerVisible,
    scopeDrawerLoading,
    scopeSearchFormModel,
    scopeRecords,
    checkedScopeKeys,
    currentGroup,
    scopeModalVisible,
    scopeModalLoading,
    scopeSubmitLoading,
    scopeFormRef,
    scopeFormModel,
    userPickerVisible,
    userPickerLoading,
    userPickerSearchFormModel,
    userPickerPageNo,
    userPickerPageSize,
    userPickerTotal,
    userPickerRecords,
    checkedUserPickerKeys,
    departPickerVisible,
    departPickerLoading,
    departPickerSearchFormModel,
    departTreeData,
    checkedDepartKeys,
    expandedDepartKeys,
    groupRules,
    scopeRules,
    groupDrawerTitle,
    scopeDrawerTitle,
    scopeFormDrawerTitle,
    groupTableSchemas,
    roleGroupTableSchemas,
    scopeTableSchemas,
    userPickerTableSchemas,
    groupSearchFormSchemas,
    scopeSearchFormSchemas,
    userSearchFormSchemas,
    departSearchFormSchemas,
    groupFormSchemas,
    scopeFormSchemas,
    handleGroupSearch,
    resetGroupSearch,
    handleGroupPageChange,
    handleGroupPageSizeChange,
    openCreateGroup,
    openEditGroup,
    closeGroupModal,
    submitGroup,
    handleDeleteGroup,
    handleBatchDeleteGroups,
    openScopeDrawer,
    closeScopeDrawer,
    handleScopeSearch,
    resetScopeSearch,
    openCreateScope,
    openEditScope,
    closeScopeModal,
    submitScope,
    handleDeleteScope,
    handleBatchDeleteScopes,
    handleUserPickerSearch,
    resetUserPickerSearch,
    handleUserPickerPageChange,
    handleUserPickerPageSizeChange,
    handleUserPickerSelectionChange,
    closeUserPicker,
    confirmUserPicker,
    handleDepartPickerSearch,
    resetDepartPickerSearch,
    closeDepartPicker,
    confirmDepartPicker,
  }
}

export default usePermissionDataScope
