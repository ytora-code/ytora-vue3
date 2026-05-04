<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { monitorOsApi } from '../../shared/api'
import type {
  OsDiskDynamicData,
  OsDiskIoRate,
  OsDiskStaticData,
  OsLogicalPartition,
  OsPartitionUsage,
  OsPhysicalDisk,
} from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBytes,
  formatBytesPerSecond,
  formatPercent,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const diskStatic = ref<OsDiskStaticData | null>(null)
const diskDynamic = ref<OsDiskDynamicData | null>(null)
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []

const latestUpdatedAt = computed(() => buildTimestampText([diskDynamic.value?.timestamp]))

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      monitorOsApi.diskStatic(),
      monitorOsApi.diskDynamic(),
    ])
    if (results[0].status === 'fulfilled') diskStatic.value = results[0].value
    if (results[1].status === 'fulfilled') diskDynamic.value = results[1].value
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<OsDiskDynamicData>('monitor-os-disk', (payload) => {
      diskDynamic.value = payload
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

const physicalColumns: DataTableColumns<OsPhysicalDisk> = [
  { title: '设备名', key: 'name', width: 180, render: (row) => formatText(row.name) },
  {
    title: '型号',
    key: 'model',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.model),
  },
  { title: '容量', key: 'size', width: 140, render: (row) => formatBytes(row.size) },
]

const logicalColumns: DataTableColumns<OsLogicalPartition> = [
  { title: '挂载点', key: 'mount', width: 220, render: (row) => formatText(row.mount) },
  { title: '文件系统', key: 'type', width: 140, render: (row) => formatText(row.type) },
  { title: '总容量', key: 'total', width: 140, render: (row) => formatBytes(row.total) },
]

const partitionColumns: DataTableColumns<OsPartitionUsage> = [
  { title: '挂载点', key: 'mount', width: 220, render: (row) => formatText(row.mount) },
  { title: '已用', key: 'used', width: 140, render: (row) => formatBytes(row.used) },
  { title: '空闲', key: 'free', width: 140, render: (row) => formatBytes(row.free) },
  { title: '占用率', key: 'usageRate', width: 120, render: (row) => formatPercent(row.usageRate) },
]

const ioColumns: DataTableColumns<OsDiskIoRate> = [
  { title: '磁盘', key: 'name', width: 220, render: (row) => formatText(row.name) },
  {
    title: '读取速率',
    key: 'readSpeed',
    width: 160,
    render: (row) => formatBytesPerSecond(row.readSpeed),
  },
  {
    title: '写入速率',
    key: 'writeSpeed',
    width: 160,
    render: (row) => formatBytesPerSecond(row.writeSpeed),
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

      <n-card title="物理磁盘" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="physicalColumns"
          :data="safeArray(diskStatic?.physicalDisks)"
          :pagination="false"
          size="small"
        />
      </n-card>

      <n-card title="逻辑分区" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="logicalColumns"
          :data="safeArray(diskStatic?.logicalPartitions)"
          :pagination="false"
          size="small"
        />
      </n-card>

      <div class="two-column-grid">
        <n-card title="分区占用率" :bordered="false" class="monitor-card">
          <n-data-table
            :columns="partitionColumns"
            :data="safeArray(diskDynamic?.partitionUsages)"
            :pagination="false"
            size="small"
          />
        </n-card>

        <n-card title="磁盘 IO 速率" :bordered="false" class="monitor-card">
          <n-data-table
            :columns="ioColumns"
            :data="safeArray(diskDynamic?.ioRates)"
            :pagination="false"
            size="small"
          />
        </n-card>
      </div>
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

.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.monitor-card {
  border-radius: 3px;
  background: var(--global-bg-container);
}

@media (max-width: 768px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>
