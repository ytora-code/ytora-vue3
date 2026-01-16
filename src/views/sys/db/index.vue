<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NAvatar, NCard, NSpin, NTag, NText, NThing, NTooltip } from 'naive-ui'
import { dbApi } from './api/DbApi'
import type DataSourceDesc from '@/views/sys/db/type/resp/DataSourceDesc'

// ====== 数据 ======
const ds = ref<DataSourceDesc[]>([])
const loading = ref(false)

// ====== 本地图标加载（Vite）======
const iconModules = import.meta.glob('@/assets/db-icons/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function iconByName(name: string) {
  const key = Object.keys(iconModules).find((k) => k.endsWith(`/${name}.svg`))
  return key ? iconModules[key] : ''
}

// 目前只有6个数据库产品
const iconMap = {
  postgresql: iconByName('postgresql'),
  mysql: iconByName('mysql'),
  mariadb: iconByName('mariadb'),
  oracle: iconByName('oracle'),
  sqlite: iconByName('sqlite'),
  sqlserver: iconByName('sqlserver'),
} as const

// ====== 驱动类名 -> dbKey ======
type DbKey = keyof typeof iconMap | 'unknown'

const resolveDbKey = (driver?: string): DbKey => {
  const s = (driver || '').toLowerCase()

  // PostgreSQL
  if (s.includes('postgresql')) return 'postgresql'

  // MySQL / MariaDB
  if (s.includes('mysql')) return 'mysql'
  // mariadb: org.mariadb.jdbc.Driver
  if (s.includes('mariadb')) return 'mariadb'

  // Oracle
  // oracle: oracle.jdbc.OracleDriver / oracle.jdbc.driver.OracleDriver
  if (s.includes('oracle')) return 'oracle'

  // SQLite
  // sqlite: org.sqlite.JDBC
  if (s.includes('sqlite')) return 'sqlite'

  // SQL Server
  // mssql: com.microsoft.sqlserver.jdbc.SQLServerDriver
  // jTDS: net.sourceforge.jtds.jdbc.Driver
  if (s.includes('sqlserver') || s.includes('microsoft') || s.includes('jtds')) return 'sqlserver'

  return 'unknown'
}

const prettyDbName = (key: DbKey) => {
  switch (key) {
    case 'postgresql':
      return 'PostgreSQL'
    case 'mysql':
      return 'MySQL'
    case 'mariadb':
      return 'MariaDB'
    case 'oracle':
      return 'Oracle'
    case 'sqlite':
      return 'SQLite'
    case 'sqlserver':
      return 'SQL Server'
    default:
      return 'Unknown'
  }
}

const shortClassName = (full?: string) => {
  if (!full) return ''
  const i = full.lastIndexOf('.')
  return i >= 0 ? full.slice(i + 1) : full
}

const viewList = computed(() => {
  return ds.value.map((item) => {
    const dbKey = resolveDbKey(item.dbType)
    const iconSrc = dbKey === 'unknown' ? '' : iconMap[dbKey]
    return {
      ...item,
      _dbKey: dbKey,
      _dbName: prettyDbName(dbKey),
      _icon: iconSrc,
      _pool: shortClassName(item.dsType),
      _driver: shortClassName(item.dbType),
    }
  })
})

const currentDs = ref<DataSourceDesc>()
const dsDialogShowStatus = ref(false)

const openDsDialog = (item: DataSourceDesc) => {
  currentDs.value = item
  dsDialogShowStatus.value = true
}

onMounted(async () => {
  loading.value = true
  try {
    ds.value = await dbApi.dataSources()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <n-spin :show="loading">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <n-card
          v-for="item in viewList"
          :key="item.name"
          cursor-pointer
          hoverable
          @click="openDsDialog(item)"
        >
          <n-thing>
            <template #avatar>
              <n-avatar :src="item._icon || undefined" :size="40" bg-white>
                <!-- 没匹配到图标时的 fallback（显示首字母） -->
                <span v-if="!item._icon" class="text-[14px] font-700">
                  {{ (item._dbName || 'DB').slice(0, 2).toUpperCase() }}
                </span>
              </n-avatar>
            </template>

            <template #header>
              <div flex items-center gap-2>
                <span font-600>{{ item.name }}</span>
                <n-tag size="small" type="info" round>{{ item._dbName }}</n-tag>
              </div>
            </template>

            <template #description>
              <div class="mt-1 text-[12px] op-70">
                {{ item.desc || '—' }}
              </div>
            </template>

            <template #default>
              <div class="mt-3 flex flex-col gap-2 text-[12px]">
                <div class="flex items-center justify-between">
                  <n-text depth="3">连接池</n-text>
                  <n-tag size="small" round>
                    {{ item._pool || '—' }}
                  </n-tag>
                </div>
              </div>
            </template>
          </n-thing>

          <!-- hover 效果（UnoCSS） -->
          <div
            class="pointer-events-none absolute inset-0 rounded-2xl op-0 transition-opacity duration-200 hover:op-100"
            style="box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06)"
          />
        </n-card>
      </div>
    </n-spin>

    <n-modal
      w="[95%]"
      v-model:show="dsDialogShowStatus"
      :mask-closable="false"
      preset="card"
      :title="currentDs?.name"
      draggable
    >
      <div h="[80vh]" min-h="500px">

      </div>
    </n-modal>
  </div>
</template>

<style scoped></style>
