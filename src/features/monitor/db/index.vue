<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { computed, h, onMounted, ref } from 'vue'
import { NTag } from 'naive-ui'
import MonitorKeyValueGrid from '../shared/components/MonitorKeyValueGrid.vue'
import MonitorMetricCard from '../shared/components/MonitorMetricCard.vue'
import { monitorDbApi } from '../shared/api'
import type {
  DbDataSourceItem,
  DbDataSourceRuntimeItem,
  DbDynamicData,
  DbHotSlowSqlItem,
  DbSlowSqlItem,
  DbStaticData,
} from '../shared/type/monitor'
import {
  buildTimestampText,
  formatBoolean,
  formatDateTime,
  formatMilliseconds,
  formatNumber,
  formatText,
  safeArray,
  statusTagType,
} from '../shared/utils/monitor'

const loading = ref(false)
const overview = ref<DbDynamicData | null>(null)
const staticData = ref<DbStaticData | null>(null)

const latestUpdatedAt = computed(() => buildTimestampText([overview.value?.timestamp]))

const metricCards = computed(() => [
  {
    title: '累计 SQL 总数',
    value: formatNumber(overview.value?.totalSqlCount),
    subtitle: `成功 ${formatNumber(overview.value?.successSqlCount)} / 失败 ${formatNumber(overview.value?.failureSqlCount)}`,
    icon: 'i-lucide-database',
    tone: 'blue' as const,
  },
  {
    title: '平均执行耗时',
    value: formatMilliseconds(overview.value?.averageDurationMs),
    subtitle: `最大耗时 ${formatMilliseconds(overview.value?.maxDurationMs)}`,
    icon: 'i-lucide-timer',
    tone: 'amber' as const,
  },
  {
    title: '累计慢 SQL',
    value: formatNumber(overview.value?.slowSqlCount),
    subtitle: `阈值 ${formatMilliseconds(overview.value?.slowSqlThreshold)}`,
    icon: 'i-lucide-turtle',
    tone: 'red' as const,
  },
  {
    title: '数据源数量',
    value: formatNumber(staticData.value?.dataSources?.length ?? 0),
    subtitle: `主数据源 ${formatText(staticData.value?.primaryKey)}`,
    icon: 'i-lucide-server-cog',
    tone: 'green' as const,
  },
])

const totalPoolConnections = computed(() =>
  safeArray(overview.value?.dataSources).reduce(
    (sum, item) => sum + (item.totalConnections ?? 0),
    0,
  ),
)
const totalActiveConnections = computed(() =>
  safeArray(overview.value?.dataSources).reduce(
    (sum, item) => sum + (item.activeConnections ?? 0),
    0,
  ),
)
const totalAwaitingThreads = computed(() =>
  safeArray(overview.value?.dataSources).reduce(
    (sum, item) => sum + (item.threadsAwaitingConnection ?? 0),
    0,
  ),
)

const overviewItems = computed(() => [
  { label: '主数据源 Key', value: formatText(staticData.value?.primaryKey) },
  { label: '数据源数量', value: formatNumber(staticData.value?.dataSources?.length ?? 0) },
  { label: '连接池总连接数', value: formatNumber(totalPoolConnections.value) },
  { label: '活跃连接总数', value: formatNumber(totalActiveConnections.value) },
  { label: '等待线程总数', value: formatNumber(totalAwaitingThreads.value) },
  { label: '最近采样时间', value: latestUpdatedAt.value },
])

const runtimeColumns: DataTableColumns<DbDataSourceRuntimeItem> = [
  {
    title: '数据源',
    key: 'name',
    width: 140,
    render: (row) => formatText(row.name),
  },
  {
    title: '数据库类型',
    key: 'databaseProductName',
    width: 140,
    render: (row) => formatText(row.databaseProductName),
  },
  {
    title: '连接池',
    key: 'poolType',
    width: 140,
    render: (row) => formatText(row.poolType),
  },
  {
    title: '活跃连接',
    key: 'activeConnections',
    width: 110,
    render: (row) => formatNumber(row.activeConnections),
  },
  {
    title: '空闲连接',
    key: 'idleConnections',
    width: 110,
    render: (row) => formatNumber(row.idleConnections),
  },
  {
    title: '总连接',
    key: 'totalConnections',
    width: 100,
    render: (row) => formatNumber(row.totalConnections),
  },
  {
    title: '等待线程',
    key: 'threadsAwaitingConnection',
    width: 110,
    render: (row) => formatNumber(row.threadsAwaitingConnection),
  },
  {
    title: 'JDBC URL',
    key: 'jdbcUrl',
    minWidth: 260,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.jdbcUrl),
  },
]

const staticColumns: DataTableColumns<DbDataSourceItem> = [
  {
    title: '数据源',
    key: 'name',
    width: 140,
    render: (row) =>
      h(
        NTag,
        {
          bordered: false,
          type: row.name === staticData.value?.primaryKey ? 'success' : 'default',
        },
        { default: () => formatText(row.name) },
      ),
  },
  {
    title: '描述',
    key: 'description',
    width: 160,
    render: (row) => formatText(row.description),
  },
  {
    title: '类型',
    key: 'type',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.type),
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
    render: (row) => formatText(row.username),
  },
  {
    title: '驱动类',
    key: 'driverClassName',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.driverClassName),
  },
  {
    title: '连接地址',
    key: 'url',
    minWidth: 320,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.url),
  },
]

const slowSqlColumns: DataTableColumns<DbSlowSqlItem> = [
  {
    title: '时间',
    key: 'timestamp',
    width: 170,
    render: (row) => formatDateTime(row.timestamp),
  },
  {
    title: '结果',
    key: 'success',
    width: 90,
    render: (row) =>
      h(
        NTag,
        {
          bordered: false,
          type: statusTagType(row.success),
        },
        { default: () => formatBoolean(row.success) },
      ),
  },
  {
    title: 'SQL 类型',
    key: 'sqlType',
    width: 100,
    render: (row) => formatText(row.sqlType),
  },
  {
    title: '耗时',
    key: 'elapsedMillis',
    width: 120,
    render: (row) => formatMilliseconds(row.elapsedMillis),
  },
  {
    title: 'SQL 文本',
    key: 'sql',
    minWidth: 320,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.sql),
  },
  {
    title: '参数',
    key: 'paramsText',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.paramsText),
  },
  {
    title: '异常类',
    key: 'exceptionClass',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.exceptionClass),
  },
  {
    title: '异常信息',
    key: 'exceptionMsg',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.exceptionMsg),
  },
]

const hotSlowSqlColumns: DataTableColumns<DbHotSlowSqlItem> = [
  {
    title: 'SQL 类型',
    key: 'sqlType',
    width: 100,
    render: (row) => formatText(row.sqlType),
  },
  {
    title: '命中次数',
    key: 'count',
    width: 100,
    render: (row) => formatNumber(row.count),
  },
  {
    title: '平均耗时',
    key: 'averageDurationMs',
    width: 120,
    render: (row) => formatMilliseconds(row.averageDurationMs),
  },
  {
    title: '最大耗时',
    key: 'maxDurationMs',
    width: 120,
    render: (row) => formatMilliseconds(row.maxDurationMs),
  },
  {
    title: '评分',
    key: 'score',
    width: 100,
    render: (row) => formatNumber(row.score, 2),
  },
  {
    title: '首次出现',
    key: 'firstSeenTime',
    width: 170,
    render: (row) => formatDateTime(row.firstSeenTime),
  },
  {
    title: '最近出现',
    key: 'lastSeenTime',
    width: 170,
    render: (row) => formatDateTime(row.lastSeenTime),
  },
  {
    title: '代表 SQL',
    key: 'sampleSql',
    minWidth: 320,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.sampleSql),
  },
  {
    title: '最近参数',
    key: 'sampleParamsText',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.sampleParamsText),
  },
  {
    title: '指纹',
    key: 'fingerprint',
    minWidth: 260,
    ellipsis: { tooltip: true },
    render: (row) => formatText(row.fingerprint),
  },
]

const loadData = async () => {
  loading.value = true
  try {
    const [overviewResult, staticResult] = await Promise.all([
      monitorDbApi.overview(),
      monitorDbApi.dataSources(),
    ])
    overview.value = overviewResult
    staticData.value = staticResult
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="monitor-page">
    <n-spin :show="loading">
      <div class="monitor-tab">
        <div class="monitor-page__head">
          <div>
            <div class="monitor-page__title">数据库监控</div>
            <div class="monitor-page__subtitle">最近刷新 {{ latestUpdatedAt }}</div>
          </div>

          <n-button type="primary" @click="loadData">刷新数据</n-button>
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

        <n-card title="监控总览" :bordered="false" class="monitor-card">
          <MonitorKeyValueGrid :columns="2" :items="overviewItems" />
        </n-card>

        <n-card title="数据源运行状态" :bordered="false" class="monitor-card show-scrollbar">
          <n-data-table
            :columns="runtimeColumns"
            :data="safeArray(overview?.dataSources)"
            :pagination="false"
            size="small"
            :single-line="false"
            scroll-x="1300"
          />
        </n-card>

        <n-card title="数据源配置清单" :bordered="false" class="monitor-card show-scrollbar">
          <n-data-table
            :columns="staticColumns"
            :data="safeArray(staticData?.dataSources)"
            :pagination="false"
            size="small"
            :single-line="false"
            scroll-x="1500"
          />
        </n-card>

        <n-card title="最近慢 SQL" :bordered="false" class="monitor-card">
          <n-data-table
            :columns="slowSqlColumns"
            :data="safeArray(overview?.recentSlowSqls)"
            :pagination="{ pageSize: 8 }"
            size="small"
            :single-line="false"
            scroll-x="1800"
          />
        </n-card>

        <n-card title="热点慢 SQL 排行" :bordered="false" class="monitor-card">
          <n-data-table
            :columns="hotSlowSqlColumns"
            :data="safeArray(overview?.hotSlowSqls)"
            :pagination="{ pageSize: 8 }"
            size="small"
            :single-line="false"
            scroll-x="1900"
          />
        </n-card>
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

.monitor-page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.monitor-page__title {
  color: var(--global-text-color);
  font-size: 24px;
  font-weight: 700;
}

.monitor-page__subtitle {
  margin-top: 6px;
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.stat-grid,
.two-column-grid {
  display: grid;
  gap: 16px;
}

.stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.two-column-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.monitor-card {
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .two-column-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .monitor-page__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .stat-grid,
  .two-column-grid {
    grid-template-columns: 1fr;
  }
}
</style>
