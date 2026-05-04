<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { monitorJvmApi } from '../../shared/api'
import type { JvmGarbageCollectorData } from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatDateTime,
  formatList,
  formatMilliseconds,
  formatNumber,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const gcList = ref<JvmGarbageCollectorData[] | null>(null)
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []

const latestUpdatedAt = computed(() =>
  buildTimestampText((gcList.value ?? []).map((item) => item.timestamp)),
)

const loadData = async () => {
  loading.value = true
  try {
    gcList.value = await monitorJvmApi.gc()
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<JvmGarbageCollectorData[]>('monitor-jvm-gc', (payload) => {
      gcList.value = payload
    }),
  )
}

const cleanup = () => {
  while (unsubscribers.length > 0) {
    unsubscribers.pop()?.()
  }
  disconnect()
}

onMounted(async () => {
  await loadData()
  bindSSE()
})

onBeforeUnmount(() => {
  cleanup()
})

const gcColumns: DataTableColumns<JvmGarbageCollectorData> = [
  { title: 'GC 名称', key: 'name', minWidth: 180, render: (row) => formatText(row.name) },
  {
    title: '累计次数',
    key: 'collectionCount',
    width: 120,
    render: (row) => formatNumber(row.collectionCount),
  },
  {
    title: '累计耗时',
    key: 'collectionTime',
    width: 140,
    render: (row) => formatMilliseconds(row.collectionTime),
  },
  {
    title: '管理内存池',
    key: 'memoryPoolNames',
    minWidth: 260,
    ellipsis: { tooltip: true },
    render: (row) => formatList(row.memoryPoolNames),
  },
  { title: '有效', key: 'valid', width: 100, render: (row) => formatBoolean(row.valid) },
  { title: '时间戳', key: 'timestamp', width: 180, render: (row) => formatDateTime(row.timestamp) },
]
</script>

<template>
  <n-spin :show="loading">
    <div class="monitor-tab">
      <div class="tab-meta">
        <n-tag :bordered="false" :type="isConnected ? 'success' : 'warning'">
          实时数据 {{ isConnected ? '已连接' : '重连中' }}
        </n-tag>
        <n-tag :bordered="false" type="info">最近刷新 {{ latestUpdatedAt }}</n-tag>
      </div>

      <n-card title="GC 收集器视图" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="gcColumns"
          :data="safeArray(gcList)"
          :pagination="false"
          size="small"
          :single-line="false"
          scroll-x="980"
        />
      </n-card>
    </div>
  </n-spin>
</template>

<style scoped>
.monitor-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tab-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.monitor-card {
  border-radius: 3px;
  background: var(--global-bg-container);
}
</style>
