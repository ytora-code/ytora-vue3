<script setup lang="ts">
import type { TreeOption, TreeRenderPrefix } from 'naive-ui'
import { NIcon } from 'naive-ui'
import { h, ref } from 'vue'
import {
  FolderOutline,
  FolderOpenOutline,
  DocumentOutline,
  ChevronForwardOutline,
} from '@vicons/ionicons5'
// 如果你有自己的 renderAsyncIcon，也可以替换成你的

function createData() {
  return [
    { label: nextLabel(), key: '1', isLeaf: false },
    { label: nextLabel(), key: '2', isLeaf: false },
  ]
}

function nextLabel(currentLabel?: string): string {
  if (!currentLabel) return 'Out of Tao, One is born'
  if (currentLabel === 'Out of Tao, One is born') return 'Out of One, Two'
  if (currentLabel === 'Out of One, Two') return 'Out of Two, Three'
  if (currentLabel === 'Out of Two, Three') return 'Out of Three, the created universe'
  if (currentLabel === 'Out of Three, the created universe') return 'Out of Tao, One is born'
  return ''
}

const expandedKeysRef = ref<string[]>([])
const checkedKeysRef = ref<string[]>([])
const dataRef = ref<TreeOption[]>(createData())

function handleExpandedKeysChange(expandedKeys: string[]) {
  expandedKeysRef.value = expandedKeys
}

function handleCheckedKeysChange(checkedKeys: string[]) {
  checkedKeysRef.value = checkedKeys
}

// ✅ 文件/文件夹 icon（不会旋转）
const renderPrefix: TreeRenderPrefix = ({ option }) => {
  const isExpanded = expandedKeysRef.value.includes(String(option.key))
  const isDir = option.isLeaf === false

  let iconComp
  if (isDir) iconComp = isExpanded ? FolderOpenOutline : FolderOutline
  else iconComp = DocumentOutline

  return h(NIcon, null, { default: () => h(iconComp) })
}

// ✅ switcher 用箭头（旋转就让它旋转，符合预期）
function renderSwitcherIcon() {
  return h(NIcon, null, { default: () => h(ChevronForwardOutline) })
}

function handleLoad(node: TreeOption) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      node.children = [
        {
          label: nextLabel(node.label as string),
          key: String(node.key) + '-' + nextLabel(node.label as string),
          isLeaf: false,
        },
      ]
      resolve()
    }, 600)
  })
}
</script>

<template>
  <n-space vertical>
    <n-tree
      block-line
      :data="dataRef"
      :checked-keys="checkedKeysRef"
      :expanded-keys="expandedKeysRef"
      :on-load="handleLoad"
      :render-prefix="renderPrefix"
      :render-switcher-icon="renderSwitcherIcon"
      expand-on-click
      @update:checked-keys="handleCheckedKeysChange"
      @update:expanded-keys="handleExpandedKeysChange"
    />
    {{ JSON.stringify(checkedKeysRef) }}
  </n-space>
</template>
