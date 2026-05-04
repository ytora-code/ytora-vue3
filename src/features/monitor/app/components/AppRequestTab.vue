<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { monitorAppApi } from '../../shared/api'
import type {
  AppErrorMetricsData,
  AppRequestMetricsData,
  AppSlowRequestItem,
} from '../../shared/type/monitor'
import {
  EMPTY_TEXT,
  buildTimestampText,
  formatDateTime,
  formatMilliseconds,
  formatNumber,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'
import { useSSE } from '../../sse/composable/useSSE'

const loading = ref(false)
const requests = ref<AppRequestMetricsData | null>(null)
const errors = ref<AppErrorMetricsData | null>(null)
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []

const latestUpdatedAt = computed(() =>
  buildTimestampText([requests.value?.timestamp, errors.value?.timestamp]),
)

const loadData = async () => {
  loading.value = true
  try {
    const results = await Promise.allSettled([monitorAppApi.requests(), monitorAppApi.errors()])
    if (results[0].status === 'fulfilled') requests.value = results[0].value
    if (results[1].status === 'fulfilled') errors.value = results[1].value
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<AppRequestMetricsData>('monitor-app-requests', (payload) => {
      requests.value = payload
    }),
  )
  unsubscribers.push(
    subscribe<AppErrorMetricsData>('monitor-app-errors', (payload) => {
      errors.value = payload
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

const requestCards = computed(() => [
  { label: '活动请求', value: formatNumber(requests.value?.activeRequestCount) },
  { label: '峰值并发', value: formatNumber(requests.value?.peakRequestCount) },
  { label: '累计请求', value: formatNumber(requests.value?.totalRequestCount) },
  { label: '平均耗时', value: formatMilliseconds(requests.value?.averageDurationMs) },
])

const slowRequestColumns: DataTableColumns<AppSlowRequestItem> = [
  {
    title: '开始时间',
    key: 'startTime',
    width: 180,
    render: (row) => formatDateTime(row.startTime),
  },
  {
    title: 'Method',
    key: 'method',
    width: 100,
    render: (row) => formatText(row.method),
  },
  {
    title: '路径',
    key: 'path',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.path),
  },
  {
    title: '查询串',
    key: 'query',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.query),
  },
  {
    title: '状态码',
    key: 'status',
    width: 100,
    render: (row) => formatText(row.status),
  },
  {
    title: '耗时',
    key: 'durationMs',
    width: 120,
    render: (row) => formatMilliseconds(row.durationMs),
  },
  {
    title: '来源',
    key: 'clientIp',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.clientIp),
  },
  {
    title: '用户',
    key: 'userName',
    width: 140,
    render: (row) => formatText(row.userName ?? row.userId),
  },
  {
    title: '异常',
    key: 'error',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.error),
  },
]

const errorItems = computed(() => safeArray(errors.value?.recentErrors))
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
        <n-card
          v-for="card in requestCards"
          :key="card.label"
          size="small"
          :bordered="false"
          class="stat-card"
        >
          <div class="stat-card__label">{{ card.label }}</div>
          <div class="stat-card__value">{{ card.value }}</div>
        </n-card>
      </div>

      <n-card title="慢请求 Top 列表" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="slowRequestColumns"
          :data="safeArray(requests?.topSlowRequests)"
          :pagination="false"
          size="small"
          :single-line="false"
          scroll-x="1400"
        />
      </n-card>

      <n-card title="最近错误" :bordered="false" class="monitor-card">
        <div class="error-header">
          <div class="error-header__count">
            累计错误数：
            <strong>{{ formatNumber(errors?.totalErrorCount) }}</strong>
          </div>
          <div class="error-header__time">
            最近更新时间：{{ formatDateTime(errors?.timestamp) }}
          </div>
        </div>

        <n-empty v-if="errorItems.length === 0" description="暂无最近错误" />

        <n-collapse v-else arrow-placement="right" class="error-collapse">
          <n-collapse-item
            v-for="item in errorItems"
            :key="`${item.timestamp ?? 0}-${item.path ?? EMPTY_TEXT}`"
          >
            <template #header>
              <div class="error-title">
                <span>{{ formatText(item.message) }}</span>
                <span class="error-title__meta">{{ formatDateTime(item.timestamp) }}</span>
              </div>
            </template>

            <div class="error-detail-grid">
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">分类</div>
                <div class="error-detail-grid__value">{{ formatText(item.category) }}</div>
              </div>
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">异常类型</div>
                <div class="error-detail-grid__value">{{ formatText(item.exceptionClass) }}</div>
              </div>
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">请求路径</div>
                <div class="error-detail-grid__value">{{ formatText(item.path) }}</div>
              </div>
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">请求方法</div>
                <div class="error-detail-grid__value">{{ formatText(item.method) }}</div>
              </div>
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">客户端</div>
                <div class="error-detail-grid__value">{{ formatText(item.clientIp) }}</div>
              </div>
              <div class="error-detail-grid__item">
                <div class="error-detail-grid__label">用户</div>
                <div class="error-detail-grid__value">
                  {{ formatText(item.userName ?? item.userId) }}
                </div>
              </div>
            </div>

            <div class="stacktrace-panel">
              <div class="stacktrace-panel__title">堆栈信息</div>
              <pre class="stacktrace-panel__content">{{ formatText(item.stackTrace) }}</pre>
            </div>
          </n-collapse-item>
        </n-collapse>
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

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 3px;
  background: var(--global-bg-container);
}

.stat-card__label,
.error-detail-grid__label,
.stacktrace-panel__title {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.stat-card__value {
  margin-top: 10px;
  color: var(--global-text-color);
  font-size: 24px;
  font-weight: 700;
}

.error-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: var(--global-text-color-secondary);
  font-size: 13px;
}

.error-collapse {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.error-title__meta {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.error-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.error-detail-grid__item {
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 86%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--global-bg-container) 88%, var(--global-fill-color));
}

.error-detail-grid__value {
  margin-top: 8px;
  color: var(--global-text-color);
  word-break: break-word;
}

.stacktrace-panel {
  margin-top: 16px;
}

.stacktrace-panel__content {
  margin: 10px 0 0;
  padding: 14px 16px;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 78%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, #09111d 48%, var(--global-bg-elevated));
  color: color-mix(in srgb, #dbeafe 20%, var(--global-text-color));
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stat-grid,
  .error-detail-grid {
    grid-template-columns: 1fr;
  }

  .error-header,
  .error-title {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
