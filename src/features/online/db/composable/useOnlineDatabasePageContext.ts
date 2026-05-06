import { computed, inject, provide, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { DatabaseTreeNode } from '../type'

type OnlineDatabasePageContext = {
  activeTableNode: Ref<DatabaseTreeNode | null>
  detailSubtitle: ComputedRef<string>
  detailTitle: ComputedRef<string>
  setActiveTableNode: (node: DatabaseTreeNode | null) => void
}

const onlineDatabasePageContextKey: InjectionKey<OnlineDatabasePageContext> = Symbol(
  'onlineDatabasePageContext',
)

export const provideOnlineDatabasePageContext = () => {
  const activeTableNode = ref<DatabaseTreeNode | null>(null)

  const detailTitle = computed(() => {
    const node = activeTableNode.value
    if (!node) return '数据库对象详情'
    return node.comment
      ? `${node.objectName} (${node.comment})`
      : (node.objectName ?? '数据库对象详情')
  })

  const detailSubtitle = computed(() => {
    const node = activeTableNode.value
    if (!node) return '从左侧树选择一个表或视图后，这里显示真实数据与结构信息'
    return `${node.dataSourceName} / ${node.schemaName} / ${node.kind === 'view' ? '视图' : '表'}`
  })

  const context: OnlineDatabasePageContext = {
    activeTableNode,
    detailSubtitle,
    detailTitle,
    setActiveTableNode: (node) => {
      activeTableNode.value = node
    },
  }

  provide(onlineDatabasePageContextKey, context)

  return context
}

export const useOnlineDatabasePageContext = () => {
  const context = inject(onlineDatabasePageContextKey)
  if (!context) {
    throw new Error('useOnlineDatabasePageContext must be used within provider')
  }
  return context
}
