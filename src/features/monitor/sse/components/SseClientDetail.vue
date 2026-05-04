<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type ClientItem from '../type/data/ClientItem'
import type PushMessageItem from '../type/data/PushMessageItem'
import MonitorKeyValueGrid from '../../shared/components/MonitorKeyValueGrid.vue'
import {
  formatBytes,
  formatDateTime,
  formatNumber,
  formatText,
  safeArray,
} from '../../shared/utils/monitor'

defineProps<{
  client: ClientItem | null
}>()

const recentMessageColumns: DataTableColumns<PushMessageItem> = [
  {
    title: '时间',
    key: 'timestamp',
    width: 180,
    render: (row) => formatDateTime(row.timestamp),
  },
  {
    title: '事件名',
    key: 'event',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.event),
  },
  {
    title: '消息 ID',
    key: 'messageId',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.messageId),
  },
  {
    title: '载荷大小',
    key: 'payloadBytes',
    width: 120,
    render: (row) => formatBytes(row.payloadBytes),
  },
  {
    title: 'Payload',
    key: 'payload',
    minWidth: 320,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.payload),
  },
]
</script>

<template>
  <div class="detail-page">
    <n-empty v-if="!client" description="未找到对应的 SSE 客户端" />

    <template v-else>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-card__title">客户端 ID</div>
          <div class="summary-card__value summary-card__value--mono">
            {{ formatText(client.clientId) }}
          </div>
          <div class="summary-card__subtitle">
            连接时间 {{ formatDateTime(client.connectedAt) }}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-card__title">累计推送流量</div>
          <div class="summary-card__value">{{ formatBytes(client.totalPayloadBytes) }}</div>
          <div class="summary-card__subtitle">
            消息数 {{ formatNumber(client.recentMessages?.length ?? 0) }}
          </div>
        </div>
      </div>

      <n-card title="客户端详情" :bordered="false" class="monitor-card">
        <MonitorKeyValueGrid
          :columns="2"
          :items="[
            { label: '客户端 ID', value: formatText(client.clientId), mono: true },
            { label: '客户端 IP', value: formatText(client.clientIp), mono: true },
            { label: '请求 URI', value: formatText(client.requestUri), mono: true },
            { label: '连接时间', value: formatDateTime(client.connectedAt) },
            { label: '累计推送流量', value: formatBytes(client.totalPayloadBytes) },
            { label: '消息数', value: formatNumber(client.recentMessages?.length ?? 0) },
            { label: 'User Agent', value: formatText(client.userAgent) },
          ]"
        />
      </n-card>

      <n-card title="推送消息记录" :bordered="false" class="monitor-card">
        <n-data-table
          :columns="recentMessageColumns"
          :data="safeArray(client.recentMessages)"
          :pagination="false"
          size="small"
          :single-line="false"
          scroll-x="1080"
        />
      </n-card>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.summary-card__value--mono {
  font-family: 'Cascadia Mono', 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: 22px;
  word-break: break-all;
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
}
</style>
