<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { monitorOsApi } from '../../shared/api'
import type { OsNetDynamicData, OsProcessData } from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBytes,
  formatBytesPerSecond,
  formatDurationMs,
  formatNumber,
  formatPercent,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const network = ref<OsNetDynamicData[] | null>(null)
const topProcesses = ref<OsProcessData[] | null>(null)
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []

const latestUpdatedAt = computed(() =>
  buildTimestampText([...(network.value ?? []).map((item) => item.timestamp)]),
)

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([monitorOsApi.network(), monitorOsApi.topProcesses()])
    if (results[0].status === 'fulfilled') network.value = results[0].value
    if (results[1].status === 'fulfilled') topProcesses.value = results[1].value
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<OsNetDynamicData[]>('monitor-os-network', (payload) => {
      network.value = payload
    }),
  )
  unsubscribers.push(
    subscribe<OsProcessData[]>('monitor-os-top-processes', (payload) => {
      topProcesses.value = payload
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

const networkColumns: DataTableColumns<OsNetDynamicData> = [
  { title: '网卡', key: 'ifaceName', width: 180, render: (row) => formatText(row.ifaceName) },
  {
    title: '接收速率',
    key: 'rxSpeed',
    width: 160,
    render: (row) => formatBytesPerSecond(row.rxSpeed),
  },
  {
    title: '发送速率',
    key: 'txSpeed',
    width: 160,
    render: (row) => formatBytesPerSecond(row.txSpeed),
  },
  { title: '累计接收', key: 'rxBytes', width: 160, render: (row) => formatBytes(row.rxBytes) },
  { title: '累计发送', key: 'txBytes', width: 160, render: (row) => formatBytes(row.txBytes) },
]

const processColumns: DataTableColumns<OsProcessData> = [
  { title: 'PID', key: 'pid', width: 100, render: (row) => formatNumber(row.pid) },
  {
    title: '进程名',
    key: 'name',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.name),
  },
  {
    title: 'CPU 使用率',
    key: 'cpuUsage',
    width: 120,
    render: (row) => formatPercent(row.cpuUsage),
  },
  { title: '内存占用', key: 'memUsage', width: 140, render: (row) => formatBytes(row.memUsage) },
  { title: '运行时长', key: 'uptime', width: 160, render: (row) => formatDurationMs(row.uptime) },
  {
    title: '路径',
    key: 'path',
    minWidth: 240,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.path),
  },
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

      <n-card title="网络实时速率" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="networkColumns"
          :data="safeArray(network)"
          :pagination="false"
          size="small"
          :single-line="false"
        />
      </n-card>

      <n-card title="Top 进程" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="processColumns"
          :data="safeArray(topProcesses)"
          :pagination="false"
          size="small"
          :single-line="false"
          scroll-x="1100"
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
