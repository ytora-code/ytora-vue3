import { computed, ref } from 'vue'
import { type DropdownOption, type TreeOption } from 'naive-ui'

import { getNodeKey, menuIcon } from './permissionShared'

type ContextMenuKey = 'create_root' | 'create_child' | 'edit_current' | 'delete_current'

interface UsePermissionContextMenuOptions {
  currentPermissionId: Readonly<{ value: string }>
  selectPermission: (id: string) => Promise<void>
  openCreateRootDialog: () => void
  openCreateChildDialog: (pid?: string) => void
  openEditDialog: (permissionId?: string) => Promise<void>
  deletePermission: (permissionId?: string) => Promise<void>
}

const usePermissionContextMenu = ({
  currentPermissionId,
  selectPermission,
  openCreateRootDialog,
  openCreateChildDialog,
  openEditDialog,
  deletePermission,
}: UsePermissionContextMenuOptions) => {
  const ctxVisible = ref(false)
  const ctxX = ref(0)
  const ctxY = ref(0)
  const ctxNode = ref<TreeOption | null>(null)
  const ctxSelectedKey = ref<string | number | null>(null)

  const closeContextMenu = () => {
    ctxVisible.value = false
    ctxNode.value = null
    ctxSelectedKey.value = null
  }

  const handleBlankContextMenu = (event: globalThis.MouseEvent) => {
    event.preventDefault()

    ctxNode.value = null
    ctxSelectedKey.value = null
    ctxX.value = event.clientX
    ctxY.value = event.clientY
    ctxVisible.value = true
  }

  const openContextMenu = async (event: globalThis.MouseEvent, option: TreeOption) => {
    event.preventDefault()
    event.stopPropagation()

    const permissionId = String(getNodeKey(option))
    ctxNode.value = option
    ctxSelectedKey.value = getNodeKey(option)
    ctxX.value = event.clientX
    ctxY.value = event.clientY
    ctxVisible.value = true
    await selectPermission(permissionId)
  }

  const handleContextSelect = async (key: string | number) => {
    const ctxPermissionId = ctxNode.value ? String(getNodeKey(ctxNode.value)) : ''
    closeContextMenu()

    switch (key as ContextMenuKey) {
      case 'create_root':
        openCreateRootDialog()
        break
      case 'create_child':
        openCreateChildDialog(ctxPermissionId || currentPermissionId.value)
        break
      case 'edit_current':
        await openEditDialog(ctxPermissionId || currentPermissionId.value)
        break
      case 'delete_current':
        await deletePermission(ctxPermissionId || currentPermissionId.value)
        break
      default:
        break
    }
  }

  const nodeProps = ({ option }: { option: TreeOption }) => {
    const nodeKey = getNodeKey(option)
    const isContextSelected = ctxSelectedKey.value === nodeKey

    return {
      class: isContextSelected ? 'permission-tree__node--context' : '',
      onContextmenu: (event: globalThis.MouseEvent) => {
        void openContextMenu(event, option)
      },
    }
  }

  const contextOptions = computed<DropdownOption[]>(() => {
    if (!ctxNode.value) {
      return [{ label: '新增顶级菜单', key: 'create_root', icon: () => menuIcon('FolderPlus') }]
    }

    return [
      { label: '新增下级菜单', key: 'create_child', icon: () => menuIcon('FolderPlus') },
      { label: '编辑当前菜单', key: 'edit_current', icon: () => menuIcon('Pencil') },
      { type: 'divider', key: 'divider-1' },
      { label: '删除菜单', key: 'delete_current', icon: () => menuIcon('Trash2') },
    ]
  })

  return {
    closeContextMenu,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    handleBlankContextMenu,
    handleContextSelect,
    nodeProps,
  }
}

export default usePermissionContextMenu
