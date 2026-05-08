import { computed, ref } from 'vue'
import { type DropdownOption, type TreeOption } from 'naive-ui'

import { getNodeKey, menuIcon } from './onlineApiShared'

type ContextMenuKey = 'create_root' | 'create_child' | 'edit_current' | 'delete_current'

interface UseOnlineApiGroupContextMenuOptions {
  currentGroupId: Readonly<{ value: string }>
  selectGroup: (id: string) => Promise<void>
  openCreateRootGroupDialog: () => void
  openCreateChildGroupDialog: (pid?: string) => void
  openEditGroupDialog: (groupId?: string) => Promise<void>
  deleteGroup: (groupId?: string, groupPid?: string) => Promise<void>
}

const useOnlineApiGroupContextMenu = ({
  currentGroupId,
  selectGroup,
  openCreateRootGroupDialog,
  openCreateChildGroupDialog,
  openEditGroupDialog,
  deleteGroup,
}: UseOnlineApiGroupContextMenuOptions) => {
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

    const groupId = String(getNodeKey(option))
    ctxNode.value = option
    ctxSelectedKey.value = getNodeKey(option)
    ctxX.value = event.clientX
    ctxY.value = event.clientY
    ctxVisible.value = true
    await selectGroup(groupId)
  }

  const handleContextSelect = async (key: string | number) => {
    const raw = ctxNode.value?.raw as { id?: string; pid?: string } | undefined
    const ctxGroupId = raw?.id ? String(raw.id) : ''
    const ctxGroupPid = raw?.pid ?? ''
    closeContextMenu()

    switch (key as ContextMenuKey) {
      case 'create_root':
        openCreateRootGroupDialog()
        break
      case 'create_child':
        openCreateChildGroupDialog(ctxGroupId || currentGroupId.value)
        break
      case 'edit_current':
        await openEditGroupDialog(ctxGroupId || currentGroupId.value)
        break
      case 'delete_current':
        await deleteGroup(ctxGroupId || currentGroupId.value, ctxGroupPid)
        break
      default:
        break
    }
  }

  const nodeProps = ({ option }: { option: TreeOption }) => {
    const nodeKey = getNodeKey(option)
    const isContextSelected = ctxSelectedKey.value === nodeKey

    return {
      class: isContextSelected ? 'online-api-tree__node--context' : '',
      onContextmenu: (event: globalThis.MouseEvent) => {
        void openContextMenu(event, option)
      },
    }
  }

  const contextOptions = computed<DropdownOption[]>(() => {
    if (!ctxNode.value) {
      return [{ label: '新增顶级分组', key: 'create_root', icon: () => menuIcon('FolderPlus') }]
    }

    return [
      { label: '新增下级分组', key: 'create_child', icon: () => menuIcon('FolderPlus') },
      { label: '编辑当前分组', key: 'edit_current', icon: () => menuIcon('Pencil') },
      { type: 'divider', key: 'divider-1' },
      { label: '删除当前分组', key: 'delete_current', icon: () => menuIcon('Trash2') },
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

export default useOnlineApiGroupContextMenu
