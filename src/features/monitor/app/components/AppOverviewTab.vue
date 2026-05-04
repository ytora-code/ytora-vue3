<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MonitorChart from '../../shared/components/MonitorChart.vue'
import MonitorKeyValueGrid from '../../shared/components/MonitorKeyValueGrid.vue'
import MonitorMetricCard from '../../shared/components/MonitorMetricCard.vue'
import { monitorAppApi } from '../../shared/api'
import { useMonitorChartTheme } from '../../shared/composable/useMonitorChartTheme'
import { useTimeSeries } from '../../shared/composable/useTimeSeries'
import type { AppBasicInfoData, AppOverviewData, AppStatusData } from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatDateTime,
  formatDurationMs,
  formatList,
  formatNumber,
  formatStatusText,
  formatText,
  renderStatusTag,
  safeArray,
  statusTagType,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const basicInfo = ref<AppBasicInfoData | null>(null)
const overview = ref<AppOverviewData | null>(null)
const status = ref<AppStatusData | null>(null)

const chartTheme = useMonitorChartTheme()
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []
const { labels: timelineLabels, createSeries, push } = useTimeSeries()

const requestTrend = createSeries()
const requestDurationTrend = createSeries()
const errorTrend = createSeries()

const latestUpdatedAt = computed(() =>
  buildTimestampText([overview.value?.timestamp, status.value?.timestamp]),
)

const syncSeries = () => {
  push(overview.value?.timestamp, [
    { series: requestTrend, value: overview.value?.activeRequestCount },
    { series: requestDurationTrend, value: overview.value?.averageDurationMs },
    { series: errorTrend, value: overview.value?.recentErrorCount },
  ])
}

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      monitorAppApi.basicInfo(),
      monitorAppApi.overview(),
      monitorAppApi.status(),
    ])

    if (results[0].status === 'fulfilled') basicInfo.value = results[0].value
    if (results[1].status === 'fulfilled') overview.value = results[1].value
    if (results[2].status === 'fulfilled') status.value = results[2].value
    syncSeries()
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<AppOverviewData>('monitor-app-overview', (payload) => {
      overview.value = payload
      syncSeries()
    }),
  )
  unsubscribers.push(
    subscribe<AppStatusData>('monitor-app-status', (payload) => {
      status.value = payload
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

const basicInfoItems = computed(() => [
  { label: '应用名称', value: formatText(basicInfo.value?.applicationName) },
  { label: '应用版本', value: formatText(basicInfo.value?.applicationVersion) },
  { label: '上下文路径', value: formatText(basicInfo.value?.contextPath), mono: true },
  { label: '服务端口', value: formatText(basicInfo.value?.port) },
  { label: '运行 Profile', value: formatList(basicInfo.value?.activeProfiles ?? null) },
  { label: '进程 PID', value: formatNumber(basicInfo.value?.pid) },
  { label: '启动时间', value: formatDateTime(basicInfo.value?.startTime) },
])

const overviewCards = computed(() => [
  {
    label: '活动请求',
    value: formatNumber(overview.value?.activeRequestCount),
    subtitle: `峰值并发 ${formatNumber(overview.value?.peakRequestCount)}`,
    icon: 'i-lucide-activity',
    tone: 'blue' as const,
  },
  {
    label: '平均耗时',
    value: `${formatNumber(overview.value?.averageDurationMs, 2)} ms`,
    subtitle: `累计请求 ${formatNumber(overview.value?.totalRequestCount)}`,
    icon: 'i-lucide-timer-reset',
    tone: 'amber' as const,
  },
  {
    label: '应用状态',
    value: overview.value?.applicationActive ? '运行中' : '未运行',
    subtitle: `健康状态 ${formatStatusText(overview.value?.healthStatus)}`,
    icon: 'i-lucide-shield-check',
    tone: 'green' as const,
  },
  {
    label: '最近错误',
    value: formatNumber(overview.value?.recentErrorCount),
    subtitle: `累计错误 ${formatNumber(overview.value?.totalErrorCount)}`,
    icon: 'i-lucide-triangle-alert',
    tone: 'red' as const,
  },
])

const cockpitBars = computed(() => {
  const current = overview.value
  const maxRequestBase = Math.max(
    current?.peakRequestCount ?? 0,
    current?.activeRequestCount ?? 0,
    1,
  )
  const errorBase = Math.max(current?.totalErrorCount ?? 0, current?.recentErrorCount ?? 0, 1)
  return [
    {
      label: '活动请求占峰值',
      value: formatNumber(current?.activeRequestCount),
      percent: ((current?.activeRequestCount ?? 0) / maxRequestBase) * 100,
    },
    {
      label: '最近错误占累计',
      value: formatNumber(current?.recentErrorCount),
      percent: ((current?.recentErrorCount ?? 0) / errorBase) * 100,
    },
  ]
})

const cockpitOption = computed<EChartsOption>(() => ({
  color: ['#2080f0'],
  tooltip: {
    trigger: 'axis',
    backgroundColor: chartTheme.value.tooltipBackgroundColor,
    borderColor: chartTheme.value.tooltipBorderColor,
    textStyle: { color: chartTheme.value.tooltipTextColor },
  },
  grid: { top: 16, left: 14, right: 12, bottom: 10, containLabel: true },
  xAxis: {
    type: 'category',
    data: cockpitBars.value.map((item) => item.label),
    axisLabel: { color: chartTheme.value.axisLabelColor },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: { color: chartTheme.value.axisLabelColor, formatter: '{value}%' },
    splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
  },
  series: [
    {
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      label: {
        show: true,
        position: 'top',
        color: chartTheme.value.valueLabelColor,
        formatter: ({ dataIndex }) => cockpitBars.value[dataIndex]?.value ?? '--',
      },
      data: cockpitBars.value.map((item) => item.percent),
    },
  ],
}))

const requestChartOption = computed<EChartsOption>(() => ({
  color: ['#2080f0', '#f0a020'],
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
  yAxis: [
    {
      type: 'value',
      name: '并发',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    {
      type: 'value',
      name: '耗时(ms)',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '请求并发量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      areaStyle: { color: 'rgba(32, 128, 240, 0.12)' },
      data: requestTrend.value,
    },
    {
      name: '平均耗时',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      areaStyle: { color: 'rgba(240, 160, 32, 0.12)' },
      data: requestDurationTrend.value,
    },
  ],
}))

const healthChartOption = computed<EChartsOption>(() => ({
  color: ['#d03050'],
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
    data: timelineLabels.value,
    axisLabel: { color: chartTheme.value.axisLabelColor },
  },
  yAxis: {
    type: 'value',
    name: '错误',
    axisLabel: { color: chartTheme.value.axisLabelColor },
    splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
  },
  series: [
    {
      name: '最近错误',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      areaStyle: { color: 'rgba(208, 48, 80, 0.12)' },
      data: errorTrend.value,
    },
  ],
}))

const statusSummary = computed(() => [
  {
    label: 'Spring 上下文',
    value: formatBoolean(status.value?.applicationActive),
    raw: status.value?.applicationActive,
  },
  {
    label: 'Liveness',
    value: formatStatusText(status.value?.livenessState),
    raw: status.value?.livenessState,
  },
  {
    label: 'Readiness',
    value: formatStatusText(status.value?.readinessState),
    raw: status.value?.readinessState,
  },
  {
    label: '健康状态',
    value: formatStatusText(status.value?.healthStatus),
    raw: status.value?.healthStatus,
  },
  { label: '运行时长', value: formatDurationMs(status.value?.uptime) },
  { label: '状态时间', value: formatDateTime(status.value?.timestamp) },
])
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

      <div class="stat-grid">
        <MonitorMetricCard
          v-for="card in overviewCards"
          :key="card.label"
          :title="card.label"
          :value="card.value"
          :subtitle="card.subtitle"
          :icon="card.icon"
          :tone="card.tone"
        />
      </div>

      <div class="chart-stack">
        <n-card title="请求并发与耗时走势" :bordered="false" class="monitor-card">
          <MonitorChart :option="requestChartOption" :height="320" />
        </n-card>

        <n-card title="错误走势" :bordered="false" class="monitor-card">
          <MonitorChart :option="healthChartOption" :height="320" />
        </n-card>
      </div>

      <div class="two-column-grid two-column-grid--balanced">
        <n-card title="Spring Boot 状态" :bordered="false" class="monitor-card">
          <div class="status-grid">
            <div v-for="item in statusSummary" :key="item.label" class="status-grid__item">
              <div class="status-grid__label">{{ item.label }}</div>
              <div class="status-grid__value">
                <span v-if="item.raw === undefined || item.raw === null">{{ item.value }}</span>
                <n-tag
                  v-else-if="typeof item.raw === 'boolean' || typeof item.raw === 'string'"
                  size="small"
                  :bordered="false"
                  :type="statusTagType(item.raw)"
                >
                  {{ item.value }}
                </n-tag>
                <span v-else>{{ item.value }}</span>
              </div>
            </div>
          </div>
        </n-card>

        <n-card title="应用基础信息" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid :items="basicInfoItems" :columns="2" />
        </n-card>
      </div>

      <n-card title="运行驾驶舱" :bordered="false" class="monitor-card">
        <MonitorChart :option="cockpitOption" :height="260" />
      </n-card>

      <n-card title="健康组件明细" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="[
            {
              title: '组件',
              key: 'name',
              ellipsis: { tooltip: true },
              render: (row) => formatText(row.name),
            },
            {
              title: '状态',
              key: 'status',
              width: 120,
              render: (row) => renderStatusTag(row.status),
            },
          ]"
          :data="safeArray(status?.healthComponents)"
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
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
  box-shadow: none;
}

.stat-grid,
.two-column-grid,
.chart-stack {
  display: grid;
  gap: 16px;
}

.stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.two-column-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.two-column-grid--balanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-stack {
  grid-template-columns: 1fr;
}

.status-grid__label {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.status-grid__item {
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--global-bg-container) 88%, var(--global-fill-color));
}

.status-grid__value {
  margin-top: 10px;
  color: var(--global-text-color);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .two-column-grid,
  .two-column-grid--balanced,
  .chart-stack {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stat-grid,
  .two-column-grid,
  .two-column-grid--balanced,
  .chart-stack,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
