import { inject, provide, type InjectionKey } from 'vue'
import usePermissionContextMenu from './usePermissionContextMenu'
import usePermissionCrud from './usePermissionCrud'
import { getNodeKey, menuIcon } from './permissionShared'

const createPermissionManager = () => {
  const crud = usePermissionCrud()
  const {
    closeEditDialog,
    currentPermission,
    currentPermissionParentName,
    currentPermissionTypeLabel,
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
  } = crud

  const {
    closeContextMenu,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    handleBlankContextMenu,
    handleContextSelect,
    nodeProps,
  } = usePermissionContextMenu({
    currentPermissionId: crud.currentPermissionId,
    selectPermission,
    openCreateRootDialog,
    openCreateChildDialog,
    openEditDialog,
    deletePermission: crud.deletePermission,
  })

  const renderPrefix = ({ option }: Parameters<typeof nodeProps>[0]) => {
    const raw = option.raw as { icon?: string }
    const iconRender = raw.icon ? menuIcon(raw.icon) : null
    if (iconRender) {
      return iconRender
    }

    const children = Array.isArray(option.children) ? option.children : []
    const isExpanded = expandedKeys.value.includes(getNodeKey(option))
    const iconName = children.length ? (isExpanded ? 'FolderOpen' : 'Folder') : 'FileText'
    return menuIcon(iconName)
  }

  return {
    closeContextMenu,
    closeEditDialog,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    currentPermission,
    currentPermissionParentName,
    currentPermissionTypeLabel,
    editDialogTitle,
    editDialogVisible,
    editFormModel,
    editFormRef,
    expandedKeys,
    handleBlankContextMenu,
    handleContextSelect,
    handleTreeSelect,
    loadTree,
    nodeProps,
    renderPrefix,
    selectedKeys,
    submitDialogLoading,
    submitEditDialog,
    treeData,
    treeRenderKey,
    treeLoading,
  }
}

type PermissionManagerContext = ReturnType<typeof createPermissionManager>

const permissionManagerKey: InjectionKey<PermissionManagerContext> = Symbol('permission-manager')

const usePermissionManager = () => {
  const injected = inject(permissionManagerKey, null)
  if (injected) {
    return injected
  }

  const manager = createPermissionManager()
  provide(permissionManagerKey, manager)
  return manager
}

export default usePermissionManager
