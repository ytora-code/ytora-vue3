<script setup lang="ts" generic="T extends Record<string, any>">
import type { Slots } from 'vue'
import type TableColumn from './type/TableColumn.ts'
import { NButton, NFlex, NPopconfirm, NSwitch, NTag } from 'naive-ui'
import { renderAsyncIcon } from '@/utils/icon.ts'

const props = defineProps<{
  column: TableColumn
  row: T
  slots?: Slots
}>()

const emit = defineEmits<{
  (e: 'action', payload: { eventKey: string; row: T }): void
}>()

/**
 * 统一处理点击/更新事件
 */
const handleAction = (childNode: TableColumn) => {
  emit('action', {
    eventKey: childNode.permissionCode,
    row: props.row,
  })
}

/**
 * 安全地获取行数据中的值并转换为指定类型
 * 解决 row[key] 报错问题
 */
const getRowValue = (key: string): unknown => {
  return props.row[key]
}

/**
 * 解析 Tag 的配置
 * 处理 mapper 映射，例如 "1": "正常::success"
 */
const getTagConfig = (child: TableColumn) => {
  const rawValue = String(getRowValue(child.key))
  const attr = (child.attr || {}) as Record<string, unknown>
  const mapper = attr.mapper as Record<string, string> | undefined

  // 如果定义了映射表且当前值在映射表中
  if (mapper && mapper[rawValue]) {
    const [label, type] = mapper[rawValue].split('::')
    return {
      label: label,
      // 如果分割出的 type 为空，则回退到 attr 默认的 type，再回退到 default
      type: type || attr.type || 'default',
    }
  }

  // 如果没有映射，返回原始值和默认类型
  return {
    label: rawValue !== 'undefined' ? rawValue : child.name,
    type: attr.type || 'default',
  }
}

const RenderVNode = (props: { vnode: unknown }) => props.vnode
</script>

<template>
  <!-- column.colType 在 TableColumn 接口中已定义 -->
  <n-flex v-if="column.colType === 'table-col::flex'" v-bind="column.attr || {}">
    <template v-for="child in column.children" :key="child.id">
      <!-- 1. 按钮 (Button) -->
      <n-button
        v-if="child.colType === 'table-col::button'"
        v-bind="child.attr"
        @click="handleAction(child)"
      >
        {{ child.name }}
      </n-button>

      <!-- 2. 标签 (Tag) -->
      <n-tag
        v-else-if="child.colType === 'table-col::tag'"
        v-bind="child.attr"
        :type="getTagConfig(child).type"
      >
        {{ getTagConfig(child).label }}
      </n-tag>

      <!-- 3. 开关 (Switch) -->
      <n-switch
        v-else-if="child.colType === 'table-col::switch'"
        :value="getRowValue(child.key)"
        v-bind="child.attr"
        @update:value="() => handleAction(child)"
      />

      <!-- 4. 气泡确认框 (Popconfirm) -->
      <n-popconfirm
        v-else-if="child.colType === 'table-col::popconfirm'"
        @positive-click="handleAction(child)"
      >
        <template #trigger>
          <n-button v-bind="child.attr">{{ child.name }}</n-button>
        </template>
        确定执行此操作吗？
      </n-popconfirm>

      <!-- 5. 图标列 -->
      <!-- 只有当 child.icon 存在时才渲染 -->
      <component
        v-else-if="child.colType === 'table-col::icon' && getRowValue('icon')"
        :is="renderAsyncIcon(getRowValue('icon'), child.attr)"
      />

      <template v-else-if="child.colType === 'table-col::slot'">
        <RenderVNode
          v-if="props.slots?.[child.permissionCode]"
          :vnode="props.slots[child.permissionCode]!({ row, column, child })"
        />
      </template>
    </template>
  </n-flex>
</template>
