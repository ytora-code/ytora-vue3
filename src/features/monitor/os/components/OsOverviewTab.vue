<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MonitorChart from '../../shared/components/MonitorChart.vue'
import MonitorKeyValueGrid from '../../shared/components/MonitorKeyValueGrid.vue'
import { monitorOsApi } from '../../shared/api'
import { useMonitorChartTheme } from '../../shared/composable/useMonitorChartTheme'
import { useTimeSeries } from '../../shared/composable/useTimeSeries'
import type {
  OsBasicInfoData,
  OsCpuDynamicData,
  OsCpuStaticData,
  OsMemDynamicData,
  OsMemStaticData,
  OsOtherMetricsData,
} from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatBytes,
  formatDateTime,
  formatDurationSeconds,
  formatList,
  formatNumber,
  formatPercent,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const basicInfo = ref<OsBasicInfoData | null>(null)
const cpuStatic = ref<OsCpuStaticData | null>(null)
const cpuDynamic = ref<OsCpuDynamicData | null>(null)
const memoryStatic = ref<OsMemStaticData | null>(null)
const memoryDynamic = ref<OsMemDynamicData | null>(null)
const otherMetrics = ref<OsOtherMetricsData | null>(null)

const chartTheme = useMonitorChartTheme()
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []
const { labels: timelineLabels, createSeries, push } = useTimeSeries()

const cpuTrend = createSeries()
const memoryTrend = createSeries()
const memoryUsedTrend = createSeries()
const processTrend = createSeries()
const tcpTrend = createSeries()

const latestUpdatedAt = computed(() =>
  buildTimestampText([cpuDynamic.value?.timestamp, memoryDynamic.value?.timestamp]),
)

const syncSeries = () => {
  push(cpuDynamic.value?.timestamp ?? memoryDynamic.value?.timestamp ?? Date.now(), [
    { series: cpuTrend, value: cpuDynamic.value?.totalUsage },
    { series: memoryTrend, value: memoryDynamic.value?.usageRate },
    { series: memoryUsedTrend, value: memoryDynamic.value?.used },
    { series: processTrend, value: otherMetrics.value?.processCount },
    { series: tcpTrend, value: otherMetrics.value?.tcpEstablished },
  ])
}

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      monitorOsApi.basicInfo(),
      monitorOsApi.cpuStatic(),
      monitorOsApi.cpuDynamic(),
      monitorOsApi.memoryStatic(),
      monitorOsApi.memoryDynamic(),
      monitorOsApi.otherMetrics(),
    ])

    if (results[0].status === 'fulfilled') basicInfo.value = results[0].value
    if (results[1].status === 'fulfilled') cpuStatic.value = results[1].value
    if (results[2].status === 'fulfilled') cpuDynamic.value = results[2].value
    if (results[3].status === 'fulfilled') memoryStatic.value = results[3].value
    if (results[4].status === 'fulfilled') memoryDynamic.value = results[4].value
    if (results[5].status === 'fulfilled') otherMetrics.value = results[5].value
    syncSeries()
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<OsCpuDynamicData>('monitor-os-cpu', (payload) => {
      cpuDynamic.value = payload
      syncSeries()
    }),
  )
  unsubscribers.push(
    subscribe<OsMemDynamicData>('monitor-os-memory', (payload) => {
      memoryDynamic.value = payload
      syncSeries()
    }),
  )
  unsubscribers.push(
    subscribe<OsOtherMetricsData>('monitor-os-other-metrics', (payload) => {
      otherMetrics.value = payload
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

const summaryCards = computed(() => [
  {
    title: 'CPU 总使用率',
    value: formatPercent(cpuDynamic.value?.totalUsage),
    subtitle: `系统态 ${formatPercent(cpuDynamic.value?.sysUsage)} / 用户态 ${formatPercent(cpuDynamic.value?.userUsage)}`,
  },
  {
    title: '内存使用率',
    value: formatPercent(memoryDynamic.value?.usageRate),
    subtitle: `总内存 ${formatText(memoryStatic.value?.totalGb)} / 已用 ${formatBytes(memoryDynamic.value?.used)}`,
  },
  {
    title: '进程数',
    value: formatNumber(otherMetrics.value?.processCount),
    subtitle: `线程 ${formatNumber(otherMetrics.value?.threadCount)}`,
  },
  {
    title: 'TCP Established',
    value: formatNumber(otherMetrics.value?.tcpEstablished),
    subtitle: `Active Opens ${formatNumber(otherMetrics.value?.tcpActiveOpens)} / Passive ${formatNumber(otherMetrics.value?.tcpPassiveOpens)}`,
  },
])

const formatAxisBytes = (value: number): string => formatBytes(value)

const buildDualAxisTooltip = (
  params: Array<{ seriesName?: string; color?: unknown; value?: unknown }>,
  names: { percent: string; bytes: string },
) => {
  const percentItem = params.find((item) => item.seriesName === names.percent)
  const bytesItem = params.find((item) => item.seriesName === names.bytes)
  const percentValue = typeof percentItem?.value === 'number' ? percentItem.value : null
  const bytesValue = typeof bytesItem?.value === 'number' ? bytesItem.value : null

  return [
    percentItem
      ? `<div><span style="display:inline-block;margin-right:8px;border-radius:999px;width:8px;height:8px;background:${typeof percentItem.color === 'string' ? percentItem.color : '#2080f0'}"></span>${names.percent}：${formatPercent(percentValue)}</div>`
      : '',
    bytesItem
      ? `<div><span style="display:inline-block;margin-right:8px;border-radius:999px;width:8px;height:8px;background:${typeof bytesItem.color === 'string' ? bytesItem.color : '#18a058'}"></span>${names.bytes}：${formatBytes(bytesValue)}</div>`
      : '',
  ]
    .filter(Boolean)
    .join('')
}

const cpuPrimaryOption = computed<EChartsOption>(() => ({
  color: ['#18a058', '#2080f0'],
  tooltip: {
    trigger: 'axis',
    backgroundColor: chartTheme.value.tooltipBackgroundColor,
    borderColor: chartTheme.value.tooltipBorderColor,
    textStyle: { color: chartTheme.value.tooltipTextColor },
    formatter: (params) =>
      buildDualAxisTooltip(Array.isArray(params) ? params : [params], {
        percent: 'CPU 使用率',
        bytes: '已使用内存',
      }),
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
      name: '使用率(%)',
      min: 0,
      max: 100,
      axisLabel: { color: chartTheme.value.axisLabelColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    {
      type: 'value',
      name: '内存',
      axisLabel: {
        color: chartTheme.value.axisLabelColor,
        formatter: (value: number) => formatAxisBytes(value),
      },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: 'CPU 使用率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      areaStyle: { color: 'rgba(24, 160, 88, 0.12)' },
      data: cpuTrend.value,
    },
    {
      name: '已使用内存',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      areaStyle: { color: 'rgba(32, 128, 240, 0.08)' },
      data: memoryUsedTrend.value,
    },
  ],
}))

const memoryPrimaryOption = computed<EChartsOption>(() => ({
  color: ['#2080f0', '#18a058'],
  tooltip: {
    trigger: 'axis',
    backgroundColor: chartTheme.value.tooltipBackgroundColor,
    borderColor: chartTheme.value.tooltipBorderColor,
    textStyle: { color: chartTheme.value.tooltipTextColor },
    formatter: (params) =>
      buildDualAxisTooltip(Array.isArray(params) ? params : [params], {
        percent: '物理内存使用率',
        bytes: '已使用内存',
      }),
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
      name: '使用率(%)',
      min: 0,
      max: 100,
      axisLabel: { color: chartTheme.value.axisLabelColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    {
      type: 'value',
      name: '内存',
      axisLabel: {
        color: chartTheme.value.axisLabelColor,
        formatter: (value: number) => formatAxisBytes(value),
      },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '物理内存使用率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      areaStyle: { color: 'rgba(32, 128, 240, 0.12)' },
      data: memoryTrend.value,
    },
    {
      name: '已使用内存',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      areaStyle: { color: 'rgba(24, 160, 88, 0.08)' },
      data: memoryUsedTrend.value,
    },
  ],
}))

const loadAverageOption = computed<EChartsOption>(() => {
  const loadAverage = cpuDynamic.value?.loadAverage ?? []
  const items = [
    { label: '1 分钟负载', value: loadAverage[0] ?? 0 },
    { label: '5 分钟负载', value: loadAverage[1] ?? 0 },
    { label: '15 分钟负载', value: loadAverage[2] ?? 0 },
  ]

  return {
    color: ['#18a058'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTheme.value.tooltipBackgroundColor,
      borderColor: chartTheme.value.tooltipBorderColor,
      textStyle: { color: chartTheme.value.tooltipTextColor },
    },
    grid: { top: 16, left: 14, right: 12, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: items.map((item) => item.label),
      axisLabel: { color: chartTheme.value.axisLabelColor },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 26,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: chartTheme.value.valueLabelColor,
          formatter: ({ dataIndex }) => formatNumber(items[dataIndex]?.value, 2),
        },
        data: items.map((item) => item.value),
      },
    ],
  }
})

const workloadTrendOption = computed<EChartsOption>(() => ({
  color: ['#f0a020', '#d03050'],
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
  yAxis: [
    {
      type: 'value',
      name: '进程',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    {
      type: 'value',
      name: 'TCP',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '进程数',
      type: 'bar',
      barMaxWidth: 20,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      data: processTrend.value,
    },
    {
      name: 'TCP Established',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      areaStyle: { color: 'rgba(208, 48, 80, 0.12)' },
      data: tcpTrend.value,
    },
  ],
}))
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

      <div class="summary-grid">
        <div v-for="card in summaryCards" :key="card.title" class="summary-card">
          <div class="summary-card__title">{{ card.title }}</div>
          <div class="summary-card__value">{{ card.value }}</div>
          <div class="summary-card__subtitle">{{ card.subtitle }}</div>
        </div>
      </div>

      <n-card title="CPU 使用率实时历史" :bordered="false" class="monitor-card">
        <MonitorChart :option="cpuPrimaryOption" :height="340" />
      </n-card>

      <n-card title="物理内存使用率实时历史" :bordered="false" class="monitor-card">
        <MonitorChart :option="memoryPrimaryOption" :height="340" />
      </n-card>

      <div class="two-column-grid">
        <n-card title="CPU 概况" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: 'CPU 型号', value: formatText(cpuStatic?.cpuName) },
              { label: '标识', value: formatText(cpuStatic?.identifier), mono: true },
              { label: '物理封装数', value: formatNumber(cpuStatic?.physicalPackageCount) },
              { label: '物理核心数', value: formatNumber(cpuStatic?.physicalProcessorCount) },
              { label: '逻辑核心数', value: formatNumber(cpuStatic?.logicalProcessorCount) },
              { label: '64 位支持', value: formatBoolean(cpuStatic?.cpu64bit) },
              { label: '系统态使用率', value: formatPercent(cpuDynamic?.sysUsage) },
              { label: '用户态使用率', value: formatPercent(cpuDynamic?.userUsage) },
              { label: 'I/O Wait', value: formatPercent(cpuDynamic?.waitUsage) },
              { label: '空闲率', value: formatPercent(cpuDynamic?.idleUsage) },
            ]"
          />
        </n-card>

        <n-card title="内存概况" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: '总内存', value: formatText(memoryStatic?.totalGb) },
              { label: '页大小', value: formatBytes(memoryStatic?.pageSize) },
              { label: '已用内存', value: formatBytes(memoryDynamic?.used) },
              { label: '可用内存', value: formatBytes(memoryDynamic?.available) },
              { label: '内存使用率', value: formatPercent(memoryDynamic?.usageRate) },
              { label: 'Swap 总量', value: formatBytes(memoryDynamic?.swapTotal) },
              { label: 'Swap 已用', value: formatBytes(memoryDynamic?.swapUsed) },
              { label: 'Swap 空闲', value: formatBytes(memoryDynamic?.swapFree) },
              { label: 'Swap 使用率', value: formatPercent(memoryDynamic?.swapUsageRate) },
            ]"
          />
        </n-card>
      </div>

      <div class="chart-stack">
        <n-card title="负载驾驶舱" :bordered="false" class="monitor-card">
          <MonitorChart :option="loadAverageOption" :height="260" />
        </n-card>

        <n-card title="工作负载走势" :bordered="false" class="monitor-card">
          <MonitorChart :option="workloadTrendOption" :height="320" />
        </n-card>
      </div>

      <n-card title="逻辑核心负载" :bordered="false" class="monitor-card">
        <div class="cpu-progress-grid">
          <div
            v-for="(usage, index) in safeArray(cpuDynamic?.perCpuUsage)"
            :key="`cpu-${index}`"
            class="cpu-progress-item"
          >
            <div class="cpu-progress-item__header">
              <span>CPU {{ index }}</span>
              <span>{{ formatPercent(usage) }}</span>
            </div>
            <n-progress type="line" :show-indicator="false" :percentage="usage ?? 0" />
          </div>
        </div>
      </n-card>

      <n-card title="其他系统指标" :bordered="false" class="monitor-card">
        <MonitorKeyValueGrid
          :columns="3"
          :items="[
            { label: '打开文件描述符', value: formatNumber(otherMetrics?.openFileDescriptors) },
            { label: '最大文件描述符', value: formatNumber(otherMetrics?.maxFileDescriptors) },
            { label: '线程数', value: formatNumber(otherMetrics?.threadCount) },
            { label: 'TCP Established', value: formatNumber(otherMetrics?.tcpEstablished) },
            { label: 'TCP Active Opens', value: formatNumber(otherMetrics?.tcpActiveOpens) },
            { label: 'TCP Passive Opens', value: formatNumber(otherMetrics?.tcpPassiveOpens) },
          ]"
        />

        <div v-if="safeArray(otherMetrics?.gpus).length > 0" class="gpu-grid">
          <div
            v-for="gpu in safeArray(otherMetrics?.gpus)"
            :key="gpu.name ?? '--'"
            class="gpu-card"
          >
            <div class="gpu-card__title">{{ formatText(gpu.name) }}</div>
            <div class="gpu-card__meta">显存总量：{{ formatBytes(gpu.memoryTotal) }}</div>
            <div class="gpu-card__meta">显存已用：{{ formatBytes(gpu.memoryUsed) }}</div>
            <div class="gpu-card__meta">温度：{{ formatText(gpu.temperature) }}</div>
          </div>
        </div>
      </n-card>

      <n-card title="宿主机基础信息" :bordered="false" class="monitor-card">
        <MonitorKeyValueGrid
          :columns="3"
          :items="[
            { label: '主机名', value: formatText(basicInfo?.hostName) },
            { label: '操作系统', value: formatText(basicInfo?.osDescription) },
            { label: '架构', value: formatText(basicInfo?.arch) },
            { label: 'IP 地址', value: formatList(basicInfo?.ipAddresses ?? null) },
            { label: 'MAC 地址', value: formatList(basicInfo?.macAddresses ?? null) },
            { label: '时区', value: formatText(basicInfo?.timeZone) },
            { label: '内核版本', value: formatText(basicInfo?.kernelVersion) },
            { label: '启动时间', value: formatDateTime(basicInfo?.bootTime) },
            { label: '系统运行时长', value: formatDurationSeconds(basicInfo?.uptime) },
          ]"
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

.summary-grid,
.two-column-grid,
.chart-stack,
.cpu-progress-grid,
.gpu-grid {
  display: grid;
  gap: 16px;
}

.two-column-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.chart-stack {
  grid-template-columns: 1fr;
}

.cpu-progress-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gpu-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

.monitor-card {
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
}

.summary-card {
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: linear-gradient(
    180deg,
    var(--global-bg-container) 0%,
    color-mix(in srgb, var(--global-fill-color) 42%, var(--global-bg-container)) 100%
  );
}

.summary-card__title,
.summary-card__subtitle,
.gpu-card__meta {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.summary-card__value {
  margin-top: 10px;
  color: var(--global-text-color);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
}

.summary-card__subtitle {
  margin-top: 8px;
  line-height: 1.6;
}

.gpu-card__title {
  margin-top: 10px;
  color: var(--global-text-color);
  font-size: 24px;
  font-weight: 700;
}

.cpu-progress-item,
.gpu-card {
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--global-bg-container) 88%, var(--global-fill-color));
}

.cpu-progress-item__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: var(--global-text-color);
}

@media (max-width: 1200px) {
  .summary-grid,
  .gpu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .two-column-grid,
  .chart-stack {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-grid,
  .two-column-grid,
  .chart-stack,
  .cpu-progress-grid,
  .gpu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
