import { computed, ref } from 'vue'
import type { FormRules, TreeOption } from 'naive-ui'

import sysDynamicApiGroupApi from '../api/SysDynamicApiGroupApi'
import type SysDynamicApiGroupData from '../type/SysDynamicApiGroupData'
import {
  createInitialGroupFormModel,
  findTreeNode,
  FormInstance,
  getFirstNode,
  getNodeKey,
  GroupFormModel,
  GroupTreeNode,
  ROOT_PID,
  toTreeOption,
} from './onlineApiShared'
import { dialog, message } from '@/utils/naiveApi'

export type GroupDialogMode = 'create-root' | 'create-child' | 'edit'

const useOnlineApiGroupCrud = () => {
  const treeLoading = ref(false)
  const treeData = ref<TreeOption[]>([])
  const treeRenderKey = ref(0)
  const expandedKeys = ref<Array<string | number>>([])
  const selectedKeys = ref<Array<string | number>>([])
  const currentGroup = ref<SysDynamicApiGroupData | null>(null)

  const groupDialogVisible = ref(false)
  const groupDialogLoading = ref(false)
  const groupSubmitLoading = ref(false)
  const groupDialogMode = ref<GroupDialogMode>('create-root')
  const groupFormRef = ref<FormInstance | null>(null)
  const groupFormModel = ref<GroupFormModel>(createInitialGroupFormModel())

  const currentGroupId = computed(() => {
    const currentKey = selectedKeys.value[0]
    return currentKey ? String(currentKey) : ''
  })

  const groupDialogTitle = computed(() => {
    switch (groupDialogMode.value) {
      case 'create-child':
        return '新增下级分组'
      case 'edit':
        return '编辑当前分组'
      default:
        return '新增顶级分组'
    }
  })

  const groupFormRules: FormRules = {
    name: [{ required: true, message: '请输入分组名称', trigger: ['input', 'blur'] }],
  }

  const applyCurrentGroupById = (id?: string) => {
    if (!id) {
      currentGroup.value = null
      return
    }

    const matchedNode = findTreeNode(treeData.value, id)
    currentGroup.value = (matchedNode?.raw as SysDynamicApiGroupData | undefined) ?? null
  }

  const resetGroupSelection = () => {
    selectedKeys.value = []
    currentGroup.value = null
  }

  const selectGroup = async (id: string) => {
    selectedKeys.value = [id]
    applyCurrentGroupById(id)
  }

  const syncSelectionAfterTreeLoaded = async (preferredId?: string) => {
    const preferredNode = preferredId ? findTreeNode(treeData.value, preferredId) : null
    const fallbackNode = preferredNode ?? getFirstNode(treeData.value)

    if (!fallbackNode) {
      resetGroupSelection()
      return
    }

    await selectGroup(String(getNodeKey(fallbackNode)))
  }

  const loadTree = async (preferredId?: string) => {
    treeLoading.value = true

    try {
      const result = await sysDynamicApiGroupApi.tree({})
      treeData.value = (result || []).map((item) => toTreeOption(item as GroupTreeNode))
      treeRenderKey.value += 1
      await syncSelectionAfterTreeLoaded(preferredId ?? currentGroupId.value)
    } catch (error) {
      console.error(error)
      treeData.value = []
      resetGroupSelection()
    } finally {
      treeLoading.value = false
    }
  }

  const handleTreeSelect = async (keys: Array<string | number>) => {
    const groupId = keys[0]
    if (!groupId) {
      return
    }

    await selectGroup(String(groupId))
  }

  const openCreateRootGroupDialog = () => {
    groupDialogMode.value = 'create-root'
    groupFormModel.value = createInitialGroupFormModel()
    groupDialogVisible.value = true
  }

  const openCreateChildGroupDialog = (pid?: string) => {
    const targetPid = pid || currentGroupId.value
    if (!targetPid) {
      message.warning('请先选择父级分组')
      return
    }

    groupDialogMode.value = 'create-child'
    groupFormModel.value = {
      ...createInitialGroupFormModel(),
      pid: targetPid,
    }
    groupDialogVisible.value = true
  }

  const openEditGroupDialog = async (groupId?: string) => {
    const targetId = groupId || currentGroupId.value
    if (!targetId) {
      message.warning('请先选择要编辑的分组')
      return
    }

    groupDialogMode.value = 'edit'
    groupDialogVisible.value = true
    groupDialogLoading.value = true
    groupFormModel.value = createInitialGroupFormModel()

    try {
      const result = await sysDynamicApiGroupApi.queryById(targetId)
      groupFormModel.value = {
        id: result.id,
        pid: result.pid ?? ROOT_PID,
        name: result.name ?? '',
        remark: result.remark ?? '',
      }
    } catch (error) {
      console.error(error)
      groupDialogVisible.value = false
    } finally {
      groupDialogLoading.value = false
    }
  }

  const closeGroupDialog = () => {
    groupDialogVisible.value = false
  }

  const handleGroupDialogAfterLeave = () => {
    groupDialogLoading.value = false
    groupSubmitLoading.value = false
    groupDialogMode.value = 'create-root'
    groupFormModel.value = createInitialGroupFormModel()
  }

  const submitGroupDialog = async () => {
    await groupFormRef.value?.validate()
    groupSubmitLoading.value = true

    try {
      await sysDynamicApiGroupApi.upsert({
        id: groupFormModel.value.id,
        pid: groupFormModel.value.pid?.trim() || undefined,
        name: groupFormModel.value.name.trim(),
        remark: groupFormModel.value.remark.trim(),
      })
      groupDialogVisible.value = false

      const preferredId =
        groupDialogMode.value === 'edit'
          ? groupFormModel.value.id
          : groupDialogMode.value === 'create-child'
            ? groupFormModel.value.pid
            : currentGroupId.value

      await loadTree(preferredId)
    } catch (error) {
      console.error(error)
    } finally {
      groupSubmitLoading.value = false
    }
  }

  const deleteGroup = async (groupId?: string, groupPid?: string) => {
    const targetId = groupId || currentGroupId.value
    if (!targetId) {
      message.warning('请先选择要删除的分组')
      return
    }

    dialog.warning({
      title: '删除确认',
      content: '删除分组后不可恢复，请确认当前分组下没有需要保留的数据。',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysDynamicApiGroupApi.deleteByIds([targetId])
          await loadTree(groupPid || currentGroup.value?.pid || ROOT_PID)
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return {
    currentGroup,
    currentGroupId,
    expandedKeys,
    groupDialogLoading,
    groupDialogMode,
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
    deleteGroup,
    treeData,
    treeLoading,
    treeRenderKey,
  }
}

export default useOnlineApiGroupCrud
