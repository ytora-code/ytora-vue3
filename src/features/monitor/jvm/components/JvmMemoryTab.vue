<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MonitorChart from '../../shared/components/MonitorChart.vue'
import { monitorJvmApi } from '../../shared/api'
import { useMonitorChartTheme } from '../../shared/composable/useMonitorChartTheme'
import { useTimeSeries } from '../../shared/composable/useTimeSeries'
import type { JvmBufferPoolItem, JvmMemoryData, JvmMemoryPoolItem } from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatNumber,
  formatPercent,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const memory = ref<JvmMemoryData | null>(null)
const chartTheme = useMonitorChartTheme()
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []
const { labels: timelineLabels, createSeries, push } = useTimeSeries()

const heapTrend = createSeries()
const nonHeapTrend = createSeries()

const latestUpdatedAt = computed(() => buildTimestampText([memory.value?.timestamp]))

const syncSeries = () => {
  push(memory.value?.timestamp, [
    { series: heapTrend, value: memory.value?.heap?.usedRate },
    { series: nonHeapTrend, value: memory.value?.nonHeap?.usedRate },
  ])
}

const loadData = async () => {
  loading.value = true
  try {
    memory.value = await monitorJvmApi.memory()
    syncSeries()
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<JvmMemoryData>('monitor-jvm-memory', (payload) => {
      memory.value = payload
      syncSeries()
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

const memoryTrendOption = computed<EChartsOption>(() => ({
  color: ['#2080f0', '#18a058'],
  tooltip: {
    trigger: 'axis',
    backgroundColor: chartTheme.value.tooltipBackgroundColor,
    borderColor: chartTheme.value.tooltipBorderColor,
    textStyle: { color: chartTheme.value.tooltipTextColor },
  },
  legend: { top: 0, textStyle: { color: chartTheme.value.legendTextColor } },
  grid: { top: 42, left: 14, right: 18, bottom: 12, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: timelineLabels.value,
    axisLabel: { color: chartTheme.value.axisLabelColor },
  },
  yAxis: {
    type: 'value',
    name: '使用率(%)',
    axisLabel: { color: chartTheme.value.axisLabelColor },
    splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
  },
  series: [
    {
      name: 'Heap 使用率',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(32, 128, 240, 0.12)' },
      data: heapTrend.value,
    },
    {
      name: 'Non-Heap 使用率',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(24, 160, 88, 0.12)' },
      data: nonHeapTrend.value,
    },
  ],
}))

const poolColumns: DataTableColumns<JvmMemoryPoolItem> = [
  { title: '内存池', key: 'name', minWidth: 180, render: (row) => formatText(row.name) },
  { title: '类型', key: 'type', width: 120, render: (row) => formatText(row.type) },
  {
    title: '当前已用',
    key: 'usageUsed',
    width: 140,
    render: (row) => formatText(row.usage?.usedText),
  },
  {
    title: '当前上限',
    key: 'usageMax',
    width: 140,
    render: (row) => formatText(row.usage?.maxText),
  },
  {
    title: '当前占用率',
    key: 'usageRate',
    width: 120,
    render: (row) => formatPercent(row.usage?.usedRate),
  },
  {
    title: '峰值已用',
    key: 'peakUsage',
    width: 140,
    render: (row) => formatText(row.peakUsage?.usedText),
  },
  {
    title: 'GC 后已用',
    key: 'collectionUsage',
    width: 140,
    render: (row) => formatText(row.collectionUsage?.usedText),
  },
  {
    title: '阈值支持',
    key: 'usageThresholdSupported',
    width: 120,
    render: (row) => formatBoolean(row.usageThresholdSupported),
  },
]

const bufferColumns: DataTableColumns<JvmBufferPoolItem> = [
  { title: 'Buffer Pool', key: 'name', width: 180, render: (row) => formatText(row.name) },
  { title: 'Buffer 数量', key: 'count', width: 120, render: (row) => formatNumber(row.count) },
  {
    title: '已用内存',
    key: 'memoryUsedText',
    width: 140,
    render: (row) => formatText(row.memoryUsedText),
  },
  {
    title: '总容量',
    key: 'totalCapacityText',
    width: 140,
    render: (row) => formatText(row.totalCapacityText),
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

      <n-card title="JVM 内存实时历史" :bordered="false" class="monitor-card">
        <MonitorChart :option="memoryTrendOption" :height="320" />
      </n-card>

      <div class="area-grid">
        <n-card title="Heap" :bordered="false" class="monitor-card">
          <div class="area-card">
            <n-progress
              type="line"
              indicator-placement="inside"
              :percentage="memory?.heap?.usedRate ?? 0"
            />
            <div class="area-card__meta">
              <div class="area-card__item">
                <div class="area-card__label">已用</div>
                <div class="area-card__value">{{ formatText(memory?.heap?.usedText) }}</div>
              </div>
              <div class="area-card__item">
                <div class="area-card__label">已提交</div>
                <div class="area-card__value">{{ formatText(memory?.heap?.committedText) }}</div>
              </div>
              <div class="area-card__item">
                <div class="area-card__label">上限</div>
                <div class="area-card__value">{{ formatText(memory?.heap?.maxText) }}</div>
              </div>
            </div>
          </div>
        </n-card>

        <n-card title="Non-Heap" :bordered="false" class="monitor-card">
          <div class="area-card">
            <n-progress
              type="line"
              indicator-placement="inside"
              :percentage="memory?.nonHeap?.usedRate ?? 0"
            />
            <div class="area-card__meta">
              <div class="area-card__item">
                <div class="area-card__label">已用</div>
                <div class="area-card__value">{{ formatText(memory?.nonHeap?.usedText) }}</div>
              </div>
              <div class="area-card__item">
                <div class="area-card__label">已提交</div>
                <div class="area-card__value">{{ formatText(memory?.nonHeap?.committedText) }}</div>
              </div>
              <div class="area-card__item">
                <div class="area-card__label">上限</div>
                <div class="area-card__value">{{ formatText(memory?.nonHeap?.maxText) }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <n-card title="附加信息" :bordered="false" class="monitor-card">
        <div class="summary-chip">
          待 Finalize 对象数：{{ formatNumber(memory?.objectPendingFinalizationCount) }}
        </div>
      </n-card>

      <n-card title="Memory Pools" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="poolColumns"
          :data="safeArray(memory?.memoryPools)"
          :pagination="{ pageSize: 8 }"
          size="small"
          :single-line="false"
          scroll-x="1260"
        />
      </n-card>

      <n-card title="Buffer Pools" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="bufferColumns"
          :data="safeArray(memory?.bufferPools)"
          :pagination="false"
          size="small"
          :single-line="false"
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

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.area-card__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.area-card__item,
.summary-chip {
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--global-bg-container) 88%, var(--global-fill-color));
}

.area-card__label {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.area-card__value {
  margin-top: 8px;
  color: var(--global-text-color);
  font-size: 15px;
  font-weight: 600;
}

.summary-chip {
  color: var(--global-text-color);
  font-weight: 600;
}

@media (max-width: 768px) {
  .area-grid,
  .area-card__meta {
    grid-template-columns: 1fr;
  }
}
</style>
