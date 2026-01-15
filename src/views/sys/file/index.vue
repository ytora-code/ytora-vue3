<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NTree, type TreeOption } from 'naive-ui'
import { fileApi } from './api/FileApi.ts'
import type SysFolder from './type/resp/SysFolder.ts'
import { renderAsyncIcon } from '@/utils/icon'
import useFileType from './composable/useFileType.ts'
import type SysFile from '@/views/sys/file/type/resp/SysFile.ts'

const { classifyByMime, fileKindToIcon } = useFileType()

const loadedKeys = ref<Set<string | number>>(new Set())

const folders = ref<TreeOption[]>([])
const loading = ref(true)

// 用于存放当前展开节点的 ID
const expandedKeys = ref<Array<string | number>>([])
const selectedKeys = ref<Array<string | number>>([])

/**
 * SysFolder → TreeOption
 */
const toOption = (f: SysFolder): TreeOption => {
  const isFile = f.type === 2
  return {
    id: f.id,
    path: f.path,
    isLeaf: isFile,
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
  const options = list.map(toOption)

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
 * 右键菜单状态
 */
const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)
const ctxSelectedKey = ref<string | number | null>(null)
const ctxNode = ref<TreeOption | null>(null)

const isFileNode = (opt: TreeOption) => (opt.raw as SysFolder | undefined)?.type === 2
const getNodeId = (opt: TreeOption) => opt.id as string | number

// 你可以替换成你喜欢的图标渲染
const menuIcon = (name: string) => {
  const iconRender = renderAsyncIcon(name, { size: 16 })
  return iconRender ? iconRender() : null
}

/**
 * 根据右键目标动态生成菜单
 */
const ctxOptions = computed<DropdownOption[]>(() => {
  const opt = ctxNode.value
  if (!opt) return []

  const isFile = isFileNode(opt)

  // 文件：允许重命名、删除（以及你想要的“编辑文件”等）
  if (isFile) {
    return [
      { label: '重命名', key: 'rename', icon: () => menuIcon('CreateOutline') },
      { label: '删除文件', key: 'delete', icon: () => menuIcon('TrashOutline') },
    ]
  }

  // 文件夹：允许新增子文件夹/文件、重命名、删除
  return [
    { label: '新增文件夹', key: 'mkdir', icon: () => menuIcon('FolderOpenOutline') },
    { label: '新增文件', key: 'mkfile', icon: () => menuIcon('DocumentOutline') },
    { type: 'divider', key: 'd1' },
    { label: '重命名', key: 'rename', icon: () => menuIcon('CreateOutline') },
    { label: '删除文件夹', key: 'delete', icon: () => menuIcon('TrashOutline') },
  ]
})

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
 * 执行右键菜单动作（你把这里接上 API + 弹窗即可）
 */
const handleCtxSelect = async (key: string | number) => {
  const opt = ctxNode.value
  if (!opt) return

  const id = getNodeId(opt)
  const isFile = isFileNode(opt)

  ctxVisible.value = false
  ctxSelectedKey.value = null

  switch (key) {
    case 'delete': {
      console.log('删除', { isFile, id })
      break
    }
    case 'mkdir': {
      console.log('新增文件夹 under', id)
      break
    }
    case 'mkfile': {
      console.log('新增文件 under', id)
      break
    }
    case 'rename': {
      console.log('重命名', { isFile, id })
      break
    }
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
    folders.value = top.map(toOption)
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
      <div w="[300px]" flex-shrink-0>
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

.preview {
  margin-top: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: #efeff5;
}
</style>
