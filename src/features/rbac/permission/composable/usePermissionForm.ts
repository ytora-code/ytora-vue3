import { computed, ref, unref, watch, type MaybeRef } from 'vue'
import type { FormRules } from 'naive-ui'

import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import sysPermissionApi from '../api/SysPermissionApi'
import sysFormSchemaApi from '../api/SysFormSchemaApi'
import usePermissionManager from './usePermissionManager'
import type SysPermissionData from '../type/SysPermissionData'
import type SysPermissionParam from '../type/SysPermissionParam'
import type SysFormSchemaData from '../type/SysFormSchemaData'
import { dialog, message } from '@/utils/naiveApi'

type FormSearchFormModel = {
  permissionName: string
  permissionCode: string
}

type SchemaSearchFormModel = {
  label: string
  key: string
}

type FormResourceModel = Required<Pick<SysPermissionParam, 'permissionName' | 'permissionCode'>> & {
  id?: string
  pid?: string
  permissionType: number
  remark: string
}

type FormSchemaModel = {
  id?: string
  permissionId?: string | number
  type: string
  label: string
  labelPosition: 'left' | 'top' | ''
  labelWidth?: number
  size: 'small' | 'medium' | 'large' | ''
  placeholder: string
  key: string
  dictCode: string
  hidden: boolean
  disabled: boolean
  defaultValue: string
  attr: string
  remark: string
}

const FORM_PERMISSION_TYPE = 4

const FORM_ITEM_TYPE_OPTIONS = [
  { label: '输入框', value: 'input' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字输入', value: 'input-number' },
  { label: '下拉选择', value: 'select' },
  { label: '字典选择', value: 'dict' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '开关', value: 'switch' },
  { label: '日期选择', value: 'date-picker' },
]

const LABEL_POSITION_OPTIONS = [
  { label: '左侧', value: 'left' },
  { label: '顶部', value: 'top' },
]

const SIZE_OPTIONS = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' },
]

const formatOptionText = (
  value: string | undefined,
  options: Array<{ label: string; value: string }>,
) => options.find((item) => item.value === value)?.label ?? '-'

const formatBooleanText = (value?: boolean | null) => {
  if (value === true) return '是'
  if (value === false) return '否'
  return '-'
}

const usePermissionForm = (externalPermissionId?: MaybeRef<string | number | null | undefined>) => {
  const { currentPermission } =
    externalPermissionId === undefined ? usePermissionManager() : { currentPermission: null }

  const permissionId = computed(() => {
    const rawId =
      externalPermissionId === undefined
        ? currentPermission?.value?.id
        : unref(externalPermissionId)
    return rawId ? String(rawId) : ''
  })

  const formSearchFormModel = ref<FormSearchFormModel>({
    permissionName: '',
    permissionCode: '',
  })
  const formLoading = ref(false)
  const formRecords = ref<SysPermissionData[]>([])
  const formSourceRecords = ref<SysPermissionData[]>([])
  const checkedFormKeys = ref<Array<string | number>>([])

  const formModalVisible = ref(false)
  const formModalLoading = ref(false)
  const formSubmitLoading = ref(false)
  const formFormRef = ref<{ validate: () => Promise<void> } | null>(null)

  const currentForm = ref<SysPermissionData | null>(null)
  const schemaDrawerVisible = ref(false)
  const schemaDrawerLoading = ref(false)
  const schemaSearchFormModel = ref<SchemaSearchFormModel>({
    label: '',
    key: '',
  })
  const schemaRecords = ref<SysFormSchemaData[]>([])
  const schemaSourceRecords = ref<SysFormSchemaData[]>([])
  const checkedSchemaKeys = ref<Array<string | number>>([])

  const schemaModalVisible = ref(false)
  const schemaModalLoading = ref(false)
  const schemaSubmitLoading = ref(false)
  const schemaFormRef = ref<{ validate: () => Promise<void> } | null>(null)

  const createInitialFormModel = (): FormResourceModel => ({
    pid: permissionId.value || undefined,
    permissionType: FORM_PERMISSION_TYPE,
    permissionName: '',
    permissionCode: '',
    remark: '',
  })

  const createInitialSchemaFormModel = (): FormSchemaModel => ({
    permissionId: currentForm.value?.id,
    type: 'input',
    label: '',
    labelPosition: '',
    labelWidth: undefined,
    size: '',
    placeholder: '',
    key: '',
    dictCode: '',
    hidden: false,
    disabled: false,
    defaultValue: '',
    attr: '',
    remark: '',
  })

  const formFormModel = ref<FormResourceModel>(createInitialFormModel())
  const schemaFormModel = ref<FormSchemaModel>(createInitialSchemaFormModel())

  const formRules: FormRules = {
    permissionName: [{ required: true, message: '请输入表单名称', trigger: ['input', 'blur'] }],
    permissionCode: [{ required: true, message: '请输入表单编码', trigger: ['input', 'blur'] }],
  }

  const schemaRules: FormRules = {
    type: [{ required: true, message: '请选择表单项类型', trigger: ['change', 'blur'] }],
    label: [{ required: true, message: '请输入表单项标题', trigger: ['input', 'blur'] }],
    key: [{ required: true, message: '请输入数据 key', trigger: ['input', 'blur'] }],
  }

  const formModalTitle = computed(() => (formFormModel.value.id ? '编辑表单资源' : '新增表单资源'))
  const schemaDrawerTitle = computed(() =>
    currentForm.value?.permissionName ? `表单项：${currentForm.value.permissionName}` : '表单项',
  )
  const schemaModalTitle = computed(() => (schemaFormModel.value.id ? '编辑表单项' : '新增表单项'))

  const formTableSchemas: DynamicTableSchema<SysPermissionData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '表单名称', key: 'permissionName', dataKey: 'permissionName', width: 120 },
    { title: '表单编码', key: 'permissionCode', dataKey: 'permissionCode', width: 120 },
    { title: '创建时间', key: 'createTime', dataKey: 'createTime', width: 170 },
    { title: '备注', key: 'remark', dataKey: 'remark', minWidth: 120 },
    { title: '操作', key: 'action', type: 'slot', width: 200, fixed: 'right' },
  ]

  const schemaTableSchemas: DynamicTableSchema<SysFormSchemaData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    { title: '标题', key: 'label', dataKey: 'label', minWidth: 140 },
    { title: '字段 key', key: 'key', dataKey: 'key', minWidth: 140 },
    {
      title: '类型',
      key: 'type',
      dataKey: 'type',
      width: 110,
      formatter: (value) => formatOptionText(String(value ?? ''), FORM_ITEM_TYPE_OPTIONS),
    },
    {
      title: '标题位置',
      key: 'labelPosition',
      dataKey: 'labelPosition',
      width: 100,
      formatter: (value) => formatOptionText(String(value ?? ''), LABEL_POSITION_OPTIONS),
    },
    { title: '标题宽度', key: 'labelWidth', dataKey: 'labelWidth', width: 100, emptyText: '-' },
    {
      title: '尺寸',
      key: 'size',
      dataKey: 'size',
      width: 90,
      formatter: (value) => formatOptionText(String(value ?? ''), SIZE_OPTIONS),
    },
    {
      title: '隐藏',
      key: 'hidden',
      dataKey: 'hidden',
      width: 80,
      formatter: (value) => formatBooleanText(value as boolean | null),
    },
    {
      title: '禁用',
      key: 'disabled',
      dataKey: 'disabled',
      width: 80,
      formatter: (value) => formatBooleanText(value as boolean | null),
    },
    { title: '操作', key: 'action', type: 'slot', width: 140, fixed: 'right' },
  ]

  const formSearchFormSchemas: DynamicFormSchema<FormSearchFormModel>[] = [
    {
      type: 'input',
      key: 'permissionName',
      dataKey: 'permissionName',
      placeholder: '请输入表单名称',
      span: 8,
      prop: { clearable: true },
    },
    {
      type: 'input',
      key: 'permissionCode',
      dataKey: 'permissionCode',
      placeholder: '请输入表单编码',
      span: 8,
      prop: { clearable: true },
    },
  ]

  const schemaSearchFormSchemas: DynamicFormSchema<SchemaSearchFormModel>[] = [
    {
      type: 'input',
      key: 'label',
      dataKey: 'label',
      placeholder: '请输入表单项标题',
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

  const formFormSchemas: DynamicFormSchema<FormResourceModel>[] = [
    {
      type: 'input',
      key: 'permissionName',
      dataKey: 'permissionName',
      label: '表单名称',
      labelPosition: 'left',
      placeholder: '请输入表单名称',
      span: 12,
      prop: { clearable: true, maxlength: 100 },
    },
    {
      type: 'input',
      key: 'permissionCode',
      dataKey: 'permissionCode',
      label: '表单编码',
      labelPosition: 'left',
      placeholder: '请输入表单编码',
      span: 12,
      prop: { clearable: true, maxlength: 200 },
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

  const schemaFormSchemas: DynamicFormSchema<FormSchemaModel>[] = [
    {
      type: 'select',
      key: 'type',
      dataKey: 'type',
      label: '表单项类型',
      labelPosition: 'left',
      placeholder: '请选择表单项类型',
      span: 12,
      prop: { clearable: true, options: FORM_ITEM_TYPE_OPTIONS },
    },
    {
      type: 'input',
      key: 'label',
      dataKey: 'label',
      label: '表单项标题',
      labelPosition: 'left',
      placeholder: '请输入表单项标题',
      span: 12,
      prop: { clearable: true, maxlength: 120 },
    },
    {
      type: 'input',
      key: 'key',
      dataKey: 'key',
      label: '数据 key',
      labelPosition: 'left',
      placeholder: '例如 userName',
      span: 12,
      prop: { clearable: true, maxlength: 120 },
    },
    {
      type: 'input',
      key: 'placeholder',
      dataKey: 'placeholder',
      label: '提示语',
      labelPosition: 'left',
      placeholder: '请输入 placeholder',
      span: 12,
      prop: { clearable: true, maxlength: 200 },
    },
    {
      type: 'select',
      key: 'labelPosition',
      dataKey: 'labelPosition',
      label: '标题位置',
      labelPosition: 'left',
      placeholder: '请选择标题位置',
      span: 12,
      prop: { clearable: true, options: LABEL_POSITION_OPTIONS },
    },
    {
      type: 'input-number',
      key: 'labelWidth',
      dataKey: 'labelWidth',
      label: '标题宽度',
      labelPosition: 'left',
      placeholder: '请输入标题宽度',
      span: 12,
      prop: { clearable: true, min: 0, precision: 0 },
    },
    {
      type: 'select',
      key: 'size',
      dataKey: 'size',
      label: '尺寸',
      labelPosition: 'left',
      placeholder: '请选择尺寸',
      span: 12,
      prop: { clearable: true, options: SIZE_OPTIONS },
    },
    {
      type: 'input',
      key: 'dictCode',
      dataKey: 'dictCode',
      label: '字典编码',
      labelPosition: 'left',
      placeholder: '字典类型时填写',
      span: 12,
      prop: { clearable: true, maxlength: 120 },
    },
    {
      type: 'switch',
      key: 'hidden',
      dataKey: 'hidden',
      label: '是否隐藏',
      labelPosition: 'left',
      span: 12,
    },
    {
      type: 'switch',
      key: 'disabled',
      dataKey: 'disabled',
      label: '是否禁用',
      labelPosition: 'left',
      span: 12,
    },
    {
      type: 'input',
      key: 'defaultValue',
      dataKey: 'defaultValue',
      label: '默认值',
      labelPosition: 'left',
      placeholder: '请输入默认值',
      span: 24,
      prop: { clearable: true, maxlength: 200 },
    },
    {
      type: 'textarea',
      key: 'attr',
      dataKey: 'attr',
      label: '附加属性',
      labelPosition: 'left',
      placeholder: '请输入 attr JSON 或配置',
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

  const applyFormFilter = () => {
    const nameKeyword = formSearchFormModel.value.permissionName.trim().toLowerCase()
    const codeKeyword = formSearchFormModel.value.permissionCode.trim().toLowerCase()

    formRecords.value = formSourceRecords.value.filter((item) => {
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

    checkedFormKeys.value = checkedFormKeys.value.filter((key) =>
      formRecords.value.some((item) => String(item.id) === String(key)),
    )
  }

  const applySchemaFilter = () => {
    const labelKeyword = schemaSearchFormModel.value.label.trim().toLowerCase()
    const keyKeyword = schemaSearchFormModel.value.key.trim().toLowerCase()

    schemaRecords.value = schemaSourceRecords.value.filter((item) => {
      const matchedLabel = !labelKeyword
        ? true
        : String(item.label ?? '')
            .toLowerCase()
            .includes(labelKeyword)
      const matchedKey = !keyKeyword
        ? true
        : String(item.key ?? '')
            .toLowerCase()
            .includes(keyKeyword)
      return matchedLabel && matchedKey
    })

    checkedSchemaKeys.value = checkedSchemaKeys.value.filter((key) =>
      schemaRecords.value.some((item) => String(item.id) === String(key)),
    )
  }

  const syncCurrentForm = () => {
    if (!currentForm.value?.id) {
      return
    }

    const matched = formSourceRecords.value.find(
      (item) => String(item.id) === String(currentForm.value?.id),
    )

    if (!matched) {
      closeSchemaDrawer()
      return
    }

    currentForm.value = matched
  }

  const loadForms = async () => {
    if (!permissionId.value) {
      formSourceRecords.value = []
      formRecords.value = []
      checkedFormKeys.value = []
      return
    }

    formLoading.value = true

    try {
      const result = await sysFormSchemaApi.listForms(permissionId.value)
      formSourceRecords.value = result
      applyFormFilter()
      syncCurrentForm()
    } catch (error) {
      console.error(error)
      formSourceRecords.value = []
      formRecords.value = []
      checkedFormKeys.value = []
    } finally {
      formLoading.value = false
    }
  }

  const loadSchemas = async () => {
    if (!currentForm.value?.id) {
      schemaSourceRecords.value = []
      schemaRecords.value = []
      checkedSchemaKeys.value = []
      return
    }

    schemaDrawerLoading.value = true

    try {
      const result = await sysFormSchemaApi.listSchemas({
        permissionId: currentForm.value.id,
        pageNo: 1,
        pageSize: 999,
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

  const handleFormSearch = async () => {
    applyFormFilter()
  }

  const resetFormSearch = async () => {
    formSearchFormModel.value = {
      permissionName: '',
      permissionCode: '',
    }
    applyFormFilter()
  }

  const openCreateForm = () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    formFormModel.value = createInitialFormModel()
    formModalVisible.value = true
  }

  const openEditForm = async (formId: string | number) => {
    formModalVisible.value = true
    formModalLoading.value = true

    try {
      const result = await sysPermissionApi.queryById(formId)
      formFormModel.value = {
        id: result.id,
        pid: result.pid,
        permissionType: result.permissionType ?? FORM_PERMISSION_TYPE,
        permissionName: result.permissionName ?? '',
        permissionCode: result.permissionCode ?? '',
        remark: result.remark ?? '',
      }
    } catch (error) {
      console.error(error)
      formModalVisible.value = false
    } finally {
      formModalLoading.value = false
    }
  }

  const closeFormModal = () => {
    formModalVisible.value = false
    formModalLoading.value = false
    formSubmitLoading.value = false
    formFormModel.value = createInitialFormModel()
  }

  const submitForm = async () => {
    if (!permissionId.value) {
      message.warning('请先选择资源')
      return
    }

    await formFormRef.value?.validate()
    formSubmitLoading.value = true

    try {
      await sysPermissionApi.upsert({
        id: formFormModel.value.id,
        pid: permissionId.value,
        permissionType: FORM_PERMISSION_TYPE,
        permissionName: formFormModel.value.permissionName.trim(),
        permissionCode: formFormModel.value.permissionCode.trim(),
        remark: formFormModel.value.remark.trim(),
      })
      closeFormModal()
      await loadForms()
      if (schemaDrawerVisible.value) {
        await loadSchemas()
      }
    } catch (error) {
      console.error(error)
    } finally {
      formSubmitLoading.value = false
    }
  }

  const confirmDeleteForms = (ids: Array<string | number>) => {
    dialog.warning({
      title: '删除确认',
      content: '确定删除选中的表单资源吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysPermissionApi.deleteByIds(ids)
          checkedFormKeys.value = checkedFormKeys.value.filter(
            (key) => !ids.some((id) => String(id) === String(key)),
          )
          if (
            currentForm.value?.id &&
            ids.some((id) => String(id) === String(currentForm.value?.id))
          ) {
            closeSchemaDrawer()
          }
          await loadForms()
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleDeleteForm = (formId?: string | number) => {
    if (!formId) return
    confirmDeleteForms([formId])
  }

  const handleBatchDeleteForms = () => {
    if (!checkedFormKeys.value.length) {
      message.warning('请先选择要删除的表单资源')
      return
    }
    confirmDeleteForms(checkedFormKeys.value)
  }

  const openSchemaDrawer = async (form: SysPermissionData) => {
    currentForm.value = form
    schemaSearchFormModel.value = {
      label: '',
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
      label: '',
      key: '',
    }
    schemaSourceRecords.value = []
    schemaRecords.value = []
    checkedSchemaKeys.value = []
    currentForm.value = null
  }

  const handleSchemaSearch = async () => {
    applySchemaFilter()
  }

  const resetSchemaSearch = async () => {
    schemaSearchFormModel.value = {
      label: '',
      key: '',
    }
    applySchemaFilter()
  }

  const openCreateSchema = () => {
    if (!currentForm.value?.id) {
      message.warning('请先选择表单资源')
      return
    }

    schemaFormModel.value = createInitialSchemaFormModel()
    schemaModalVisible.value = true
  }

  const openEditSchema = async (schemaId: string | number) => {
    schemaModalVisible.value = true
    schemaModalLoading.value = true

    try {
      const result = await sysFormSchemaApi.queryById(schemaId)
      schemaFormModel.value = {
        id: result.id,
        permissionId: result.permissionId ?? currentForm.value?.id,
        type: result.type ?? 'input',
        label: result.label ?? '',
        labelPosition:
          result.labelPosition === 'left' || result.labelPosition === 'top'
            ? result.labelPosition
            : '',
        labelWidth: result.labelWidth,
        size:
          result.size === 'small' || result.size === 'medium' || result.size === 'large'
            ? result.size
            : '',
        placeholder: result.placeholder ?? '',
        key: result.key ?? '',
        dictCode: result.dictCode ?? '',
        hidden: result.hidden ?? false,
        disabled: result.disabled ?? false,
        defaultValue: result.defaultValue ?? '',
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
    if (!currentForm.value?.id) {
      message.warning('请先选择表单资源')
      return
    }

    await schemaFormRef.value?.validate()
    schemaSubmitLoading.value = true

    try {
      await sysFormSchemaApi.upsert({
        id: schemaFormModel.value.id,
        permissionId: currentForm.value.id,
        type: schemaFormModel.value.type.trim(),
        label: schemaFormModel.value.label.trim(),
        labelPosition: schemaFormModel.value.labelPosition.trim(),
        labelWidth: schemaFormModel.value.labelWidth,
        size: schemaFormModel.value.size.trim(),
        placeholder: schemaFormModel.value.placeholder.trim(),
        key: schemaFormModel.value.key.trim(),
        dictCode: schemaFormModel.value.dictCode.trim(),
        hidden: schemaFormModel.value.hidden,
        disabled: schemaFormModel.value.disabled,
        defaultValue: schemaFormModel.value.defaultValue.trim(),
        attr: schemaFormModel.value.attr.trim(),
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
      content: '确定删除选中的表单项吗？删除后将无法恢复。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysFormSchemaApi.deleteByIds(ids)
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
      message.warning('请先选择要删除的表单项')
      return
    }
    confirmDeleteSchemas(checkedSchemaKeys.value)
  }

  watch(
    permissionId,
    async () => {
      formSearchFormModel.value = {
        permissionName: '',
        permissionCode: '',
      }
      checkedFormKeys.value = []
      closeSchemaDrawer()
      await loadForms()
    },
    { immediate: true },
  )

  return {
    permissionId,
    formSearchFormModel,
    formLoading,
    formRecords,
    checkedFormKeys,
    formModalVisible,
    formModalLoading,
    formSubmitLoading,
    formFormRef,
    formFormModel,
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
    formRules,
    schemaRules,
    formModalTitle,
    schemaDrawerTitle,
    schemaModalTitle,
    formTableSchemas,
    schemaTableSchemas,
    formSearchFormSchemas,
    schemaSearchFormSchemas,
    formFormSchemas,
    schemaFormSchemas,
    handleFormSearch,
    resetFormSearch,
    openCreateForm,
    openEditForm,
    closeFormModal,
    submitForm,
    handleDeleteForm,
    handleBatchDeleteForms,
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

export default usePermissionForm
