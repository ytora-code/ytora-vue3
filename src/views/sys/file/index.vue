<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  NTree,
  type TreeOption,
  NInput,
  NButton,
  NSpace,
  type UploadCustomRequestOptions,
} from 'naive-ui'
import { fileApi } from './api/FileApi.ts'
import type SysFolder from './type/resp/SysFolder.ts'
import { renderAsyncIcon } from '@/utils/icon'
import useFileType from './composable/useFileType.ts'
import type SysFile from '@/views/sys/file/type/resp/SysFile.ts'

const { classifyByMime, fileKindToIcon } = useFileType()
const message = useMessage()

const loadedKeys = ref<Set<string | number>>(new Set())

const folders = ref<TreeOption[]>([])
const loading = ref(true)
const importBoxShowStatus = ref(false)
const uploading = ref(false)
const percentage = ref(0)

// 用于存放当前展开节点的 ID
const expandedKeys = ref<Array<string | number>>([])
const selectedKeys = ref<Array<string | number>>([])

// --- 编辑相关状态 ---
const editingKey = ref<string | number | null>(null) // 当前正在编辑的节点 ID
const editValue = ref('') // 输入框的值
const isCreating = ref(false) // 标记是否是“新增”操作（用于取消时删除临时节点）

/**
 * SysFolder → TreeOption
 */
const toOption = (f: SysFolder, isLeaf?: boolean): TreeOption => {
  const isFile = f.type === 2
  return {
    id: f.id,
    path: f.path,
    isLeaf: isLeaf ?? isFile,
    children: isFile ? [] : undefined,
    raw: f,
  } as TreeOption
}

/**
 * 给指定节点塞 children 的更新函数
 */
function setChildrenById(
  nodes: TreeOption[],
  targetId: string | number,
  children: TreeOption[],
): TreeOption[] {
  return nodes.map((n) => {
    const id = n.id as string | number
    if (id === targetId) {
      const isFile = (n.raw as SysFolder | undefined)?.type === 2
      const nextIsLeaf = isFile ? true : children.length === 0

      return {
        ...n,
        children,
        isLeaf: nextIsLeaf,
      }
    }

    const c = n.children
    if (Array.isArray(c) && c.length) {
      return { ...n, children: setChildrenById(c, targetId, children) }
    }

    return n
  })
}

/**
 * 懒加载
 */
const handleLoad = async (node: TreeOption) => {
  // 文件不 load
  const type = (node.raw as SysFolder | undefined)?.type
  if (type === 2) return

  const id = node.id as string | number

  if (loadedKeys.value.has(id)) return
  loadedKeys.value.add(id)

  const list = await fileApi.listFolderByPid(String(id))
  const options = list.map((item) => toOption(item))

  // 同时回写 children 和 isLeaf（空文件夹就会变成 isLeaf=true）
  folders.value = setChildrenById(folders.value, id, options)
}

/**
 * 渲染图标逻辑
 */
const renderPrefix = ({ option }: { option: TreeOption; checked: boolean; selected: boolean }) => {
  const id = option.id as string | number
  const isExpanded = expandedKeys.value.includes(id)

  // 1 文件夹 / 2 文件
  const type = (option.raw as SysFolder)?.type
  const isFile = type === 2

  const shouldBlue = isFile ? selectedKeys.value.includes(id) : isExpanded

  let iconName: string
  if (isFile) {
    const mime = (option.raw as SysFolder)?.ext
    const name = (option.raw as SysFolder)?.path
    const kind = classifyByMime(mime, name)
    iconName = fileKindToIcon(kind)
  } else {
    iconName = isExpanded ? 'FolderOpen' : 'FolderOutline'
  }

  const iconRender = renderAsyncIcon(iconName, {
    color: shouldBlue ? '#1890ff' : undefined,
    size: 18,
  })

  return iconRender ? iconRender() : null
}

/**
 * 渲染节点内容
 */
const renderLabel = ({ option }: { option: TreeOption }) => {
  // 如果当前节点正在编辑
  if (editingKey.value === option.id) {
    return h(
      NSpace,
      { align: 'center', wrap: false, size: 4 },
      {
        default: () => [
          h(NInput, {
            value: editValue.value,
            onUpdateValue: (v) => (editValue.value = v),
            size: 'tiny',
            autoFocus: true,
            onKeyup: (e: KeyboardEvent) => {
              if (e.key === 'Enter') handleSaveEdit(option)
              if (e.key === 'Escape') handleCancelEdit()
            },
          }),
          h(
            NButton,
            {
              size: 'tiny',
              type: 'primary',
              ghost: true,
              onClick: (e) => {
                e.stopPropagation()
                handleSaveEdit(option)
              },
            },
            { default: () => '确定' },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              ghost: true,
              onClick: (e) => {
                e.stopPropagation()
                handleCancelEdit()
              },
            },
            { default: () => '取消' },
          ),
        ],
      },
    )
  }
  // 正常显示文字
  return h('span', {}, { default: () => option.path as string })
}

/**
 * 保存编辑/新增
 */
const handleSaveEdit = async (node: TreeOption) => {
  // 校验
  // 1. 不能为空
  const name = editValue.value.trim()
  if (!name) {
    message.warning('名称不能为空')
    return
  }
  // 2. 限制长度
  if (name.length > 20) {
    message.warning('名称太长了，不能超过20个字符')
    return
  }
  // 3. 正则校验：禁止危险字符
  const forbiddenRegex = /[\\/:*?"<>|]/
  if (forbiddenRegex.test(name)) {
    message.warning('名称不能包含以下字符：\\ / : * ? " < > |')
    return
  }

  try {
    const isFile = (node.raw as SysFolder)?.type === 2
    const pid = (node.raw as SysFolder)?.pid || '0'

    if (isCreating.value) {
      // 执行新增 API
      if (isFile) {
        // 弹出文件上传框
        // importBoxShowStatus.value = true
      } else {
        // 新增文件夹
        const res = await fileApi.insertOrUpdateFolder({ path: editValue.value, pid: pid })
        folders.value = updateNodeById(folders.value, node.id as string, toOption(res, true))
      }
    } else {
      // 执行重命名 API
      if (isFile) {
        await fileApi.insertOrUpdate({ id: node.id as string, fileName: editValue.value })
      } else {
        await fileApi.insertOrUpdateFolder({ id: node.id as string, path: editValue.value })
      }
      // 更新本地树文字
      folders.value = updateNodeById(folders.value, node.id as string, { path: editValue.value })
    }

    editingKey.value = null
    isCreating.value = false
    message.success('保存成功')
  } catch (err) {
    console.error(err)
  }
}

/**
 * 取消编辑
 */
const handleCancelEdit = () => {
  if (isCreating.value && editingKey.value) {
    // 如果是新增过程中取消，直接移除该临时节点
    folders.value = removeNodeById(folders.value, editingKey.value)
  }
  editingKey.value = null
  isCreating.value = false
}

/**
 * 递归删除树中某个节点（用于取消新增或删除操作）
 */
function removeNodeById(nodes: TreeOption[], targetId: string | number): TreeOption[] {
  return nodes.filter((n) => {
    if (n.id === targetId) return false
    if (n.children) {
      n.children = removeNodeById(n.children, targetId)
    }
    return true
  })
}

/**
 * 递归更新树中某个节点的属性
 */
function updateNodeById(
  nodes: TreeOption[],
  targetId: string | number,
  patch: Partial<TreeOption>,
): TreeOption[] {
  return nodes.map((n) => {
    if (n.id === targetId) return { ...n, ...patch }
    if (n.children) return { ...n, children: updateNodeById(n.children, targetId, patch) }
    return n
  })
}

/**
 * 上传文件
 */
const uploadFile = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  if (!file.file || !ctxNode.value) return

  // 获取目标文件夹（父节点）的 ID
  const folderId = String(ctxNode.value.id)

  try {
    const formData = new FormData()
    formData.append('file', file.file)
    formData.append('folderId', folderId)

    uploading.value = true

    // 1. 发起上传请求
    const fileInfo: SysFile = await fileApi.fileUpload(formData, (loaded, total, percent) => {
      percentage.value = percent
    })

    // 2. 将后端返回的数据转换为树节点格式
    const newFileOption = toOption({
      id: fileInfo.id,
      path: fileInfo.fileName,
      type: 2, // 标记为文件
      pid: folderId,
    })

    // 3. 更新“父文件夹”的 children 属性
    // 获取父节点当前的子节点列表（如果没有子节点则为空数组）
    const currentChildren = Array.isArray(ctxNode.value.children) ? [...ctxNode.value.children] : []

    // 将新节点放入列表
    const nextChildren = [...currentChildren, newFileOption]

    // 更新整棵树中对应父节点的数据
    folders.value = updateNodeById(
      folders.value,
      folderId, // 这里是更新 folderId（父节点）
      {
        children: nextChildren,
        isLeaf: false, // 文件夹现在肯定不是叶子节点了
      },
    )

    message.success('上传成功')
    onFinish()
  } catch (err: unknown) {
    console.error('上传失败:', err)
    message.error('上传失败')
    onError()
  } finally {
    importBoxShowStatus.value = false
    uploading.value = false
    percentage.value = 0
  }
}

/**
 * 右键菜单状态
 */
const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxSelectedKey = ref<string | number | null>(null)
const ctxNode = ref<TreeOption | null>(null)

const isFileNode = (opt: TreeOption) => (opt.raw as SysFolder | undefined)?.type === 2
const getNodeId = (opt: TreeOption) => opt.id as string | number

// 右键菜单的图标渲染
const menuIcon = (name: string) => {
  const iconRender = renderAsyncIcon(name, { size: 16 })
  return iconRender ? iconRender() : null
}

/**
 * 根据右键目标动态生成菜单
 */
const ctxOptions = computed(() => {
  // 情况 1：点击空白处（根目录操作）
  if (!ctxNode.value) {
    return [{ label: '新增文件夹', key: 'mkdir_root', icon: () => menuIcon('FolderOpenOutline') }]
  }

  const isFile = isFileNode(ctxNode.value)

  // 情况 2：点击的是文件
  if (isFile) {
    return [
      { label: '重命名', key: 'renameFile', icon: () => menuIcon('CreateOutline') },
      { label: '删除文件', key: 'deleteFile', icon: () => menuIcon('TrashOutline') },
    ]
  }

  // 情况 3：点击的是文件夹
  return [
    { label: '新增子文件夹', key: 'mkdir', icon: () => menuIcon('FolderOpenOutline') },
    { label: '新增子文件', key: 'mkfile', icon: () => menuIcon('DocumentOutline') },
    { type: 'divider', key: 'd1' },
    { label: '重命名', key: 'renameFolder', icon: () => menuIcon('CreateOutline') },
    { label: '删除文件夹', key: 'deleteFolder', icon: () => menuIcon('TrashOutline') },
  ]
})

/**
 * 点击空白区域（非节点）触发的右键
 */
const handleBlankContextMenu = (e: MouseEvent) => {
  // 阻止浏览器默认菜单
  e.preventDefault()

  // 如果点击的是节点，节点自身的 onContextmenu 会通过 e.stopPropagation() 阻止此函数触发
  // 所以能运行到这里的，一定是点击了树的空白处

  ctxSelectedKey.value = null
  ctxNode.value = null

  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxVisible.value = true
}

/**
 * 打开右键菜单
 */
const openContextMenu = (e: MouseEvent, option: TreeOption) => {
  e.preventDefault()
  e.stopPropagation()

  const id = option.id as string | number
  selectedKeys.value = [id]
  ctxSelectedKey.value = id

  ctxNode.value = option
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxVisible.value = true
}

// 点击页面任意地方，关闭菜单
const closeContextMenu = () => {
  ctxVisible.value = false
  ctxSelectedKey.value = null
}

/**
 * 执行右键菜单动作
 */
const handleCtxSelect = async (key: string | number) => {
  // 1. 先关闭菜单
  ctxVisible.value = false
  ctxSelectedKey.value = null

  // 2. 特殊处理：根目录新增文件夹，此时 ctxNode 为 null
  if (key === 'mkdir_root') {
    const tempId = `temp-${Date.now()}`
    const newNode: TreeOption = {
      id: tempId,
      path: '',
      isLeaf: false, // 文件夹不是叶子，为了显示文件夹图标
      raw: { type: 1, pid: '0' } as SysFolder,
    }
    // 直接放入顶层数组
    folders.value = [...folders.value, newNode]

    // 进入编辑状态
    editingKey.value = tempId
    editValue.value = ''
    isCreating.value = true
    return // 处理完根目录逻辑，直接退出
  }

  // 3. 处理节点相关的逻辑 (此时 ctxNode 必不为 null)
  const opt = ctxNode.value
  if (!opt) return
  const id = getNodeId(opt)

  // 处理重命名
  if (key === 'renameFile' || key === 'renameFolder') {
    editingKey.value = id
    editValue.value = (opt.path as string) || ''
    isCreating.value = false
  }

  // 处理文件夹内新增文件
  if (key === 'mkfile') {
    importBoxShowStatus.value = true
  }

  // 处理文件夹内新增子文件夹
  if (key === 'mkdir') {
    if (!expandedKeys.value.includes(id)) {
      expandedKeys.value.push(id)
    }
    if (!loadedKeys.value.has(id)) {
      await handleLoad(opt)
    }

    const tempId = `temp-${Date.now()}`
    const newNode: TreeOption = {
      id: tempId,
      path: '',
      isLeaf: false, // 设为 false 以保持文件夹外观，直到保存
      raw: { type: 1, pid: id } as SysFolder,
    }

    folders.value = updateNodeById(folders.value, id, {
      children: [...(opt.children || []), newNode],
      isLeaf: false,
    })

    editingKey.value = tempId
    editValue.value = ''
    isCreating.value = true
  }

  // 处理删除
  if (key === 'deleteFile' || key === 'deleteFolder') {
    const deleteId = String(id)
    if (key === 'deleteFile') await fileApi.deleteFile(deleteId)
    else await fileApi.deleteFolder(deleteId)
    folders.value = removeNodeById(folders.value, id)
    message.success('删除成功')
  }
}

const nodeProps = ({ option }: { option: TreeOption }) => {
  const id = option.id as string | number
  const isCtx = ctxSelectedKey.value === id

  return {
    class: isCtx ? 'ctx-selected' : '',
    onClick: () => {
      const id = option.id as string | number
      selectedKeys.value = [id]

      // 文件（叶子）点击才加载
      const type = (option.raw as SysFolder | undefined)?.type
      if (type === 2) {
        fetchFile(String(id))
      }
    },
    onContextmenu: (e: MouseEvent) => openContextMenu(e, option),
  }
}

// 文件信息
const fileInfo = ref<SysFile>()
// 文件下载URL
const fileDownloadUrl = ref<string>()
/**
 * 获取文件信息
 */
const fetchFile = async (id: string) => {
  // id以"temp-"开头，说明这是正在编辑的临时文件
  if (id.startsWith('temp-')) {
    return
  }
  // 根据ID获取文件信息
  fileInfo.value = await fileApi.queryById(id)
  fileInfo.value.ext = classifyByMime(fileInfo.value.fileType, fileInfo.value.fileName)
  fileDownloadUrl.value = `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?fileId=${fileInfo.value.fileId}`
}

const downloadFile = () => {
  if (fileInfo.value) {
    // 使用浏览器默认的下载
    fileApi.defaultDownload(fileInfo.value.fileId)
  }
}

/**
 * 预览状态
 */
const previewText = ref<string>('')
const previewUrl = ref<string>('')
const previewTip = ref<string>('暂不支持预览，请点击下载')
const previewLoading = ref(false)

// 当 fileInfo 变化时，异步加载预览内容
watch(
  () => fileInfo.value?.fileId,
  async () => {
    const info = fileInfo.value
    previewText.value = ''
    previewUrl.value = ''
    previewTip.value = '暂不支持预览，请点击下载'

    if (!info) return

    const ext = info.ext

    // 文本 <= 1MB：拉取 blob 并转文本
    if (
      (ext === 'text' || ext === 'log' || ext === 'json' || ext === 'code') &&
      info.fileSize <= 1024 * 1024
    ) {
      previewLoading.value = true
      try {
        await fileApi.fileDownload(info.fileId, async (_header, body) => {
          previewText.value = await body.text()
        })
        previewTip.value = ''
      } finally {
        previewLoading.value = false
      }
      return
    }

    // 图片：拼 URL
    if (ext === 'image') {
      previewUrl.value = `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?fileId=${info.fileId}`
      previewTip.value = ''
      return
    }

    // 其他类型
    previewTip.value = '暂不支持预览，请点击下载'
  },
  { immediate: true },
)

// 获取数据
onMounted(async () => {
  try {
    loading.value = true
    const top = await fileApi.listFolderByPid('0')
    folders.value = top.map((item) => toOption(item))
  } catch (error) {
    console.error('Failed to fetch folders:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="tree-container" flex p-6>
      <div w="[300px]" flex-shrink-0 @contextmenu="handleBlankContextMenu">
        <n-tree
          block-line
          expand-on-click
          v-model:expanded-keys="expandedKeys"
          v-model:selected-keys="selectedKeys"
          :data="folders"
          key-field="id"
          label-field="path"
          children-field="children"
          :render-prefix="renderPrefix"
          :render-label="renderLabel"
          :node-props="nodeProps"
          :on-load="handleLoad"
        />
      </div>

      <!-- 分割线 -->
      <div class="mx-4 w-px bg-gray-200"></div>

      <div flex-1>
        <n-card :title="fileInfo?.fileName" size="huge">
          <n-empty v-if="!fileInfo" description="请选择一个文件" />
          <n-grid v-else :cols="3">
            <n-gi> 文件ID：{{ fileInfo.fileId }}</n-gi>
            <n-gi> 文件大小：{{ fileInfo.fileSizeText }}</n-gi>
            <n-gi> 文件类型：{{ fileInfo.ext }}</n-gi>

            <n-gi> 上传人：{{ fileInfo.createBy }}</n-gi>
            <n-gi> 上传时间：{{ fileInfo.createTime }}</n-gi>
            <n-gi> 下载次数：{{ fileInfo.downloadCount }}</n-gi>
          </n-grid>

          <n-button v-if="fileInfo" type="primary" ghost @click="downloadFile">下　载</n-button>
        </n-card>

        <div v-if="fileInfo" class="preview">
          <n-scrollbar style="max-height: 70vh">
            <div v-if="previewLoading">加载中...</div>

            <!-- 图片 -->
            <n-image
              v-else-if="fileInfo.ext === 'image'"
              width="80%"
              object-fit="contain"
              :src="previewUrl"
            />

            <!-- 文本 -->
            <pre
              v-else-if="
                fileInfo.ext === 'text' ||
                fileInfo.ext === 'log' ||
                fileInfo.ext === 'json' ||
                fileInfo.ext === 'code'
              "
              style="white-space: pre-wrap; word-break: break-word; margin: 0"
              >{{ previewText }}
            </pre>

            <!-- 其他 -->
            <div v-else>
              {{ previewTip }}
            </div>
          </n-scrollbar>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <n-dropdown
      :show="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      placement="bottom-start"
      trigger="manual"
      :options="ctxOptions"
      @select="handleCtxSelect"
      @clickoutside="closeContextMenu"
    />

    <!-- 新增文件的上传框 -->
    <n-modal
      w="[250px]"
      h="[200px]"
      v-model:show="importBoxShowStatus"
      preset="card"
      title="新增文件"
      flex-height
      draggable
    >
      <n-upload v-if="!uploading" :custom-request="uploadFile">
        <n-upload-dragger>
          <n-icon size="48" :depth="3">
            <component :is="renderAsyncIcon('CloudUploadOutline')" />
          </n-icon>
        </n-upload-dragger>
      </n-upload>

      <div flex justify-center v-else>
        <n-progress type="circle" :percentage="percentage" />
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
/* 使用 :deep 穿透组件样式隔离 */
/* 选中状态下的文字颜色 */
:deep(.n-tree-node.n-tree-node--expanded .n-tree-node-content__text) {
  color: #1890ff !important;
  font-weight: bold;
}

/* 右键高亮 */
:deep(.ctx-selected .n-tree-node-content__text) {
  color: #1ca15b !important;
  font-weight: 700;
}

/* 右键高亮 */
:deep(.ctx-selected .n-tree-node-content__prefix svg) {
  color: #1ca15b !important;
}

/* 找到包裹 n-tree 的 div */
.tree-container > div:first-child {
  min-height: 600px; /* 或者 100% */
  cursor: default;
}

.preview {
  margin-top: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: #efeff5;
}
</style>
