import { computed, ref } from 'vue'

import useOnlineApiGroupContextMenu from './useOnlineApiGroupContextMenu'
import useOnlineApiGroupCrud from './useOnlineApiGroupCrud'
import useOnlineApiEditor from './useOnlineApiEditor'
import type SysDynamicApiData from '../type/SysDynamicApiData'
import { dialog } from '@/utils/naiveApi'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'

interface UseOnlineApiManagerOptions {
  drawerFormModel: Readonly<{ value: import('../type/SysDynamicApiParam').default }>
  closeDrawer: () => void
  handleDrawerAfterLeave: () => void
  openCreateDrawer: () => void
  openEditDrawer: (id?: string | number) => Promise<void>
  submitDrawer: () => Promise<void>
  pageNo: { value: number }
  checkedRowKeys: { value: Array<string | number> }
  page: () => Promise<void>
  publishRow: (row: SysDynamicApiData) => Promise<void>
  offlineRow: (row: SysDynamicApiData) => Promise<void>
}

const useOnlineApiManager = ({
  drawerFormModel,
  closeDrawer,
  handleDrawerAfterLeave,
  openCreateDrawer,
  openEditDrawer,
  submitDrawer,
  pageNo,
  checkedRowKeys,
  page,
  publishRow,
  offlineRow,
}: UseOnlineApiManagerOptions) => {
  const treeKeyword = ref('')
  const closeIcon = renderIcon('X')

  const groupCrud = useOnlineApiGroupCrud()
  const {
    currentGroup,
    currentGroupId,
    deleteGroup,
    expandedKeys,
    groupDialogLoading,
    groupDialogTitle,
    groupDialogVisible,
    groupFormModel,
    groupFormRef,
    groupFormRules,
    groupSubmitLoading,
    handleGroupDialogAfterLeave,
    handleTreeSelect,
    loadTree,
    openCreateChildGroupDialog,
    openCreateRootGroupDialog,
    openEditGroupDialog,
    selectedKeys,
    selectGroup,
    closeGroupDialog,
    submitGroupDialog,
    treeData,
    treeLoading,
    treeRenderKey,
  } = groupCrud

  const {
    closeContextMenu,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    handleBlankContextMenu,
    handleContextSelect,
    nodeProps,
  } = useOnlineApiGroupContextMenu({
    currentGroupId,
    selectGroup,
    openCreateRootGroupDialog,
    openCreateChildGroupDialog,
    openEditGroupDialog,
    deleteGroup,
  })

  const editor = useOnlineApiEditor({
    currentGroupId,
    drawerFormModel,
    closeDrawer,
    handleDrawerAfterLeave,
    openCreateDrawer,
    openEditDrawer,
    submitDrawer,
  })

  const treeFilter = (pattern: string, node: { label?: string | number }) =>
    String(node.label ?? '')
      .toLowerCase()
      .includes(pattern.trim().toLowerCase())

  const handlePublishToggle = async (row: SysDynamicApiData) => {
    const isPublishAction = row.status === 1

    dialog.warning({
      title: isPublishAction ? '上线确认' : '下线确认',
      content: isPublishAction
        ? '确认上线当前接口吗？上线后将允许外部调用。'
        : '确认下线当前接口吗？下线后将停止对外提供服务。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (isPublishAction) {
          await publishRow(row)
          return
        }

        await offlineRow(row)
      },
    })
  }

  const syncListAfterGroupChanged = async () => {
    checkedRowKeys.value = []
    pageNo.value = 1
    await page()
  }

  const groupFormSchemas = computed(() => [
    {
      label: '分组名称',
      type: 'input' as const,
      dataKey: 'name' as const,
      prop: {
        clearable: true,
        maxlength: 100,
        placeholder: '请输入分组名称',
      },
    },
    {
      label: '备注',
      type: 'textarea' as const,
      dataKey: 'remark' as const,
      prop: {
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
        placeholder: '请输入备注',
      },
    },
  ])

  return {
    basicFormRef: editor.basicFormRef,
    closeContextMenu,
    closeEditorDialog: editor.closeEditorDialog,
    closeGroupDialog,
    closeIcon,
    codeFormRef: editor.codeFormRef,
    contentModel: editor.contentModel,
    contextOptions,
    currentGroup,
    currentGroupId,
    ctxVisible,
    ctxX,
    ctxY,
    editorActiveTab: editor.editorActiveTab,
    executeTest: editor.executeTest,
    expandedKeys,
    groupDialogLoading,
    groupDialogTitle,
    groupDialogVisible,
    groupFormModel,
    groupFormRef,
    groupFormRules,
    groupFormSchemas,
    groupSubmitLoading,
    handleBlankContextMenu,
    handleContextSelect,
    handleEditorAfterLeave: editor.handleEditorAfterLeave,
    handleGroupDialogAfterLeave,
    handlePublishToggle,
    handleTreeSelect,
    loadTree,
    nodeProps,
    openCreateEditorDialog: editor.openCreateEditorDialog,
    openEditEditorDialog: editor.openEditEditorDialog,
    selectedKeys,
    submitEditorDialog: editor.submitEditorDialog,
    submitGroupDialog,
    testLoading: editor.testLoading,
    testParamModel: editor.testParamModel,
    testResultColumns: editor.testResultColumns,
    testResultRows: editor.testResultRows,
    treeData,
    treeFilter,
    treeKeyword,
    treeLoading,
    treeRenderKey,
    syncListAfterGroupChanged,
  }
}

export default useOnlineApiManager
