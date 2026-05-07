<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MonitorChart from '../../shared/components/MonitorChart.vue'
import MonitorKeyValueGrid from '../../shared/components/MonitorKeyValueGrid.vue'
import MonitorMetricCard from '../../shared/components/MonitorMetricCard.vue'
import { monitorJvmApi } from '../../shared/api'
import { useMonitorChartTheme } from '../../shared/composable/useMonitorChartTheme'
import { useTimeSeries } from '../../shared/composable/useTimeSeries'
import type {
  JvmBasicInfoData,
  JvmClassLoadingData,
  JvmCompilationData,
  JvmMemoryData,
  JvmRuntimeData,
  JvmThreadData,
} from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatBytes,
  formatDateTime,
  formatDurationMs,
  formatList,
  formatMilliseconds,
  formatNumber,
  formatPercent,
  formatText,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const basicInfo = ref<JvmBasicInfoData | null>(null)
const runtime = ref<JvmRuntimeData | null>(null)
const memory = ref<JvmMemoryData | null>(null)
const thread = ref<JvmThreadData | null>(null)
const classLoading = ref<JvmClassLoadingData | null>(null)
const compilation = ref<JvmCompilationData | null>(null)

const chartTheme = useMonitorChartTheme()
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []
const { labels: timelineLabels, createSeries, push } = useTimeSeries()

const threadTrend = createSeries()
const classTrend = createSeries()
const compileTrend = createSeries()

const latestUpdatedAt = computed(() =>
  buildTimestampText([
    runtime.value?.timestamp,
    memory.value?.timestamp,
    thread.value?.timestamp,
    classLoading.value?.timestamp,
    compilation.value?.timestamp,
  ]),
)

const syncSeries = () => {
  push(
    memory.value?.timestamp ??
      thread.value?.timestamp ??
      classLoading.value?.timestamp ??
      compilation.value?.timestamp ??
      runtime.value?.timestamp,
    [
      { series: threadTrend, value: thread.value?.threadCount },
      { series: classTrend, value: classLoading.value?.loadedClassCount },
      { series: compileTrend, value: compilation.value?.totalCompilationTime },
    ],
  )
}

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([
      monitorJvmApi.basicInfo(),
      monitorJvmApi.runtime(),
      monitorJvmApi.memory(),
      monitorJvmApi.thread(),
      monitorJvmApi.classLoading(),
      monitorJvmApi.compilation(),
    ])

    if (results[0].status === 'fulfilled') basicInfo.value = results[0].value
    if (results[1].status === 'fulfilled') runtime.value = results[1].value
    if (results[2].status === 'fulfilled') memory.value = results[2].value
    if (results[3].status === 'fulfilled') thread.value = results[3].value
    if (results[4].status === 'fulfilled') classLoading.value = results[4].value
    if (results[5].status === 'fulfilled') compilation.value = results[5].value
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
  unsubscribers.push(
    subscribe<JvmThreadData>('monitor-jvm-thread', (payload) => {
      thread.value = payload
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

const metricCards = computed(() => [
  {
    title: '运行时长',
    value: formatDurationMs(runtime.value?.uptime),
    subtitle: `PID ${formatNumber(runtime.value?.pid)}`,
    icon: 'i-lucide-cpu',
    tone: 'green' as const,
  },
  {
    title: '线程总数',
    value: formatNumber(thread.value?.threadCount),
    subtitle: `守护线程 ${formatNumber(thread.value?.daemonThreadCount)}`,
    icon: 'i-lucide-git-branch',
    tone: 'blue' as const,
  },
  {
    title: '已加载类',
    value: formatNumber(classLoading.value?.loadedClassCount),
    subtitle: `累计 ${formatNumber(classLoading.value?.totalLoadedClassCount)}`,
    icon: 'i-lucide-boxes',
    tone: 'amber' as const,
  },
  {
    title: 'JIT 总耗时',
    value: formatMilliseconds(compilation.value?.totalCompilationTime),
    subtitle: formatText(compilation.value?.compilerName),
    icon: 'i-lucide-zap',
    tone: 'red' as const,
  },
])

const heapUsagePercent = computed(() =>
  Math.min(100, Math.max(0, memory.value?.heap?.usedRate ?? 0)),
)

const heapSnapshotItems = computed(() => [
  { label: '最大堆内存', value: formatText(memory.value?.heap?.maxText) },
  { label: '已分配堆内存', value: formatText(memory.value?.heap?.committedText) },
  { label: '已使用堆内存', value: formatText(memory.value?.heap?.usedText) },
  { label: '堆内存使用率', value: formatPercent(memory.value?.heap?.usedRate) },
])

const threadSnapshotItems = computed(() => [
  { label: '当前线程总数', value: formatNumber(thread.value?.threadCount) },
  { label: '守护线程', value: formatNumber(thread.value?.daemonThreadCount) },
  { label: '峰值线程', value: formatNumber(thread.value?.peakThreadCount) },
  { label: '死锁线程', value: formatNumber(thread.value?.deadlockedThreadCount) },
])

const runtimeChartOption = computed<EChartsOption>(() => ({
  color: ['#2080f0', '#18a058', '#f0a020'],
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
      name: '线程/类',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { lineStyle: { color: chartTheme.value.splitLineColor } },
    },
    {
      type: 'value',
      name: '编译耗时',
      axisLabel: { color: chartTheme.value.axisLabelColor },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '线程总数',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(32, 128, 240, 0.12)' },
      data: threadTrend.value,
    },
    {
      name: '已加载类',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(24, 160, 88, 0.12)' },
      data: classTrend.value,
    },
    {
      name: 'JIT 总耗时',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      areaStyle: { color: 'rgba(240, 160, 32, 0.12)' },
      data: compileTrend.value,
    },
  ],
}))

const threadStateOption = computed<EChartsOption>(() => {
  const entries = Object.entries(thread.value?.threadStateCounts ?? {})
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
      data: entries.map(([key]) => key),
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
        barMaxWidth: 28,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: 'top', color: chartTheme.value.valueLabelColor },
        data: entries.map(([, value]) => value),
      },
    ],
  }
})
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
          v-for="card in metricCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :subtitle="card.subtitle"
          :icon="card.icon"
          :tone="card.tone"
        />
      </div>

      <div class="hero-grid">
        <n-card title="堆内存驾驶舱" :bordered="false" class="monitor-card">
          <div class="hero-memory">
            <div class="hero-memory__head">
              <div>
                <div class="hero-memory__eyebrow">当前堆内存使用</div>
                <div class="hero-memory__value">{{ formatBytes(memory?.heap?.used) }}</div>
              </div>
              <div class="hero-memory__rate">{{ formatPercent(memory?.heap?.usedRate) }}</div>
            </div>

            <n-progress
              type="dashboard"
              gap-position="bottom"
              :percentage="heapUsagePercent"
              :stroke-width="16"
            >
              <div class="hero-memory__progress-text">
                <div class="hero-memory__progress-label">Heap Used</div>
                <div class="hero-memory__progress-value">
                  {{ formatPercent(memory?.heap?.usedRate) }}
                </div>
              </div>
            </n-progress>

            <div class="hero-memory__stats">
              <div v-for="item in heapSnapshotItems" :key="item.label" class="hero-stat">
                <div class="hero-stat__label">{{ item.label }}</div>
                <div class="hero-stat__value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </n-card>

        <n-card title="线程驾驶舱" :bordered="false" class="monitor-card">
          <div class="hero-thread">
            <div class="hero-thread__main">
              <div>
                <div class="hero-thread__label">当前线程总数</div>
                <div class="hero-thread__value">{{ formatNumber(thread?.threadCount) }}</div>
              </div>
              <div class="hero-thread__sub">
                累计启动 {{ formatNumber(thread?.startedThreadCount) }}
              </div>
            </div>

            <div class="hero-thread__stats">
              <div v-for="item in threadSnapshotItems" :key="item.label" class="hero-stat">
                <div class="hero-stat__label">{{ item.label }}</div>
                <div class="hero-stat__value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <n-card title="线程状态分布" :bordered="false" class="monitor-card">
        <MonitorChart :option="threadStateOption" :height="280" />
      </n-card>

      <n-card title="JVM 运行曲线" :bordered="false" class="monitor-card">
        <MonitorChart :option="runtimeChartOption" :height="320" />
      </n-card>

      <div class="two-column-grid">
        <n-card title="线程与监控能力" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: '线程总数', value: formatNumber(thread?.threadCount) },
              { label: '守护线程', value: formatNumber(thread?.daemonThreadCount) },
              { label: '峰值线程', value: formatNumber(thread?.peakThreadCount) },
              { label: '累计启动线程', value: formatNumber(thread?.startedThreadCount) },
              { label: '死锁线程数', value: formatNumber(thread?.deadlockedThreadCount) },
              { label: '死锁线程 ID', value: formatList(thread?.deadlockedThreadIds ?? null) },
              {
                label: '支持 CPU Time',
                value: formatBoolean(thread?.currentThreadCpuTimeSupported),
              },
              {
                label: '支持争用监控',
                value: formatBoolean(thread?.threadContentionMonitoringSupported),
              },
              { label: 'CPU Time 已启用', value: formatBoolean(thread?.threadCpuTimeEnabled) },
              {
                label: '争用监控已启用',
                value: formatBoolean(thread?.threadContentionMonitoringEnabled),
              },
            ]"
          />
        </n-card>

        <n-card title="类加载与编译" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: '当前已加载类', value: formatNumber(classLoading?.loadedClassCount) },
              { label: '累计加载类', value: formatNumber(classLoading?.totalLoadedClassCount) },
              { label: '已卸载类', value: formatNumber(classLoading?.unloadedClassCount) },
              { label: 'Verbose', value: formatBoolean(classLoading?.verbose) },
              { label: '编译器', value: formatText(compilation?.compilerName) },
              {
                label: '支持编译耗时监控',
                value: formatBoolean(compilation?.compilationTimeMonitoringSupported),
              },
              { label: '总编译耗时', value: formatMilliseconds(compilation?.totalCompilationTime) },
            ]"
          />
        </n-card>
      </div>

      <div class="two-column-grid">
        <n-card title="运行时信息" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: '进程名', value: formatText(runtime?.name) },
              { label: 'PID', value: formatNumber(runtime?.pid) },
              { label: '系统负载', value: formatNumber(runtime?.systemLoadAverage, 2) },
              { label: '可用处理器', value: formatNumber(runtime?.availableProcessors) },
              { label: '时区', value: formatText(runtime?.timezone) },
              { label: '默认字符集', value: formatText(runtime?.charset) },
              { label: '工作目录', value: formatText(runtime?.userDir), mono: true },
              { label: '本地库路径', value: formatText(runtime?.libraryPath), mono: true },
              { label: 'Class Path', value: formatText(runtime?.classPath), mono: true },
              { label: 'Boot Class Path', value: formatText(runtime?.bootClassPath), mono: true },
            ]"
          />
        </n-card>

        <n-card title="JVM 基础信息" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid
            :columns="2"
            :items="[
              { label: 'VM 名称', value: formatText(basicInfo?.vmName) },
              { label: 'VM 厂商', value: formatText(basicInfo?.vmVendor) },
              { label: 'VM 版本', value: formatText(basicInfo?.vmVersion) },
              { label: 'Java 版本', value: formatText(basicInfo?.javaVersion) },
              { label: 'Java 厂商', value: formatText(basicInfo?.javaVendor) },
              { label: 'Java Home', value: formatText(basicInfo?.javaHome), mono: true },
              { label: '规范名称', value: formatText(basicInfo?.specName) },
              { label: '规范版本', value: formatText(basicInfo?.specVersion) },
              { label: '管理规范版本', value: formatText(basicInfo?.managementSpecVersion) },
              { label: '启动参数', value: formatList(basicInfo?.inputArguments ?? null) },
              { label: '系统属性数', value: formatNumber(basicInfo?.systemPropertiesCount) },
              { label: '启动时间', value: formatDateTime(basicInfo?.startTime) },
            ]"
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

.hero-grid,
.stat-grid,
.two-column-grid {
  display: grid;
  gap: 16px;
}

.hero-grid,
.two-column-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.monitor-card {
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
}

.hero-memory,
.hero-thread {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-memory__head,
.hero-thread__main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.hero-memory__eyebrow,
.hero-thread__label,
.hero-stat__label,
.hero-memory__progress-label {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.hero-memory__value,
.hero-thread__value {
  margin-top: 8px;
  color: var(--global-text-color);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.hero-memory__rate {
  color: #2080f0;
  font-size: 24px;
  font-weight: 700;
}

.hero-memory__progress-text {
  text-align: center;
}

.hero-memory__progress-value {
  margin-top: 4px;
  color: var(--global-text-color);
  font-size: 18px;
  font-weight: 700;
}

.hero-memory__stats,
.hero-thread__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat {
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--global-bg-container) 88%, var(--global-fill-color));
}

.hero-stat__value,
.hero-thread__sub {
  margin-top: 8px;
  color: var(--global-text-color);
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-grid,
  .stat-grid,
  .two-column-grid,
  .hero-memory__stats,
  .hero-thread__stats {
    grid-template-columns: 1fr;
  }
}
</style>
