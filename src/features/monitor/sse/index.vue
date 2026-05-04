<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { NButton } from 'naive-ui'
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SseClientDetail from './components/SseClientDetail.vue'
import sseApi from './api/SseApi'
import type AppSseMetricsData from './type/data/AppSseMetricsData'
import type ClientItem from './type/data/ClientItem'
import {
  EMPTY_TEXT,
  buildTimestampText,
  formatBytes,
  formatDateTime,
  formatNumber,
  formatText,
  safeArray,
} from '../shared/utils/monitor'
import { useSSE } from './composable/useSSE'

const loading = ref(false)
const sseMetrics = ref<AppSseMetricsData | null>(null)
const route = useRoute()
const router = useRouter()
const { isConnected, connect, disconnect, subscribe } = useSSE()
const unsubscribers: Array<() => void> = []

const latestUpdatedAt = computed(() => buildTimestampText([sseMetrics.value?.timestamp]))
const clients = computed(() => safeArray<ClientItem>(sseMetrics.value?.clients))
const selectedClientId = computed(() => {
  const value = route.query.clientId
  return typeof value === 'string' ? value : null
})
const selectedConnectedAt = computed(() => {
  const value = route.query.connectedAt
  if (typeof value !== 'string') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
})
const isDetailMode = computed(() => Boolean(selectedClientId.value))
const selectedClient = computed(() => {
  if (!selectedClientId.value) {
    return null
  }

  return (
    clients.value.find((item) => {
      if (item.clientId !== selectedClientId.value) {
        return false
      }
      if (selectedConnectedAt.value === null) {
        return true
      }
      return item.connectedAt === selectedConnectedAt.value
    }) ?? null
  )
})

const goToDetail = (client: ClientItem) => {
  router.push({
    path: route.path,
    query: {
      clientId: client.clientId ?? '',
      connectedAt: client.connectedAt ?? '',
    },
  })
}

const backToList = () => {
  router.push({
    path: route.path,
  })
}

const clientColumns: DataTableColumns<ClientItem> = [
  {
    title: '客户端 ID',
    key: 'clientId',
    width: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.clientId),
  },
  {
    title: '请求 URI',
    key: 'requestUri',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.requestUri),
  },
  {
    title: '客户端 IP',
    key: 'clientIp',
    width: 160,
    render: (row) => formatText(row.clientIp),
  },
  {
    title: '连接时间',
    key: 'connectedAt',
    width: 180,
    render: (row) => formatDateTime(row.connectedAt),
  },
  {
    title: '消息数',
    key: 'recentMessages',
    width: 100,
    render: (row) => formatNumber(row.recentMessages?.length ?? 0),
  },
  {
    title: '累计推送流量',
    key: 'totalPayloadBytes',
    width: 140,
    render: (row) => formatBytes(row.totalPayloadBytes),
  },
  {
    title: 'User Agent',
    key: 'userAgent',
    minWidth: 260,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.userAgent),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) =>
      h(
        NButton,
        {
          type: 'primary',
          text: true,
          onClick: () => goToDetail(row),
        },
        { default: () => '详情' },
      ),
  },
]

const loadData = async () => {
  loading.value = true
  try {
    sseMetrics.value = await sseApi.listClient()
  } finally {
    loading.value = false
  }
}

const bindSSE = () => {
  connect()
  unsubscribers.push(
    subscribe<AppSseMetricsData>('monitor-app-sse', (payload) => (sseMetrics.value = payload)),
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
</script>

<template>
  <div class="monitor-page">
    <n-spin :show="loading">
      <div class="monitor-tab">
        <div class="page-head">
          <div>
            <div class="page-head__title">
              {{ isDetailMode ? 'SSE 客户端详情' : 'SSE 客户端列表' }}
            </div>
            <div class="page-head__subtitle">
              SSE {{ isConnected ? '已连接' : '重连中' }}，最近刷新 {{ latestUpdatedAt }}
            </div>
          </div>

          <div class="page-head__actions">
            <n-button v-if="isDetailMode" secondary @click="backToList">返回列表</n-button>
          </div>
        </div>

        <template v-if="!isDetailMode">
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-card__title">当前 SSE 连接数</div>
              <div class="summary-card__value">{{ formatNumber(sseMetrics?.connectionCount) }}</div>
              <div class="summary-card__subtitle">当前后端已建立的客户端连接</div>
            </div>

            <div class="summary-card">
              <div class="summary-card__title">SSE 通道状态</div>
              <div class="summary-card__value">{{ isConnected ? '已连接' : '重连中' }}</div>
              <div class="summary-card__subtitle">实时订阅 monitor-app-sse</div>
            </div>
          </div>

          <n-card title="SSE 客户端列表" :bordered="false" class="monitor-card">
            <div class="show-scrollbar">
              <n-data-table
                :columns="clientColumns"
                :data="clients"
                size="small"
                :single-line="false"
                :pagination="false"
                scroll-x="1680"
                :row-key="
                  (row: ClientItem) => `${row.clientId ?? EMPTY_TEXT}-${row.connectedAt ?? 0}`
                "
              />
            </div>
          </n-card>
        </template>

        <template v-else>
          <SseClientDetail :client="selectedClient" />
        </template>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.monitor-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-head__title {
  color: var(--global-text-color);
  font-size: 24px;
  font-weight: 700;
}

.page-head__subtitle {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.page-head__subtitle {
  margin-top: 6px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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
.summary-card__subtitle {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.summary-card__value {
  margin-top: 10px;
  color: var(--global-text-color);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.summary-card__subtitle {
  margin-top: 8px;
}

.monitor-card {
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
