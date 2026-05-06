import { computed, ref, watch } from 'vue'
import { onlineDatabaseApi } from '../api/OnlineDatabaseApi'
import { resolveObjectName } from './shared'
import { useOnlineDatabasePageContext } from './useOnlineDatabasePageContext'
import type { OnlineDatabaseObjectMeta } from '../type'

const objectMetaCache = new Map<string, OnlineDatabaseObjectMeta | null>()
const objectMetaPromiseCache = new Map<string, Promise<OnlineDatabaseObjectMeta | null>>()

const buildObjectMetaCacheKey = (
  kind: 'table' | 'view',
  ds: string,
  schema: string,
  name: string,
) => `${kind}:${ds}:${schema}:${name}`

const fetchObjectMeta = async (
  kind: 'table' | 'view',
  ds: string,
  schema: string,
  name: string,
): Promise<OnlineDatabaseObjectMeta | null> => {
  const cacheKey = buildObjectMetaCacheKey(kind, ds, schema, name)
  const cached = objectMetaCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const pending = objectMetaPromiseCache.get(cacheKey)
  if (pending) {
    return pending
  }

  const request = (async () => {
    const objectList =
      kind === 'view'
        ? await onlineDatabaseApi.views(ds, schema)
        : await onlineDatabaseApi.tables(ds, schema)
    const meta = objectList.find((item) => resolveObjectName(item) === name) ?? null
    objectMetaCache.set(cacheKey, meta)
    return meta
  })()

  objectMetaPromiseCache.set(cacheKey, request)

  try {
    return await request
  } finally {
    objectMetaPromiseCache.delete(cacheKey)
  }
}

export const useOnlineDatabaseObjectMeta = () => {
  const { activeTableNode } = useOnlineDatabasePageContext()

  const loading = ref(false)
  const objectMeta = ref<OnlineDatabaseObjectMeta | null>(null)
  let requestId = 0

  const canLoad = computed(() => {
    const node = activeTableNode.value
    return Boolean(
      node &&
      (node.kind === 'table' || node.kind === 'view') &&
      node.dataSourceName &&
      node.schemaName &&
      node.objectName,
    )
  })

  const loadObjectMeta = async (force = false) => {
    const node = activeTableNode.value
    if (!canLoad.value || !node?.dataSourceName || !node.schemaName || !node.objectName) {
      objectMeta.value = null
      return null
    }

    const kind = node.kind === 'view' ? 'view' : 'table'
    const cacheKey = buildObjectMetaCacheKey(
      kind,
      node.dataSourceName,
      node.schemaName,
      node.objectName,
    )
    if (force) {
      objectMetaCache.delete(cacheKey)
    }

    const currentRequestId = ++requestId
    loading.value = true
    try {
      const nextMeta = await fetchObjectMeta(
        kind,
        node.dataSourceName,
        node.schemaName,
        node.objectName,
      )
      if (currentRequestId === requestId) {
        objectMeta.value = nextMeta
      }
      return nextMeta
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  watch(
    activeTableNode,
    async () => {
      objectMeta.value = null
      await loadObjectMeta()
    },
    { immediate: true },
  )

  return {
    loading,
    objectMeta,
    loadObjectMeta,
  }
}
