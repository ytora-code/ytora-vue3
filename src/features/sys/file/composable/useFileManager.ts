import { computed, h, nextTick, onMounted, ref } from 'vue'
import type { TreeOption } from 'naive-ui'
import fileApi from '@/features/sys/file/api/FileApi'
import folderApi from '@/features/sys/file/api/FolderApi'
import FileTreeNodeLabel from '@/features/sys/file/components/FileTreeNodeLabel.vue'
import { useFilePreview } from '@/features/sys/file/composable/useFilePreview'
import useFileType from '@/features/sys/file/composable/useFileType'
import { useFileTreeStore } from '@/features/sys/file/composable/useFileTreeStore'
import {
  TEMP_NODE_PREFIX,
  appendChildNode,
  ensureExpandedKey,
  findNodeById,
  getTreeNodeId,
  isFileTreeNode,
  isTempNodeId,
  removeNodeById,
  setChildrenById,
  toTreeOption,
  updateNodeById,
} from '@/features/sys/file/composable/useFileTreeUtils'
import type SysFile from '@/features/sys/file/type/SysFileData'
import type SysFolderData from '@/features/sys/file/type/SysFolderData'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'

type NativeFile = globalThis.File
type NativeEvent = globalThis.Event
type NativeInputElement = globalThis.HTMLInputElement

export const useFileManager = () => {
  const { classifyByMime, fileKindToIcon } = useFileType()
  const message = useMessage()
  const dialog = useDialog()
  const fileTreeStore = useFileTreeStore()

  const folders = ref<TreeOption[]>([])
  const loading = ref(true)
  const uploading = ref(false)
  const percentage = ref(0)

  const editingKey = ref<string | number | null>(null)
  const editValue = ref('')
  const isCreating = ref(false)
  const uploadInputRef = ref<NativeInputElement | null>(null)
  const uploadTargetNode = ref<TreeOption | null>(null)

  const fileInfo = ref<SysFile>()
  const { previewLoading, previewText, previewTip, previewUrl } = useFilePreview(fileInfo)

  const ctxVisible = ref(false)
  const ctxX = ref(0)
  const ctxY = ref(0)
  const ctxSelectedKey = ref<string | number | null>(null)
  const ctxNode = ref<TreeOption | null>(null)

  let tempNodeSequence = 0

  const createTempNodeId = () => {
    let candidateId = ''

    do {
      tempNodeSequence += 1
      candidateId = `${TEMP_NODE_PREFIX}${Date.now()}-${tempNodeSequence}`
    } while (findNodeById(folders.value, candidateId))

    return candidateId
  }

  const createTempNode = (pid: string | number): TreeOption => ({
    id: createTempNodeId(),
    path: ' ',
    isLeaf: false,
    raw: { type: 1, pid: String(pid) } as SysFolderData,
  })

  const buildFilePreviewInfo = (info: SysFile) => {
    info.ext = classifyByMime(info.fileType, info.fileName)
    return info
  }

  const menuIcon = (name: string) => {
    const iconRender = renderIcon(name)
    return iconRender ? iconRender() : null
  }

  const renderPrefix = ({
    option,
  }: {
    option: TreeOption
    checked: boolean
    selected: boolean
  }) => {
    const nodeId = getTreeNodeId(option)
    const isExpanded = fileTreeStore.expandedKeys.includes(nodeId)

    let iconName = 'Folder'
    if (isFileTreeNode(option)) {
      const raw = option.raw as SysFolderData
      const fileKind = classifyByMime(raw.ext, raw.path)
      iconName = fileKindToIcon(fileKind)
    } else {
      iconName = isExpanded ? 'FolderOpen' : 'Folder'
    }

    const iconRender = renderIcon(iconName)
    return iconRender ? iconRender() : null
  }

  const clearEditingState = () => {
    editingKey.value = null
    editValue.value = ''
    isCreating.value = false
  }

  const validateName = (name: string) => {
    if (!name) {
      message.warning('名称不能为空')
      return false
    }

    if (name.length > 20) {
      message.warning('名称太长了，不能超过20个字符')
      return false
    }

    if (/[\\/:*?"<>|]/.test(name)) {
      message.warning('名称不能包含以下字符：\\ / : * ? " < > |')
      return false
    }

    return true
  }

  const handleCancelEdit = () => {
    if (isCreating.value && editingKey.value) {
      folders.value = removeNodeById(folders.value, editingKey.value)
    }

    clearEditingState()
  }

  const handleSaveEdit = async (node: TreeOption) => {
    const name = editValue.value.trim()
    if (!validateName(name)) {
      return
    }

    try {
      const isFile = isFileTreeNode(node)
      const rawNode = node.raw as SysFolderData
      const parentId = rawNode.pid || '0'

      if (isCreating.value) {
        const response = await folderApi.insertOrUpdateFolder({
          path: name,
          pid: parentId,
        })

        folders.value = updateNodeById(folders.value, node.id as string, toTreeOption(response))
        ensureExpandedKey(fileTreeStore.expandedKeys, parentId)
        fileTreeStore.markLoaded(parentId)
      } else {
        if (isFile) {
          await fileApi.insertOrUpdate({ id: node.id as string, fileName: name })
        } else {
          await folderApi.insertOrUpdateFolder({ id: node.id as string, path: name })
        }

        folders.value = updateNodeById(folders.value, node.id as string, { path: name })
      }

      clearEditingState()
      message.success('保存成功')
    } catch (error) {
      console.error(error)
    }
  }

  const renderLabel = ({ option }: { option: TreeOption }) => {
    const editing = editingKey.value === option.id
    const label = isTempNodeId(String(option.id)) ? '新建文件夹' : (option.path as string)
    return h(FileTreeNodeLabel, {
      key: `${option.id}-${editing ? 'edit' : 'view'}`,
      editing,
      label,
      modelValue: editValue.value,
      'onUpdate:modelValue': (value: string) => {
        editValue.value = value
      },
      onSave: () => {
        void handleSaveEdit(option)
      },
      onCancel: () => {
        handleCancelEdit()
      },
    })
  }

  const startEditing = (nodeId: string | number, value: string, creating: boolean) => {
    editingKey.value = nodeId
    editValue.value = value
    isCreating.value = creating
  }

  const confirmDeleteNode = (node: TreeOption) => {
    const isFile = isFileTreeNode(node)
    const nodeName = (node.path as string) || '未命名'
    const title = isFile ? '确认删除文件' : '确认删除文件夹'
    const content = isFile
      ? `确定要删除文件“${nodeName}”吗？`
      : `确定要删除文件夹“${nodeName}”吗？该文件夹下的内容也会被一并删除。`

    return new Promise<boolean>((resolve) => {
      let settled = false
      const finish = (value: boolean) => {
        if (settled) {
          return
        }
        settled = true
        resolve(value)
      }

      dialog.warning({
        title,
        content,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => {
          finish(true)
        },
        onNegativeClick: () => {
          finish(false)
        },
        onClose: () => {
          finish(false)
        },
      })
    })
  }

  const handleLoad = async (node: TreeOption) => {
    if (isFileTreeNode(node)) {
      return
    }

    const nodeId = getTreeNodeId(node)
    if (fileTreeStore.loadedKeys.has(nodeId) && Array.isArray(node.children)) {
      return
    }

    try {
      const children = await folderApi.listFolderByPid(String(nodeId))
      folders.value = setChildrenById(
        folders.value,
        nodeId,
        children.map((item) => toTreeOption(item)),
      )
      fileTreeStore.markLoaded(nodeId)
    } catch (error) {
      message.error('加载文件夹失败')
      throw error
    }
  }

  const ensureFolderLoaded = async (node: TreeOption) => {
    if (!isFileTreeNode(node) && !fileTreeStore.loadedKeys.has(getTreeNodeId(node))) {
      await handleLoad(node)
    }
  }

  /**
   * 新增子节点时，空文件夹最容易出现“先变成空 children，再插入临时节点”的闪烁。
   * 这里先拿到目标文件夹当前应有的 children，再一次性提交树状态，避免两段式重渲染。
   */
  const resolveFolderChildren = async (node: TreeOption) => {
    const nodeId = getTreeNodeId(node)
    const latestNode = findNodeById(folders.value, nodeId)
    if (latestNode && Array.isArray(latestNode.children)) {
      return latestNode.children
    }

    const children = await folderApi.listFolderByPid(String(nodeId))
    fileTreeStore.markLoaded(nodeId)
    return children.map((item) => toTreeOption(item))
  }

  const fetchFile = async (id: string) => {
    if (isTempNodeId(id)) {
      return
    }

    const info = await fileApi.queryById(id)
    fileInfo.value = buildFilePreviewInfo(info)
  }

  const selectFileNode = async (nodeId: string | number) => {
    fileTreeStore.selectedKeys = [nodeId]
    await fetchFile(String(nodeId))
  }

  const downloadFile = () => {
    if (fileInfo.value) {
      fileApi.defaultDownload(fileInfo.value.id)
    }
  }

  const uploadFileToFolder = async (file: NativeFile, folderNode: TreeOption) => {
    const folderId = String(folderNode.id)

    try {
      await ensureFolderLoaded(folderNode)

      const formData = new globalThis.FormData()
      formData.append('file', file)
      formData.append('folderId', folderId)

      uploading.value = true

      const fileData: SysFile = await fileApi.fileUpload(formData, (_loaded, _total, percent) => {
        percentage.value = percent
      })

      const newFileNode = toTreeOption({
        id: fileData.id,
        path: fileData.fileName,
        type: 2,
        pid: folderId,
      } as SysFolderData)

      folders.value = appendChildNode(folders.value, folderId, newFileNode)
      ensureExpandedKey(fileTreeStore.expandedKeys, folderId)
      fileTreeStore.markLoaded(folderId)
      await selectFileNode(fileData.id)

      message.success('上传成功')
    } catch (error: unknown) {
      console.error('上传失败:', error)
      message.error('上传失败')
    } finally {
      uploading.value = false
      percentage.value = 0
      uploadTargetNode.value = null
      if (uploadInputRef.value) {
        uploadInputRef.value.value = ''
      }
    }
  }

  const openFilePicker = (targetNode: TreeOption) => {
    uploadTargetNode.value = targetNode
    ensureExpandedKey(fileTreeStore.expandedKeys, getTreeNodeId(targetNode))
    uploadInputRef.value?.click()
  }

  const handleFilePicked = async (event: NativeEvent) => {
    const input = event.target as NativeInputElement | null
    const selectedFile = input?.files?.[0]
    const targetNode = uploadTargetNode.value

    if (!selectedFile || !targetNode) {
      if (input) {
        input.value = ''
      }
      return
    }

    await uploadFileToFolder(selectedFile, targetNode)
  }

  const closeContextMenu = () => {
    ctxVisible.value = false
    ctxSelectedKey.value = null
    ctxNode.value = null
  }

  const handleBlankContextMenu = (event: globalThis.MouseEvent) => {
    event.preventDefault()

    ctxSelectedKey.value = null
    ctxNode.value = null
    ctxX.value = event.clientX
    ctxY.value = event.clientY
    ctxVisible.value = true
  }

  const openContextMenu = (event: globalThis.MouseEvent, option: TreeOption) => {
    event.preventDefault()
    event.stopPropagation()

    const nodeId = getTreeNodeId(option)
    fileTreeStore.selectedKeys = [nodeId]
    ctxSelectedKey.value = nodeId
    ctxNode.value = option
    ctxX.value = event.clientX
    ctxY.value = event.clientY
    ctxVisible.value = true
  }

  const appendRootFolder = async () => {
    const tempNode = createTempNode('0')
    folders.value = [...folders.value, tempNode]
    await nextTick()
    startEditing(tempNode.id as string, '', true)
  }

  const appendFolderChild = async (parentNode: TreeOption) => {
    const parentId = getTreeNodeId(parentNode)
    const tempNode = createTempNode(parentId)
    const baseChildren = await resolveFolderChildren(parentNode)

    folders.value = updateNodeById(folders.value, parentId, {
      children: [...baseChildren, tempNode],
      isLeaf: false,
    })

    ensureExpandedKey(fileTreeStore.expandedKeys, parentId)
    fileTreeStore.markLoaded(parentId)
    await nextTick()
    startEditing(tempNode.id as string, '', true)
  }

  const handleDeleteNode = async (key: string | number, node: TreeOption) => {
    const confirmed = await confirmDeleteNode(node)
    if (!confirmed) {
      return
    }

    const nodeId = String(getTreeNodeId(node))

    if (key === 'deleteFile') {
      await fileApi.deleteFile(nodeId)
      if (fileInfo.value?.id === nodeId) {
        fileInfo.value = undefined
      }
    } else {
      await folderApi.deleteFolder(nodeId)
    }

    folders.value = removeNodeById(folders.value, nodeId)
  }

  const handleCtxSelect = async (key: string | number) => {
    ctxVisible.value = false
    ctxSelectedKey.value = null

    if (key === 'mkdir_root') {
      await appendRootFolder()
      return
    }

    const currentNode = ctxNode.value
    if (!currentNode) {
      return
    }

    const nodeId = getTreeNodeId(currentNode)

    if (key === 'renameFile' || key === 'renameFolder') {
      await startEditing(nodeId, (currentNode.path as string) || '', false)
      return
    }

    if (key === 'mkfile') {
      openFilePicker(currentNode)
      return
    }

    if (key === 'mkdir') {
      await appendFolderChild(currentNode)
      return
    }

    if (key === 'deleteFile' || key === 'deleteFolder') {
      await handleDeleteNode(key, currentNode)
    }
  }

  const nodeProps = ({ option }: { option: TreeOption }) => {
    const nodeId = getTreeNodeId(option)
    const isContextSelected = ctxSelectedKey.value === nodeId

    return {
      class: isContextSelected ? 'ctx-selected' : '',
      onClick: () => {
        if (isFileTreeNode(option)) {
          void selectFileNode(nodeId)
        } else {
          fileTreeStore.selectedKeys = [nodeId]
        }
      },
      onContextmenu: (event: globalThis.MouseEvent) => openContextMenu(event, option),
    }
  }

  const ctxOptions = computed(() => {
    if (!ctxNode.value) {
      return [{ label: '新增文件夹', key: 'mkdir_root', icon: () => menuIcon('FolderPlus') }]
    }

    if (isFileTreeNode(ctxNode.value)) {
      return [
        { label: '重命名', key: 'renameFile', icon: () => menuIcon('Pencil') },
        { label: '删除文件', key: 'deleteFile', icon: () => menuIcon('Trash2') },
      ]
    }

    return [
      { label: '新增子文件夹', key: 'mkdir', icon: () => menuIcon('FolderPlus') },
      { label: '新增子文件', key: 'mkfile', icon: () => menuIcon('FilePlus2') },
      { type: 'divider', key: 'd1' },
      { label: '重命名', key: 'renameFolder', icon: () => menuIcon('Pencil') },
      { label: '删除文件夹', key: 'deleteFolder', icon: () => menuIcon('Trash2') },
    ]
  })

  /**
   * NTree 对 renderLabel 这类回调里的闭包状态并不总是会主动追踪刷新。
   * 把 editingKey 纳入显式 key，可确保“新增后立即进入编辑态”稳定生效。
   */
  const treeRenderKey = computed(() => `${folders.value.length}-${editingKey.value ?? 'none'}`)

  /**
   * 这里保留“按展开状态递归恢复懒加载”的旧逻辑。
   * 否则页面刷新后虽然 expandedKeys 还在，但实际 children 并不会自动补齐。
   */
  const restoreExpandedNodes = async (nodes: TreeOption[]) => {
    const expandedSet = new Set(fileTreeStore.expandedKeys)

    for (const node of nodes) {
      const nodeId = getTreeNodeId(node)
      if (isFileTreeNode(node) || !expandedSet.has(nodeId)) {
        continue
      }

      await handleLoad(node)
      const latestNode = findNodeById(folders.value, nodeId)
      const children = Array.isArray(latestNode?.children) ? latestNode.children : []

      if (children.length) {
        await restoreExpandedNodes(children)
      }
    }
  }

  onMounted(async () => {
    try {
      loading.value = true
      fileTreeStore.resetLoadedKeys()

      const topFolders = await folderApi.listFolderByPid('0')
      folders.value = topFolders.map((item) => toTreeOption(item))

      await restoreExpandedNodes(folders.value)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })

  return {
    closeContextMenu,
    ctxOptions,
    ctxVisible,
    ctxX,
    ctxY,
    downloadFile,
    fileInfo,
    fileTreeStore,
    folders,
    handleBlankContextMenu,
    handleCtxSelect,
    handleFilePicked,
    handleLoad,
    loading,
    nodeProps,
    percentage,
    previewLoading,
    previewText,
    previewTip,
    previewUrl,
    renderLabel,
    renderPrefix,
    treeRenderKey,
    uploadInputRef,
    uploading,
  }
}
