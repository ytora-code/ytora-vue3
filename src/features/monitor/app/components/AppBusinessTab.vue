<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { monitorAppApi } from '../../shared/api'
import type { AppBusinessMetricItem, AppBusinessMetricsData } from '../../shared/type/monitor'
import {
  buildTimestampText,
  formatDateTime,
  formatMilliseconds,
  formatNumber,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'

const loading = ref(false)
const businessMetrics = ref<AppBusinessMetricsData | null>(null)

const latestUpdatedAt = computed(() => buildTimestampText([businessMetrics.value?.timestamp]))

const loadData = async () => {
  loading.value = true
  try {
    businessMetrics.value = await monitorAppApi.businessMetrics()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

const metricColumns: DataTableColumns<AppBusinessMetricItem> = [
  {
    title: '指标名',
    key: 'name',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.name),
  },
  {
    title: '描述',
    key: 'description',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.description),
  },
  {
    title: '类型',
    key: 'type',
    width: 120,
    render: (row) => formatText(row.type),
  },
  {
    title: '计数器',
    key: 'counterValue',
    width: 120,
    render: (row) => formatNumber(row.counterValue),
  },
  {
    title: 'Gauge',
    key: 'gaugeValue',
    width: 120,
    render: (row) => formatNumber(row.gaugeValue, 2),
  },
  {
    title: '总次数',
    key: 'totalCount',
    width: 120,
    render: (row) => formatNumber(row.totalCount),
  },
  {
    title: '成功次数',
    key: 'successCount',
    width: 120,
    render: (row) => formatNumber(row.successCount),
  },
  {
    title: '失败次数',
    key: 'failureCount',
    width: 120,
    render: (row) => formatNumber(row.failureCount),
  },
  {
    title: '平均耗时',
    key: 'averageDurationMs',
    width: 130,
    render: (row) => formatMilliseconds(row.averageDurationMs),
  },
  {
    title: '最大耗时',
    key: 'maxDurationMs',
    width: 130,
    render: (row) => formatMilliseconds(row.maxDurationMs),
  },
  {
    title: '最近更新',
    key: 'lastUpdatedTime',
    width: 180,
    render: (row) => formatDateTime(row.lastUpdatedTime),
  },
]
</script>

<template>
  <n-spin :show="loading">
    <div class="monitor-tab">
      <div class="tab-meta">
        <n-tag :bordered="false" type="info">最近刷新 {{ latestUpdatedAt }}</n-tag>
      </div>

      <n-card title="高频指标 Top 10" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="metricColumns"
          :data="safeArray(businessMetrics?.highFrequencyTop10)"
          :pagination="false"
          size="small"
          :single-line="false"
          scroll-x="1600"
        />
      </n-card>

      <n-card title="全部业务指标" :bordered="false" class="monitor-card">
        <template #header-extra> {{ formatNumber(businessMetrics?.metricCount) }} 项 </template>

        <n-data-table
          :columns="metricColumns"
          :data="safeArray(businessMetrics?.metrics)"
          :pagination="{ pageSize: 10 }"
          size="small"
          :single-line="false"
          scroll-x="1600"
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
