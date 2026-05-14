import { computed, ref, unref, watch, type MaybeRef } from 'vue'
import type { FormRules } from 'naive-ui'

import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import sysPermissionApi from '../api/SysPermissionApi'
import sysTableSchemaApi from '../api/SysTableSchemaApi'
import usePermissionManager from './usePermissionManager'
import type SysPermissionData from '../type/SysPermissionData'
import type SysPermissionParam from '../type/SysPermissionParam'
import type SysTableSchemaData from '../type/SysTableSchemaData'
import type SysTableSchemaParam from '../type/SysTableSchemaParam'
import { dialog, message } from '@/utils/naiveApi'

type TableSearchFormModel = {
  permissionName: string
  permissionCode: string
}

type SchemaSearchFormModel = {
  title: string
  key: string
}

type TableFormModel = Required<Pick<SysPermissionParam, 'permissionName' | 'permissionCode'>> & {
  id?: string
  pid?: string
  permissionType: number
  component: string
  visible: boolean
  index?: number
  remark: string
}

type SchemaFormModel = Required<Pick<SysTableSchemaParam, 'key' | 'title'>> & {
  id?: string
  permissionId?: string | number
  type: string
  width?: number
  align: string
  fixed: string
  ellipsis: string
  formatter: string
  attr: string
  remark: string
  index?: number
}

const TABLE_PERMISSION_TYPE = 3

const TABLE_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '图片', value: 'image' },
  { label: '链接', value: 'link' },
  { label: '标签', value: 'tag' },
  { label: '开关', value: 'switch' },
  { label: '插槽', value: 'slot' },
]

const ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const FIXED_OPTIONS = [
  { label: '左侧固定', value: 'left' },
  { label: '右侧固定', value: 'right' },
]

const ELLIPSIS_OPTIONS = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
]

const formatBooleanText = (value?: boolean | string | null) => {
  if (value === true || value === 'true') return '是'
  if (value === false || value === 'false') return '否'
  return '-'
}

const formatOptionText = (
  value: string | undefined,
  options: Array<{ label: string; value: string }>,
) => options.find((item) => item.value === value)?.label ?? '-'

const usePermissionTable = (
  externalPermissionId?: MaybeRef<string | number | null | undefined>,
) => {
  const { currentPermission } =
    externalPermissionId === undefined ? usePermissionManager() : { currentPermission: null }

  const permissionId = computed(() => {
    const rawId =
      externalPermissionId === undefined
        ? currentPermission?.value?.id
        : unref(externalPermissionId)
    return rawId ? String(rawId) : ''
  })

  const tableSearchFormModel = ref<TableSearchFormModel>({
    permissionName: '',
    permissionCode: '',
  })
  const tableLoading = ref(false)
  const tableRecords = ref<SysPermissionData[]>([])
  const tablePageNo = ref(1)
  const tablePageSize = ref(10)
  const tableTotal = ref(0)
  const tableSourceRecords = ref<SysPermissionData[]>([])
  const checkedTableKeys = ref<Array<string | number>>([])

  const tableModalVisible = ref(false)
  const tableModalLoading = ref(false)
  const tableSubmitLoading = ref(false)
  const tableFormRef = ref<{ validate: () => Promise<void> } | null>(null)

  const currentTable = ref<SysPermissionData | null>(null)
  const schemaDrawerVisible = ref(false)
  const schemaDrawerLoading = ref(false)
  const schemaSearchFormModel = ref<SchemaSearchFormModel>({
    title: '',
    key: '',
  })
  const schemaRecords = ref<SysTableSchemaData[]>([])
  const schemaSourceRecords = ref<SysTableSchemaData[]>([])
  const checkedSchemaKeys = ref<Array<string | number>>([])

  const schemaModalVisible = ref(false)
  const schemaModalLoading = ref(false)
  const schemaSubmitLoading = ref(false)
  const schemaFormRef = ref<{ validate: () => Promise<void> } | null>(null)

  const createInitialTableFormModel = (): TableFormModel => ({
    pid: permissionId.value || undefined,
    permissionType: TABLE_PERMISSION_TYPE,
    permissionName: '',
    permissionCode: '',
    component: '',
    visible: true,
    index: undefined,
    remark: '',
  })

  const createInitialSchemaFormModel = (): SchemaFormModel => ({
    permissionId: currentTable.value?.id,
    type: 'text',
    key: '',
    title: '',
    width: undefined,
    align: '',
    fixed: '',
    ellipsis: 'false',
    formatter: '',
    attr: '',
    index: undefined,
    remark: '',
  })

  const tableFormModel = ref<TableFormModel>(createInitialTableFormModel())
  const schemaFormModel = ref<SchemaFormModel>(createInitialSchemaFormModel())

  const tableRules: FormRules = {
    permissionName: [{ required: true, message: '请输入表格名称', trigger: ['input', 'blur'] }],
    permissionCode: [{ required: true, message: '请输入表格编码', trigger: ['input', 'blur'] }],
  }

  const schemaRules: FormRules = {
    key: [{ required: true, message: '请输入字段 key', trigger: ['input', 'blur'] }],
    title: [{ required: true, message: '请输入列表头标题', trigger: ['input', 'blur'] }],
  }

  const tableModalTitle = computed(() =>
    tableFormModel.value.id ? '编辑表格资源' : '新增表格资源',
  )
  const schemaDrawerTitle = computed(() =>
    currentTable.value?.permissionName ? `字段列：${currentTable.value.permissionName}` : '字段列',
  )
  const schemaModalTitle = computed(() => (schemaFormModel.value.id ? '编辑字段列' : '新增字段列'))

  const tableTableSchemas: DynamicTableSchema<SysPermissionData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '表格名称', key: 'permissionName', dataKey: 'permissionName', width: 120 },
    { title: '表格编码', key: 'permissionCode', dataKey: 'permissionCode', width: 120 },
    { title: '创建时间', key: 'createTime', dataKey: 'createTime', width: 170 },
    { title: '备注', key: 'remark', dataKey: 'remark', minWidth: 120 },
    { title: '操作', key: 'action', type: 'slot', width: 200, fixed: 'right' },
  ]

  const schemaTableSchemas: DynamicTableSchema<SysTableSchemaData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '表头标题', key: 'title', dataKey: 'title', minWidth: 160 },
    { title: '字段 key', key: 'key', dataKey: 'key', minWidth: 160 },
    {
      title: '类型',
      key: 'type',
      dataKey: 'type',
      width: 100,
      formatter: (value) => formatOptionText(String(value ?? ''), TABLE_TYPE_OPTIONS),
    },
    { title: '宽度', key: 'width', dataKey: 'width', width: 90, emptyText: '-' },
    {
      title: '对齐',
      key: 'align',
      dataKey: 'align',
      width: 90,
      formatter: (value) => formatOptionText(String(value ?? ''), ALIGN_OPTIONS),
    },
    {
      title: '固定',
      key: 'fixed',
      dataKey: 'fixed',
      width: 100,
      formatter: (value) => formatOptionText(String(value ?? ''), FIXED_OPTIONS),
    },
    {
      title: '省略',
      key: 'ellipsis',
      dataKey: 'ellipsis',
      width: 90,
      formatter: (value) => formatBooleanText(value as string | null),
    },
    { title: '操作', key: 'action', type: 'slot', width: 140, fixed: 'right' },
  ]

  const tableSearchFormSchemas: DynamicFormSchema<TableSearchFormModel>[] = [
    {
      type: 'input',
      key: 'permissionName',
      dataKey: 'permissionName',
      placeholder: '请输入表格名称',
      span: 8,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'permissionCode',
      dataKey: 'permissionCode',
      placeholder: '请输入表格编码',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const schemaSearchFormSchemas: DynamicFormSchema<SchemaSearchFormModel>[] = [
    {
      type: 'input',
      key: 'title',
      dataKey: 'title',
      placeholder: '请输入表头标题',
      span: 8,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'key',
      dataKey: 'key',
      placeholder: '请输入字段 key',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const tableFormSchemas: DynamicFormSchema<TableFormModel>[] = [
    {
      type: 'input',
      key: 'permissionName',
      dataKey: 'permissionName',
      label: '表格名称',
      labelPosition: 'left',
      placeholder: '请输入表格名称',
      prop: { clearable: true, maxlength: 100 },
    },
    {
      type: 'input',
      key: 'permissionCode',
      dataKey: 'permissionCode',
      label: '表格编码',
      labelPosition: 'left',
      placeholder: '请输入表格编码',
      prop: { clearable: true, maxlength: 200 },
    },
    {
      type: 'input-number',
      key: 'index',
      dataKey: 'index',
      label: '排序',
      labelPosition: 'left',
      placeholder: '排序',
      prop: { clearable: true, maxlength: 200 },
    },
    {
      type: 'textarea',
      key: 'remark',
      dataKey: 'remark',
      label: '备注',
      labelPosition: 'left',
      placeholder: '请输入备注',
      prop: {
        clearable: true,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
  ]

  const schemaFormSchemas: DynamicFormSchema<SchemaFormModel>[] = [
    {
      type: 'select',
      key: 'type',
      dataKey: 'type',
      label: '列类型',
      labelPosition: 'left',
      placeholder: '请选择列类型',
      span: 12,
      prop: { clearable: true, options: TABLE_TYPE_OPTIONS },
    },
    {
      type: 'input',
      key: 'key',
      dataKey: 'key',
      label: '字段 key',
      labelPosition: 'left',
      placeholder: '例如 userName',
      span: 12,
      prop: { clearable: true, maxlength: 120 },
    },
    {
      type: 'input',
      key: 'title',
      dataKey: 'title',
      label: '表头标题',
      labelPosition: 'left',
      placeholder: '请输入表头标题',
      span: 12,
      prop: { clearable: true, maxlength: 120 },
    },
    {
      type: 'input-number',
      key: 'width',
      dataKey: 'width',
      label: '列宽',
      labelPosition: 'left',
      placeholder: '请输入列宽',
      span: 12,
      prop: { clearable: true, min: 0, precision: 0 },
    },
    {
      type: 'select',
      key: 'align',
      dataKey: 'align',
      label: '对齐方式',
      labelPosition: 'left',
      placeholder: '请选择对齐方式',
      span: 12,
      prop: { clearable: true, options: ALIGN_OPTIONS },
    },
    {
      type: 'select',
      key: 'fixed',
      dataKey: 'fixed',
      label: '固定位置',
      labelPosition: 'left',
      placeholder: '请选择固定位置',
      span: 12,
      prop: { clearable: true, options: FIXED_OPTIONS },
    },
    {
      type: 'select',
      key: 'ellipsis',
      dataKey: 'ellipsis',
      label: '是否省略',
      labelPosition: 'left',
      placeholder: '请选择是否省略',
      span: 12,
      prop: { clearable: true, options: ELLIPSIS_OPTIONS },
    },
    {
      type: 'input-number',
      key: 'index',
      dataKey: 'index',
      label: '排序',
      labelPosition: 'left',
      placeholder: '排序',
      span: 12,
      prop: { clearable: true, maxlength: 200 },
    },
    {
      type: 'input',
      key: 'formatter',
      dataKey: 'formatter',
      label: '格式化器',
      labelPosition: 'left',
      placeholder: '请输入格式化表达式',
      span: 24,
      prop: { clearable: true, maxlength: 500 },
    },
    {
      type: 'textarea',
      key: 'attr',
      dataKey: 'attr',
      label: '附加属性',
      labelPosition: 'left',
      placeholder: '请输入附加属性 JSON 或配置',
      span: 24,
      prop: {
        clearable: true,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
    {
      type: 'textarea',
      key: 'remark',
      dataKey: 'remark',
      label: '备注',
      labelPosition: 'left',
      placeholder: '请输入备注',
      span: 24,
      prop: {
        clearable: true,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
  ]

  const applyTableFilter = () => {
    const nameKeyword = tableSearchFormModel.value.permissionName.trim().toLowerCase()
    const codeKeyword = tableSearchFormModel.value.permissionCode.trim().toLowerCase()

    tableRecords.value = tableSourceRecords.value.filter((item) => {
      const matchedName = !nameKeyword
        ? true
        : String(item.permissionName ?? '')
            .toLowerCase()
            .includes(nameKeyword)
      const matchedCode = !codeKeyword
        ? true
        : String(item.permissionCode ?? '')
            .toLowerCase()
            .includes(codeKeyword)
      return matchedName && matchedCode
    })

    checkedTableKeys.value = checkedTableKeys.value.filter((key) =>
      tableRecords.value.some((item) => String(item.id) === String(key)),
    )
  }

  const applySchemaFilter = () => {
    const titleKeyword = schemaSearchFormModel.value.title.trim().toLowerCase()
    const keyKeyword = schemaSearchFormModel.value.key.trim().toLowerCase()

    schemaRecords.value = schemaSourceRecords.value.filter((item) => {
      const matchedTitle = !titleKeyword
        ? true
        : String(item.title ?? '')
            .toLowerCase()
            .includes(titleKeyword)
      const matchedKey = !keyKeyword
        ? true
        : String(item.key ?? '')
            .toLowerCase()
            .includes(keyKeyword)
      return matchedTitle && matchedKey
    })

    checkedSchemaKeys.value = checkedSchemaKeys.value.filter((key) =>
      schemaRecords.value.some((item) => String(item.id) === String(key)),
    )
  }

  const syncCurrentTable = () => {
    if (!currentTable.value?.id) {
      return
    }

    const matched = tableSourceRecords.value.find(
      (item) => String(item.id) === String(currentTable.value?.id),
    )

    if (!matched) {
      closeSchemaDrawer()
      return
    }

    currentTable.value = matched
  }

  const handleTablePageChange = async (pageNo: number) => {
    tablePageNo.value = pageNo
    await loadTables()
  }

  const handleTablePageSizeChange = async (pageSize: number) => {
    tablePageNo.value = 1
    tablePageSize.value = pageSize
    await loadTables()
  }

  const loadTables = async () => {
    if (!permissionId.value) {
      tableSourceRecords.value = []
      tableRecords.value = []
      checkedTableKeys.value = []
      return
    }

    tableLoading.value = true

    try {
      const result = await sysTableSchemaApi.pageTables({
        permissionId: permissionId.value,
        pageNo: tablePageNo.value,
        pageSize: tablePageSize.value
      })
      tableSourceRecords.value = result.records
      tablePageNo.value = result.pageNo
      tablePageSize.value = result.pageSize
      tableTotal.value = result.total ?? result.records.length
      applyTableFilter()
      syncCurrentTable()
    } catch (error) {
      console.error(error)
      tableSourceRecords.value = []
      tableRecords.value = []
      checkedTableKeys.value = []
    } finally {
      tableLoading.value = false
    }
  }

  const loadSchemas = async () => {
    if (!currentTable.value?.id) {
      schemaSourceRecords.value = []
      schemaRecords.value = []
      checkedSchemaKeys.value = []
      return
    }

    schemaDrawerLoading.value = true

    try {
      const result = await sysTableSchemaApi.listSchemas({
        permissionId: currentTable.value.id,
      })
      schemaSourceRecords.value = result
      applySchemaFilter()
    } catch (error) {
      console.error(error)
      schemaSourceRecords.value = []
      schemaRecords.value = []
      checkedSchemaKeys.value = []
    } finally {
      schemaDrawerLoading.value = false
    }
  }

  const handleTableSearch = async () => {
    applyTableFilter()
  }

  const resetTableSearch = async () => {
    tableSearchFormModel.value = {
      permissionName: '',
      permissionCode: '',
    }
    applyTableFilter()
  }

  const openCreateTable = () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    tableFormModel.value = createInitialTableFormModel()
    tableModalVisible.value = true
  }

  const openEditTable = async (tableId: string | number) => {
    tableModalVisible.value = true
    tableModalLoading.value = true

    try {
      const result = await sysPermissionApi.queryById(tableId)
      tableFormModel.value = {
        id: result.id,
        pid: result.pid,
        permissionType: result.permissionType ?? TABLE_PERMISSION_TYPE,
        permissionName: result.permissionName ?? '',
        permissionCode: result.permissionCode ?? '',
        component: result.component ?? '',
        visible: result.visible ?? true,
        index: result.index,
        remark: result.remark ?? '',
      }
    } catch (error) {
      console.error(error)
      tableModalVisible.value = false
    } finally {
      tableModalLoading.value = false
    }
  }

  const closeTableModal = () => {
    tableModalVisible.value = false
    tableModalLoading.value = false
    tableSubmitLoading.value = false
    tableFormModel.value = createInitialTableFormModel()
  }

  const submitTable = async () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    await tableFormRef.value?.validate()
    tableSubmitLoading.value = true

    try {
      await sysPermissionApi.upsert({
        id: tableFormModel.value.id,
        pid: permissionId.value,
        permissionType: TABLE_PERMISSION_TYPE,
        permissionName: tableFormModel.value.permissionName.trim(),
        permissionCode: tableFormModel.value.permissionCode.trim(),
        component: tableFormModel.value.component.trim(),
        visible: tableFormModel.value.visible,
        index: tableFormModel.value.index,
        remark: tableFormModel.value.remark.trim(),
      })
      closeTableModal()
      await loadTables()
      if (schemaDrawerVisible.value) {
        await loadSchemas()
      }
    } catch (error) {
      console.error(error)
    } finally {
      tableSubmitLoading.value = false
    }
  }

  const confirmDeleteTables = (ids: Array<string | number>) => {
    dialog.warning({
      title: '删除确认',
      content: '确定删除选中的表格资源吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysPermissionApi.deleteByIds(ids)
          checkedTableKeys.value = checkedTableKeys.value.filter(
            (key) => !ids.some((id) => String(id) === String(key)),
          )
          if (
            currentTable.value?.id &&
            ids.some((id) => String(id) === String(currentTable.value?.id))
          ) {
            closeSchemaDrawer()
          }
          await loadTables()
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleDeleteTable = (tableId?: string | number) => {
    if (!tableId) return
    confirmDeleteTables([tableId])
  }

  const handleBatchDeleteTables = () => {
    if (!checkedTableKeys.value.length) {
      message.warning('请先选择要删除的表格资源')
      return
    }
    confirmDeleteTables(checkedTableKeys.value)
  }

  const openSchemaDrawer = async (table: SysPermissionData) => {
    currentTable.value = table
    schemaSearchFormModel.value = {
      title: '',
      key: '',
    }
    checkedSchemaKeys.value = []
    schemaDrawerVisible.value = true
    await loadSchemas()
  }

  const closeSchemaDrawer = () => {
    schemaDrawerVisible.value = false
    schemaDrawerLoading.value = false
    schemaSearchFormModel.value = {
      title: '',
      key: '',
    }
    schemaSourceRecords.value = []
    schemaRecords.value = []
    checkedSchemaKeys.value = []
    currentTable.value = null
  }

  const handleSchemaSearch = async () => {
    applySchemaFilter()
  }

  const resetSchemaSearch = async () => {
    schemaSearchFormModel.value = {
      title: '',
      key: '',
    }
    applySchemaFilter()
  }

  const openCreateSchema = () => {
    if (!currentTable.value?.id) {
      message.warning('请先选择表格资源')
      return
    }

    schemaFormModel.value = createInitialSchemaFormModel()
    schemaModalVisible.value = true
  }

  const openEditSchema = async (schemaId: string | number) => {
    schemaModalVisible.value = true
    schemaModalLoading.value = true

    try {
      const result = await sysTableSchemaApi.queryById(schemaId)
      schemaFormModel.value = {
        id: result.id,
        permissionId: result.permissionId ?? currentTable.value?.id,
        type: result.type ?? 'text',
        key: result.key ?? '',
        title: result.title ?? '',
        width: result.width,
        align: result.align ?? '',
        fixed: result.fixed ?? '',
        ellipsis: result.ellipsis ?? 'false',
        formatter: result.formatter ?? '',
        attr: result.attr ?? '',
        remark: result.remark ?? '',
      }
    } catch (error) {
      console.error(error)
      schemaModalVisible.value = false
    } finally {
      schemaModalLoading.value = false
    }
  }

  const closeSchemaModal = () => {
    schemaModalVisible.value = false
    schemaModalLoading.value = false
    schemaSubmitLoading.value = false
    schemaFormModel.value = createInitialSchemaFormModel()
  }

  const submitSchema = async () => {
    if (!currentTable.value?.id) {
      message.warning('请先选择表格资源')
      return
    }

    await schemaFormRef.value?.validate()
    schemaSubmitLoading.value = true

    try {
      await sysTableSchemaApi.upsert({
        id: schemaFormModel.value.id,
        permissionId: currentTable.value.id,
        type: schemaFormModel.value.type.trim(),
        key: schemaFormModel.value.key.trim(),
        title: schemaFormModel.value.title.trim(),
        width: schemaFormModel.value.width,
        align: schemaFormModel.value.align.trim(),
        fixed: schemaFormModel.value.fixed.trim(),
        ellipsis: schemaFormModel.value.ellipsis.trim(),
        formatter: schemaFormModel.value.formatter.trim(),
        attr: schemaFormModel.value.attr.trim(),
        index: schemaFormModel.value.index,
        remark: schemaFormModel.value.remark.trim(),
      })
      closeSchemaModal()
      await loadSchemas()
    } catch (error) {
      console.error(error)
    } finally {
      schemaSubmitLoading.value = false
    }
  }

  const confirmDeleteSchemas = (ids: Array<string | number>) => {
    dialog.warning({
      title: '删除确认',
      content: '确定删除选中的字段列吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysTableSchemaApi.deleteByIds(ids)
          checkedSchemaKeys.value = checkedSchemaKeys.value.filter(
            (key) => !ids.some((id) => String(id) === String(key)),
          )
          await loadSchemas()
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleDeleteSchema = (schemaId?: string | number) => {
    if (!schemaId) return
    confirmDeleteSchemas([schemaId])
  }

  const handleBatchDeleteSchemas = () => {
    if (!checkedSchemaKeys.value.length) {
      message.warning('请先选择要删除的字段列')
      return
    }
    confirmDeleteSchemas(checkedSchemaKeys.value)
  }

  watch(
    permissionId,
    async () => {
      tableSearchFormModel.value = {
        permissionName: '',
        permissionCode: '',
      }
      checkedTableKeys.value = []
      closeSchemaDrawer()
      await loadTables()
    },
    { immediate: true },
  )

  return {
    permissionId,
    tableSearchFormModel,
    tableLoading,
    tableRecords,
    tablePageNo,
    tablePageSize,
    tableTotal,
    checkedTableKeys,
    tableModalVisible,
    tableModalLoading,
    tableSubmitLoading,
    tableFormRef,
    tableFormModel,
    currentTable,
    schemaDrawerVisible,
    schemaDrawerLoading,
    schemaSearchFormModel,
    schemaRecords,
    checkedSchemaKeys,
    schemaModalVisible,
    schemaModalLoading,
    schemaSubmitLoading,
    schemaFormRef,
    schemaFormModel,
    tableRules,
    schemaRules,
    tableModalTitle,
    schemaDrawerTitle,
    schemaModalTitle,
    tableTableSchemas,
    schemaTableSchemas,
    tableSearchFormSchemas,
    schemaSearchFormSchemas,
    tableFormSchemas,
    schemaFormSchemas,
    handleTableSearch,
    resetTableSearch,
    handleTablePageChange,
    handleTablePageSizeChange,
    openCreateTable,
    openEditTable,
    closeTableModal,
    submitTable,
    handleDeleteTable,
    handleBatchDeleteTables,
    openSchemaDrawer,
    closeSchemaDrawer,
    handleSchemaSearch,
    resetSchemaSearch,
    openCreateSchema,
    openEditSchema,
    closeSchemaModal,
    submitSchema,
    handleDeleteSchema,
    handleBatchDeleteSchemas,
  }
}

export default usePermissionTable
