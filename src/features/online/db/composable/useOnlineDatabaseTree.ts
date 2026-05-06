import { h, onMounted, ref, watch } from 'vue'
import type { TreeOption } from 'naive-ui'
import useIconStore from '@/stores/useIconStore'
import { onlineDatabaseApi } from '../api/OnlineDatabaseApi'
import {
  collectMatchedExpandedKeys,
  collectTreeIconCodes,
  createCategoryNode,
  createDataSourceNode,
  createObjectNode,
  createSchemaNode,
  findNodeByKey,
  isObjectCategoryNode,
  objectCategoryList,
  objectKindMap,
  resolveDataSourceIconCode,
  treeIconCodeMap,
} from './shared'
import type {
  DatabaseObjectCategoryKind,
  DatabaseTreeNode,
  OnlineDatabaseDataSource,
  OnlineDatabaseObjectMeta,
} from '../type'

type UseOnlineDatabaseTreeOptions = {
  onTableNodeSelect?: (node: DatabaseTreeNode) => Promise<void> | void
  onNodeUnselectTable?: () => void
}

const createRemoteIconVNode = (iconData: { body?: string; width?: number; height?: number }) =>
  h('svg', {
    viewBox: `0 0 ${iconData.width ?? 24} ${iconData.height ?? 24}`,
    width: '1em',
    height: '1em',
    'aria-hidden': 'true',
    focusable: 'false',
    innerHTML: iconData.body ?? '',
  })

export const useOnlineDatabaseTree = (options: UseOnlineDatabaseTreeOptions = {}) => {
  const iconStore = useIconStore()

  const treeKeyword = ref('')
  const treeLoading = ref(false)
  const treeData = ref<DatabaseTreeNode[]>([])
  const expandedKeys = ref<string[]>([])
  const selectedKeys = ref<string[]>([])
  const loadingNodeKeys = ref<string[]>([])
  const selectedNode = ref<DatabaseTreeNode | null>(null)

  const treeFilter = (pattern: string, node: { label?: string | number }) =>
    String(node.label ?? '')
      .toLowerCase()
      .includes(pattern.trim().toLowerCase())

  const isNodeLoading = (key: string) => loadingNodeKeys.value.includes(key)

  const pushLoadingNodeKey = (key: string) => {
    if (!isNodeLoading(key)) {
      loadingNodeKeys.value = [...loadingNodeKeys.value, key]
    }
  }

  const removeLoadingNodeKey = (key: string) => {
    loadingNodeKeys.value = loadingNodeKeys.value.filter((item) => item !== key)
  }

  const refreshTree = () => {
    treeData.value = [...treeData.value]
  }

  const ensureTreeIcons = async (dataSources: OnlineDatabaseDataSource[]) => {
    await iconStore.ensureIcons(collectTreeIconCodes(dataSources))
  }

  const loadDataSources = async () => {
    treeLoading.value = true
    try {
      const dataSources = await onlineDatabaseApi.dataSources()
      treeData.value = dataSources.map((item) => createDataSourceNode(item))
      void ensureTreeIcons(dataSources)
    } finally {
      treeLoading.value = false
    }
  }

  const loadCategoryObjects = async (
    kind: DatabaseObjectCategoryKind,
    ds: string,
    schema: string,
  ): Promise<OnlineDatabaseObjectMeta[]> => {
    switch (kind) {
      case 'tables':
        return onlineDatabaseApi.tables(ds, schema)
      case 'views':
        return onlineDatabaseApi.views(ds, schema)
      case 'functions':
        return onlineDatabaseApi.functions(ds, schema)
      case 'procedures':
        return onlineDatabaseApi.procedures(ds, schema)
      case 'sequences':
        return onlineDatabaseApi.sequences(ds, schema)
    }
  }

  const handleNodeLoad = async (option: TreeOption) => {
    const node = option as DatabaseTreeNode
    if (!node || node.loaded || isNodeLoading(node.key)) {
      return
    }

    pushLoadingNodeKey(node.key)
    try {
      if (node.kind === 'dataSource' && node.dataSourceName) {
        const ds = node.dataSourceName
        const schemas = await onlineDatabaseApi.schemas(ds)
        node.children = schemas.map((schema) => createSchemaNode(ds, schema))
        node.loaded = true
        refreshTree()
        return
      }

      if (node.kind === 'schema' && node.dataSourceName && node.schemaName) {
        const ds = node.dataSourceName
        const schema = node.schemaName
        node.children = objectCategoryList.map((item) =>
          createCategoryNode(ds, schema, item.kind, item.label),
        )
        node.loaded = true
        refreshTree()
        return
      }

      if (isObjectCategoryNode(node) && node.dataSourceName && node.schemaName) {
        const ds = node.dataSourceName
        const schema = node.schemaName
        const objectList = await loadCategoryObjects(node.kind, ds, schema)
        node.children = objectList.map((item) =>
          createObjectNode(ds, schema, objectKindMap[node.kind], item),
        )
        node.loaded = true
        refreshTree()
      }
    } finally {
      removeLoadingNodeKey(node.key)
    }
  }

  const handleTreeSelect = async (keys: Array<string | number>) => {
    const nextKeys = keys.map((item) => String(item))
    selectedKeys.value = nextKeys

    const key = nextKeys[0]
    if (!key) {
      selectedNode.value = null
      options.onNodeUnselectTable?.()
      return
    }

    const node = findNodeByKey(treeData.value, key)
    selectedNode.value = node ?? null

    if (!node) {
      return
    }

    if (node.kind === 'table' || node.kind === 'view') {
      await options.onTableNodeSelect?.(node)
      return
    }

    options.onNodeUnselectTable?.()
  }

  const handleExpandedKeysUpdate = (keys: Array<string | number>) => {
    expandedKeys.value = keys.map((item) => String(item))
  }

  const renderPrefix = ({ option }: { option: TreeOption }) => {
    const node = option as DatabaseTreeNode
    const iconCode = isNodeLoading(node.key)
      ? 'i-lucide-loader-circle'
      : node.kind === 'dataSource'
        ? resolveDataSourceIconCode(node.rawMeta as OnlineDatabaseDataSource | undefined)
        : treeIconCodeMap[node.kind]

    const iconData = iconStore.getCachedIcon(iconCode)
    if (!iconData?.body) {
      void iconStore.ensureIcon(iconCode)
      return h('span', {
        class: isNodeLoading(node.key)
          ? 'online-db__tree-icon online-db__tree-icon--spin'
          : node.kind === 'dataSource'
            ? 'online-db__db-logo'
            : 'online-db__tree-icon',
      })
    }

    return h(
      'span',
      {
        class: isNodeLoading(node.key)
          ? 'online-db__tree-icon online-db__tree-icon--spin'
          : node.kind === 'dataSource'
            ? 'online-db__db-logo'
            : 'online-db__tree-icon',
      },
      [createRemoteIconVNode(iconData)],
    )
  }

  watch(
    () => [treeKeyword.value, treeData.value] as const,
    ([keyword]) => {
      expandedKeys.value = collectMatchedExpandedKeys(treeData.value, keyword, expandedKeys.value)
    },
    { immediate: true },
  )

  onMounted(async () => {
    await loadDataSources()
  })

  return {
    expandedKeys,
    handleExpandedKeysUpdate,
    handleNodeLoad,
    handleTreeSelect,
    renderPrefix,
    selectedKeys,
    selectedNode,
    treeData,
    treeFilter,
    treeKeyword,
    treeLoading,
  }
}
