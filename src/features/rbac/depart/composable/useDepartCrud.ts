import { computed, ref } from 'vue'
import type { TreeOption } from 'naive-ui'

import sysDepartApi from '../api/SysDepartApi'
import type SysDepartData from '../type/SysDepartData'
import type SysDepartParam from '../type/SysDepartParam'
import {
  collectExpandedKeys,
  createInitialDepartModel,
  findTreeNode,
  getFirstNode,
  getNodeKey,
  normalizeDepartForForm,
  ROOT_PID,
  toTreeOption,
  type FormInstance,
} from './departShared'
import { dialog, message } from '@/utils/naiveApi'

const useDepartCrud = () => {
  const treeLoading = ref(false)
  const submitDialogLoading = ref(false)

  const treeData = ref<TreeOption[]>([])
  const treeRenderKey = ref(0)
  const expandedKeys = ref<Array<string | number>>([])
  const selectedKeys = ref<Array<string | number>>([])

  const currentDepart = ref<SysDepartData | null>(null)

  const editDialogVisible = ref(false)
  const editDialogTitle = ref('新增顶级部门')
  const editFormModel = ref<SysDepartParam>(createInitialDepartModel())
  const editFormRef = ref<FormInstance | null>(null)
  const editContactName = ref('')

  const currentDepartId = computed(() => {
    const currentKey = selectedKeys.value[0]
    return currentKey ? String(currentKey) : ''
  })

  const applyCurrentDepartById = (id?: string) => {
    if (!id) {
      currentDepart.value = null
      return
    }

    const matchedNode = findTreeNode(treeData.value, id)
    currentDepart.value = (matchedNode?.raw as SysDepartData | undefined) ?? null
  }

  const resetSelectionState = () => {
    selectedKeys.value = []
    currentDepart.value = null
  }

  const selectDepart = async (id: string) => {
    selectedKeys.value = [id]
    applyCurrentDepartById(id)
  }

  const syncSelectionAfterTreeLoaded = async (preferredId?: string) => {
    const preferredNode = preferredId ? findTreeNode(treeData.value, preferredId) : null
    const fallbackNode = preferredNode ?? getFirstNode(treeData.value)

    if (!fallbackNode) {
      resetSelectionState()
      return
    }

    await selectDepart(String(getNodeKey(fallbackNode)))
  }

  const loadTree = async (preferredId?: string) => {
    treeLoading.value = true

    try {
      const result = await sysDepartApi.tree('')
      treeData.value = result.map((item) => toTreeOption(item))
      treeRenderKey.value += 1
      expandedKeys.value = collectExpandedKeys(treeData.value)
      await syncSelectionAfterTreeLoaded(preferredId ?? currentDepartId.value)
    } catch (error) {
      console.error(error)
      treeData.value = []
      expandedKeys.value = []
      resetSelectionState()
    } finally {
      treeLoading.value = false
    }
  }

  const openCreateDialog = (pid: string, title: string) => {
    editDialogTitle.value = title
    editFormModel.value = {
      ...createInitialDepartModel(),
      pid,
    }
    editContactName.value = ''
    editDialogVisible.value = true
  }

  const openCreateRootDialog = () => {
    openCreateDialog(ROOT_PID, '新增顶级部门')
  }

  const openCreateChildDialog = (pid?: string) => {
    const departId = pid || currentDepartId.value
    if (!departId) {
      message.warning('请先选择父级部门')
      return
    }

    openCreateDialog(departId, '新增下级部门')
  }

  const openEditDialog = async (departId?: string) => {
    const targetId = departId || currentDepartId.value
    if (!targetId) {
      message.warning('请先选择要编辑的部门')
      return
    }

    submitDialogLoading.value = true

    try {
      const result = await sysDepartApi.queryById(targetId)
      currentDepart.value = result
      selectedKeys.value = [targetId]
      editDialogTitle.value = '编辑当前部门'
      editFormModel.value = {
        ...createInitialDepartModel(),
        ...normalizeDepartForForm(result),
      }
      editContactName.value = result.contactId_DICT
      editDialogVisible.value = true
    } catch (error) {
      console.error(error)
    } finally {
      submitDialogLoading.value = false
    }
  }

  const deleteDepart = async (departId?: string) => {
    const targetId = departId || currentDepartId.value
    if (!targetId) {
      message.warning('请先选择要删除的部门')
      return
    }

    dialog.warning({
      title: '删除确认',
      content: '删除部门前请确认没有下级部门或已处理相关成员，确定继续吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          const currentPid = currentDepart.value?.pid ?? ROOT_PID
          await sysDepartApi.deleteByIds([targetId])
          await loadTree(currentPid)
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleTreeSelect = async (keys: Array<string | number>) => {
    const departId = keys[0]
    if (!departId) {
      return
    }

    await selectDepart(String(departId))
  }

  const closeEditDialog = () => {
    editDialogVisible.value = false
    submitDialogLoading.value = false
    editFormModel.value = createInitialDepartModel()
    editContactName.value = ''
  }

  const submitEditDialog = async () => {
    await editFormRef.value?.validate()
    submitDialogLoading.value = true

    try {
      await sysDepartApi.upsert({
        ...editFormModel.value,
        pid: editFormModel.value.pid ?? ROOT_PID,
      })
      closeEditDialog()
      await loadTree(currentDepartId.value)
    } catch (error) {
      console.error(error)
      submitDialogLoading.value = false
    }
  }

  return {
    closeEditDialog,
    currentDepart,
    currentDepartId,
    deleteDepart,
    editContactName,
    editDialogTitle,
    editDialogVisible,
    editFormModel,
    editFormRef,
    expandedKeys,
    handleTreeSelect,
    loadTree,
    openCreateChildDialog,
    openCreateRootDialog,
    openEditDialog,
    selectedKeys,
    selectDepart,
    submitDialogLoading,
    submitEditDialog,
    treeData,
    treeLoading,
    treeRenderKey,
  }
}

export default useDepartCrud
