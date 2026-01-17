<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NAvatar, NCard, NSpin, NTag, NText, NThing, NTree, type TreeOption } from 'naive-ui'
import { dbApi } from './api/DbApi'
import type DataSourceDesc from '@/views/sys/db/type/resp/DataSourceDesc'
import type DbObjTree from '@/views/sys/db/type/resp/DbObjTree.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import type TableMeta from '@/views/sys/db/type/resp/TableMeta.ts'
import type ViewMeta from '@/views/sys/db/type/resp/ViewMeta.ts'
import type FunctionMeta from '@/views/sys/db/type/resp/FunctionMeta.ts'
import type ProcedureMeta from '@/views/sys/db/type/resp/ProcedureMeta.ts'
import type SequenceMeta from '@/views/sys/db/type/resp/SequenceMeta.ts'
import type ColumnMeta from '@/views/sys/db/type/resp/ColumnMeta.ts'
import type { VxeTableInstance } from 'vxe-table'

// ====== 数据 ======
const ds = ref<DataSourceDesc[]>([])
const loading = ref(false)
const dbObjTree = ref<DbObjTree[]>([])

// ====== 本地图标加载（Vite）======
const iconModules = import.meta.glob('@/assets/db-icons/*.svg', {
  eager: true,
  import: 'default'
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
  sqlserver: iconByName('sqlserver')
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
      _driver: shortClassName(item.dbType)
    }
  })
})

// ============================= 数据源内部 ==============================>

const currentDs = ref<DataSourceDesc>()
const dsDialogShowStatus = ref(false)
const schemas = ref<string[]>()
/**
 * 展开节点
 */
const expandedKeys = ref<Array<string | number>>([])
/**
 * 选中节点
 */
const selectedKeys = ref<Array<string | number>>([])

const objectTypes = ['tableObjs', 'viewObjs', 'functionObjs', 'procedureObjs', 'sequenceObjs']

/**
 * 当前对象名称
 */
const objectName = ref<string>()
/**
 * 当前对象注释
 */
const objectComment = ref<string>()
/**
 * 表格或视图的字段元数据（如果当前对象是表格/视图）
 */
const columns = ref<ColumnMeta[]>([])
/**
 * 表格或视图的真实数据（分页）
 */
const data = ref<Record<string, unknown>[]>([])
/**
 * 真实数据的总数据量
 */
const total = ref<number>(0)

/**
 * 计算表格列宽度
 */
const getColumnWidth = (col: ColumnMeta) => {
  if (col.columnType.includes('int')) return 80
  if (col.columnType.includes('time')) return 160
  if (col.columnLength <= 32) return 120
  if (col.columnLength <= 64) return 160
  return 220
}

/**
 * 打开数据源弹出框
 */
const openDsDialog = async (item: DataSourceDesc) => {
  currentDs.value = item
  dsDialogShowStatus.value = true
  // 获取该数据源下所有的schema
  schemas.value = await dbApi.schemas(item.name)

  // 产生树形结构数据
  dbObjTree.value = schemas.value.map((schema) => {
    return {
      id: schema,
      name: schema,
      ds: item.name,
      schema: schema,
      type: 'schema',
      isLeaf: false,
      children: undefined,
      raw: schema
    }
  })
}

/**
 * 渲染图标逻辑
 */
const renderPrefix = ({ option }: { option: TreeOption; checked: boolean; selected: boolean }) => {
  // 判断是否展开确认icon颜色
  const isExpanded = expandedKeys.value.includes(option.id as string)
  const iconColor = isExpanded ? '#1890ff' : undefined

  const nodeType = option.type
  let iconName: string
  if (nodeType === 'schema') {
    iconName = 'LayersOutline'
  } else if (nodeType === 'tableObjs') {
    iconName = 'GridOutline'
  } else if (nodeType === 'viewObjs') {
    iconName = 'EyeOutline'
  } else if (nodeType === 'functionObjs') {
    iconName = 'CodeSlashOutline'
  } else if (nodeType === 'procedureObjs') {
    iconName = 'PlayCircleOutline'
  } else if (nodeType === 'sequenceObjs') {
    iconName = 'TrendingUpOutline'
  } else {
    iconName = 'FolderOutline'
  }

  const iconRender = renderAsyncIcon(iconName, {
    color: iconColor
  })

  return iconRender ? iconRender() : null
}

/**
 * 设置每个节点的属性
 */
const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    // 如果node处于展开状态
    class: expandedKeys.value.includes(option.id as string) ? 'is-expanded' : '',
    onClick: async (e: Event) => {
      e.stopPropagation()
      if (option.type === 'table') {
        columns.value = []
        data.value = []
        objectName.value = option.name as string
        objectComment.value = option.comment as string

        // table的列元数据
        const raw = option.raw as TableMeta
        columns.value = raw.columnMetas

        // 拉取table真实数据
        dbApi
          .fetchData(
            {
              ds: option.ds as string,
              schema: raw.schema,
              name: raw.table
            },
            1,
            300
          )
          .then((result) => {
            // 拉取成功
            data.value = result
          })

        // 拉取总数量
        dbApi
          .fetchCount({
            ds: option.ds as string,
            schema: raw.schema,
            name: raw.table
          })
          .then((count) => {
            total.value = count
          })
      }
    }
  }
}

/**
 * 懒加载
 */
const handleLoad = async (node: TreeOption) => {
  console.log(node)
  // 获取schema下面的对象
  if (node.type === 'schema') {
    node.children = objectTypes.map((item) => {
      return {
        id: node.id + '-' + item,
        name: item.slice(0, -4),
        ds: node.ds,
        schema: node.name,
        type: item,
        isLeaf: false,
        children: undefined,
        raw: node.name
      }
    })
    return
  }
  // 获取表
  else if (node.type === 'tableObjs') {
    const tables: TableMeta[] = await dbApi.tables(node.ds as string, node.schema as string)
    node.children = tables.map((item) => {
      return {
        id: node.id + '-table-' + item.table,
        name: item.table,
        ds: node.ds,
        schema: item.schema,
        type: 'table',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item
      }
    })
    return
  }
  // 获取视图
  else if (node.type === 'viewObjs') {
    const views: ViewMeta[] = await dbApi.views(node.ds as string, node.schema as string)
    node.children = views.map((item) => {
      return {
        id: node.id + '-view-' + item.viewName,
        name: item.viewName,
        ds: node.ds,
        schema: item.schema,
        type: 'view',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item
      }
    })
    return
  }
  // 获取函数
  else if (node.type === 'functionObjs') {
    const functions: FunctionMeta[] = await dbApi.functions(
      node.ds as string,
      node.schema as string
    )
    node.children = functions.map((item) => {
      return {
        id: node.id + '-function-' + item.name,
        name: item.name,
        ds: node.ds,
        schema: item.schema,
        type: 'function',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item
      }
    })
    return
  }
  // 获取存储过程
  else if (node.type === 'procedureObjs') {
    const procedures: ProcedureMeta[] = await dbApi.procedures(
      node.ds as string,
      node.schema as string
    )
    node.children = procedures.map((item) => {
      return {
        id: node.id + '-procedure-' + item.name,
        name: item.name,
        ds: node.ds,
        schema: item.schema,
        type: 'procedure',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item
      }
    })
    return
  }
  // 获取序列
  else if (node.type === 'sequenceObjs') {
    const sequences: SequenceMeta[] = await dbApi.sequences(
      node.ds as string,
      node.schema as string
    )
    node.children = sequences.map((item) => {
      return {
        id: node.id + '-sequence-' + item.name,
        name: item.name,
        ds: node.ds,
        schema: item.schema,
        type: 'sequence',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item
      }
    })
    return
  }
  // 其他对象
  node.children = []
}

const xTable = ref<VxeTableInstance>()
/**
 * 表格编辑
 */
const handleEditClosed = async ({row}) => {
  console.log(row)
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
      <div flex>
        <!-- 元数据菜单 -->
        <div h="[80vh]" min-h="500px">
          <div class="obj-tree" w="300px">
            <n-scrollbar style="max-height: 80vh">
              <n-tree
                :data="dbObjTree"
                v-model:expanded-keys="expandedKeys"
                v-model:selected-keys="selectedKeys"
                expand-on-click
                block-line
                show-line
                selectable
                key-field="id"
                label-field="name"
                children-field="children"
                :render-prefix="renderPrefix"
                :on-load="handleLoad"
                :node-props="nodeProps"
              />
            </n-scrollbar>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="mx-4 w-px bg-gray-200"></div>

        <!-- 数据区域 -->
        <n-card v-if="objectName" :title="objectName" size="huge" w="[70%]">
          {{ objectComment }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 总数据量：{{ total }}

          <n-tabs type="line" animated>
            <n-tab-pane name="data" tab="表数据">
              <n-scrollbar x-scrollable>
                <vxe-table
                  ref="xTable"
                  border
                  show-overflow="title"
                  show-header-overflow="title"
                  keep-source
                  height="500"
                  :column-config="{ resizable: true }"
                  :edit-config="{
                      trigger: 'click',
                      mode: 'cell',
                      showStatus: true,
                      showIcon: false,
                    }"
                  :data="data"
                  @edit-closed="handleEditClosed"
                >
                  <!-- 数据库字段，动态渲染 -->
                  <vxe-column
                    ref="xTable"
                    v-for="column in columns"
                    align="center"
                    :key="column.columnName"
                    :field="column.columnName"
                    :title="column.columnName"
                    :min-width="getColumnWidth(column)"
                    :edit-render="{ name: 'input' }"
                  >
                    <template #header>
                      <div class="db-header" :title="undefined">
                        <div class="name">{{ column.columnName }}</div>
                        <div font-400>{{ column.columnType }}({{ column.columnLength }})</div>
                      </div>
                    </template>
                  </vxe-column>
                </vxe-table>
              </n-scrollbar>
            </n-tab-pane>
            <n-tab-pane name="column" tab="表字段"> 列字段</n-tab-pane>
            <n-tab-pane name="index" tab="索引"> 索引</n-tab-pane>
            <n-tab-pane name="cfq" tab="触发器"> 触发器</n-tab-pane>
          </n-tabs>
        </n-card>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
:deep(.n-tree-node.is-expanded .n-tree-node-content__text) {
  color: #1890ff;
  font-weight: 600;
}
</style>
