<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NTree, type TreeOption } from 'naive-ui'
import { fileApi } from './api/FileApi.ts'
import type SysFolder from './type/resp/SysFolder.ts'
import { renderAsyncIcon } from '@/utils/icon'

const folders = ref<SysFolder[]>([
  {
    path: '/',
    depth: 0,
  },
])
const loading = ref(true)

// 用于存放当前展开节点的 ID
const expandedKeys = ref<Array<string | number>>([])
const selectedKeys = ref<Array<string | number>>([])

/**
 * 渲染图标逻辑
 */
const renderPrefix = ({
  option,
  selected,
}: {
  option: TreeOption
  checked: boolean
  selected: boolean // 这里能直接拿到选中状态
}) => {
  let iconName = 'FolderOutline'
  if (!option.isLeaf) {
    const isExpanded = expandedKeys.value.includes(option.id as string | number)
    iconName = isExpanded ? 'FolderOpen' : 'FolderOutline'
  }

  // 设置图标样式
  const iconRender = renderAsyncIcon(iconName, {
    color: selected ? '#1890ff' : undefined,
    size: 18,
  })

  return iconRender ? iconRender() : null
}

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick: () => {
      const id = option.id as string

      // 1. 如果是叶子节点（文件），直接触发
      if (option.isLeaf) {
        selectedKeys.value = [id]
        fetchFolderData(id)
        return
      }

      // 2. 核心判断：检查当前节点是否在 expandedKeys 中
      // 因为 onClick 触发时，组件内部的 toggle 还没执行，
      // 所以此时的 isExpanded 代表的是点击前的状态。
      const isNowExpanded = expandedKeys.value.includes(id)

      if (isNowExpanded) {
        fetchFolderData(id)
      }

      selectedKeys.value = [id]
    },
  }
}

/**
 * 核心请求函数
 */
const fetchFolderData = (id: string) => {
  console.log('加载文件夹数据:', id)
}

// 获取数据
onMounted(async () => {
  try {
    loading.value = true
    folders.value = await fileApi.treeFolder()
  } catch (error) {
    console.error('Failed to fetch folders:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="tree-container" w="[300px]" p-6>
    <n-tree
      block-line
      expand-on-click
      v-model:expanded-keys="expandedKeys"
      :data="folders as unknown as TreeOption[]"
      key-field="id"
      label-field="path"
      children-field="children"
      :render-prefix="renderPrefix"
      :node-props="nodeProps"
    />
  </div>
</template>

<style scoped>
/* 使用 :deep 穿透组件样式隔离 */
/* 选中状态下的文字颜色 */
:deep(.n-tree-node.n-tree-node--selected .n-tree-node-content__text) {
  color: #1890ff !important;
  font-weight: bold;
}
</style>
