import { computed, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'

import sysDynamicApiExecApi from '../api/SysDynamicApiExecApi'
import type SysDynamicApiParam from '../type/SysDynamicApiParam'
import { message } from '@/utils/naiveApi'
import type { FormInstance } from './onlineApiShared'

type EditorTab = 'basic' | 'code'
type TestRow = Record<string, unknown>

interface UseOnlineApiEditorOptions {
  currentGroupId: Readonly<{ value: string }>
  drawerFormModel: Readonly<{ value: SysDynamicApiParam }>
  closeDrawer: () => void
  handleDrawerAfterLeave: () => void
  openCreateDrawer: () => void
  openEditDrawer: (id?: string | number) => Promise<void>
  submitDrawer: () => Promise<void>
}

const useOnlineApiEditor = ({
  currentGroupId,
  drawerFormModel,
  closeDrawer,
  handleDrawerAfterLeave,
  openCreateDrawer,
  openEditDrawer,
  submitDrawer,
}: UseOnlineApiEditorOptions) => {
  const basicFormRef = ref<FormInstance | null>(null)
  const codeFormRef = ref<FormInstance | null>(null)
  const editorActiveTab = ref<EditorTab>('basic')
  const testLoading = ref(false)
  const testResultRows = ref<TestRow[]>([])

  const contentModel = computed({
    get: () => drawerFormModel.value.content ?? '',
    set: (value: string) => {
      drawerFormModel.value.content = value
    },
  })

  const testParamModel = computed({
    get: () => drawerFormModel.value.testParam ?? '{\n  \n}',
    set: (value: string) => {
      drawerFormModel.value.testParam = value
    },
  })

  const testResultColumns = computed<DataTableColumns<TestRow>>(() => {
    const keySet = new Set<string>()
    testResultRows.value.forEach((row) => {
      Object.keys(row).forEach((key) => keySet.add(key))
    })

    const resolveResultColumnWidth = (key: string) => {
      const sampleValue = testResultRows.value.find(
        (row) => row[key] !== null && row[key] !== undefined,
      )?.[key]

      if (sampleValue instanceof Date) {
        return 200
      }

      if (Array.isArray(sampleValue)) {
        return 140
      }

      if (sampleValue && typeof sampleValue === 'object') {
        return 220
      }

      if (typeof sampleValue === 'string') {
        const normalizedValue = sampleValue.trim()
        const isDateTime =
          /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(normalizedValue) ||
          /^\d{4}\/\d{2}\/\d{2}(?: \d{2}:\d{2}(?::\d{2})?)?$/.test(normalizedValue)

        if (isDateTime) {
          return 200
        }

        const looksLikeJson =
          (normalizedValue.startsWith('{') && normalizedValue.endsWith('}')) ||
          (normalizedValue.startsWith('[') && normalizedValue.endsWith(']'))

        if (looksLikeJson) {
          return 220
        }
      }

      return 140
    }

    return [...keySet].map((key) => ({
      title: key,
      key,
      width: resolveResultColumnWidth(key),
      ellipsis: { tooltip: true },
      render: (row: TestRow) => {
        const value = row[key]
        if (value == null) {
          return ''
        }
        if (typeof value === 'object') {
          return JSON.stringify(value)
        }
        return String(value)
      },
    }))
  })

  const resetEditorState = () => {
    editorActiveTab.value = 'basic'
    testLoading.value = false
    testResultRows.value = []
  }

  const openCreateEditorDialog = () => {
    resetEditorState()
    openCreateDrawer()
  }

  const openEditEditorDialog = async (id?: string | number) => {
    resetEditorState()
    await openEditDrawer(id)
  }

  const closeEditorDialog = () => {
    closeDrawer()
  }

  const handleEditorAfterLeave = () => {
    handleDrawerAfterLeave()
    resetEditorState()
  }

  const submitEditorDialog = async () => {
    await basicFormRef.value?.validate()
    await codeFormRef.value?.validate()

    if (!drawerFormModel.value.content?.trim()) {
      editorActiveTab.value = 'code'
      message.warning('请输入DSL内容')
      return
    }

    drawerFormModel.value.groupId = drawerFormModel.value.groupId || currentGroupId.value
    await submitDrawer()
  }

  const executeTest = async () => {
    if (!drawerFormModel.value.content?.trim()) {
      editorActiveTab.value = 'code'
      message.warning('请输入DSL内容后再测试')
      return
    }

    let parsedParam: Record<string, unknown>
    try {
      const raw = testParamModel.value.trim() || '{}'
      const result = JSON.parse(raw)
      if (!result || Array.isArray(result) || typeof result !== 'object') {
        message.warning('测试参数必须是JSON对象')
        return
      }
      parsedParam = result as Record<string, unknown>
    } catch (error) {
      console.error(error)
      message.error('测试参数不是合法的JSON对象')
      return
    }

    testLoading.value = true
    try {
      const result = await sysDynamicApiExecApi.test({
        content: drawerFormModel.value.content.trim(),
        param: parsedParam,
        max: Number(drawerFormModel.value.max ?? 200),
      })
      testResultRows.value = Array.isArray(result) ? (result as TestRow[]) : []
    } catch (error) {
      console.error(error)
      testResultRows.value = []
    } finally {
      testLoading.value = false
    }
  }

  return {
    basicFormRef,
    closeEditorDialog,
    codeFormRef,
    contentModel,
    editorActiveTab,
    executeTest,
    handleEditorAfterLeave,
    openCreateEditorDialog,
    openEditEditorDialog,
    submitEditorDialog,
    testLoading,
    testParamModel,
    testResultColumns,
    testResultRows,
  }
}

export default useOnlineApiEditor
