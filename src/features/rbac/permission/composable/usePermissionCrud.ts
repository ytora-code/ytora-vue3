import { computed, ref } from 'vue'
import type { TreeOption } from 'naive-ui'

import sysPermissionApi from '../api/SysPermissionApi'
import type SysPermissionData from '../type/SysPermissionData'
import type SysPermissionParam from '../type/SysPermissionParam'
import {
  buildTypeLabel,
  collectExpandedKeys,
  createInitialPermissionModel,
  findTreeNode,
  FormInstance,
  getFirstNode,
  getNodeKey,
  normalizePermissionForForm,
  ROOT_PID,
  toTreeOption,
} from './permissionShared'
import { dialog, message } from '@/utils/naiveApi'

const usePermissionCrud = () => {
  const treeLoading = ref(false)
  const submitDialogLoading = ref(false)

  const treeData = ref<TreeOption[]>([])
  const treeRenderKey = ref(0)
  const expandedKeys = ref<Array<string | number>>([])
  const selectedKeys = ref<Array<string | number>>([])

  const currentPermission = ref<SysPermissionData | null>(null)

  const editDialogVisible = ref(false)
  const editDialogTitle = ref('新增顶级菜单')
  const editFormModel = ref<SysPermissionParam>(createInitialPermissionModel())
  const editFormRef = ref<FormInstance | null>(null)

  const currentPermissionId = computed(() => {
    const currentKey = selectedKeys.value[0]
    return currentKey ? String(currentKey) : ''
  })

  const currentPermissionTypeLabel = computed(() =>
    buildTypeLabel(currentPermission.value?.permissionType),
  )

  const currentPermissionParentName = computed(() => currentPermission.value?.pName || '顶级菜单')

  const resetSelectionState = () => {
    currentPermission.value = null
  }

  const selectPermission = async (id: string) => {
    selectedKeys.value = [id]
    const matchedNode = findTreeNode(treeData.value, id)
    currentPermission.value = (matchedNode?.raw as SysPermissionData | undefined) ?? null
  }

  const syncSelectionAfterTreeLoaded = async (preferredId?: string) => {
    const preferredNode = preferredId ? findTreeNode(treeData.value, preferredId) : null
    const fallbackNode = preferredNode ?? getFirstNode(treeData.value)

    if (!fallbackNode) {
      selectedKeys.value = []
      resetSelectionState()
      return
    }

    await selectPermission(String(getNodeKey(fallbackNode)))
  }

  const loadTree = async (preferredId?: string) => {
    treeLoading.value = true

    try {
      const result = await sysPermissionApi.tree(ROOT_PID)
      treeData.value = result.map((item) => toTreeOption(item))
      treeRenderKey.value += 1
      expandedKeys.value = collectExpandedKeys(treeData.value)
      await syncSelectionAfterTreeLoaded(preferredId ?? currentPermissionId.value)
    } catch (error) {
      console.error(error)
      treeData.value = []
      expandedKeys.value = []
      selectedKeys.value = []
      resetSelectionState()
    } finally {
      treeLoading.value = false
    }
  }

  const openCreateDialog = (pid: string, title: string) => {
    editDialogTitle.value = title
    editFormModel.value = {
      ...createInitialPermissionModel(),
      pid,
    }
    editDialogVisible.value = true
  }

  const openCreateRootDialog = () => {
    openCreateDialog(ROOT_PID, '新增顶级菜单')
  }

  const openCreateChildDialog = (pid?: string) => {
    const permissionId = pid || currentPermissionId.value
    if (!permissionId) {
      message.warning('请先选择父级菜单')
      return
    }

    openCreateDialog(permissionId, '新增下级菜单')
  }

  const openEditDialog = async (permissionId?: string) => {
    const targetId = permissionId || currentPermissionId.value
    if (!targetId) {
      message.warning('请先选择要编辑的菜单')
      return
    }

    submitDialogLoading.value = true

    try {
      const result = await sysPermissionApi.queryById(targetId)
      currentPermission.value = result
      selectedKeys.value = [targetId]
      editDialogTitle.value = '编辑当前菜单'
      editFormModel.value = {
        ...createInitialPermissionModel(),
        ...normalizePermissionForForm(result),
      }
      editDialogVisible.value = true
    } catch (error) {
      console.error(error)
    } finally {
      submitDialogLoading.value = false
    }
  }

  const deletePermission = async (permissionId?: string) => {
    const targetId = permissionId || currentPermissionId.value
    if (!targetId) {
      message.warning('请先选择要删除的菜单')
      return
    }

    dialog.warning({
      title: '删除确认',
      content: '删除后不可恢复，确定继续吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await sysPermissionApi.deleteByIds([targetId])
          await loadTree(currentPermission.value?.pid ?? ROOT_PID)
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const handleTreeSelect = async (keys: Array<string | number>) => {
    const permissionId = keys[0]
    if (!permissionId) {
      return
    }

    await selectPermission(String(permissionId))
  }

  const closeEditDialog = () => {
    editDialogVisible.value = false
    submitDialogLoading.value = false
    editFormModel.value = createInitialPermissionModel()
  }

  const submitEditDialog = async () => {
    await editFormRef.value?.validate()
    submitDialogLoading.value = true

    try {
      await sysPermissionApi.upsert({
        ...editFormModel.value,
        pid: editFormModel.value.pid ?? ROOT_PID,
      })
      closeEditDialog()
      await loadTree(currentPermissionId.value)
    } catch (error) {
      console.error(error)
      submitDialogLoading.value = false
    }
  }

  return {
    closeEditDialog,
    currentPermission,
    currentPermissionId,
    currentPermissionParentName,
    currentPermissionTypeLabel,
    deletePermission,
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
    selectPermission,
    submitDialogLoading,
    submitEditDialog,
    treeData,
    treeLoading,
    treeRenderKey,
  }
}

export default usePermissionCrud
