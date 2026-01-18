<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  NAvatar,
  NButton,
  NCard,
  NFlex,
  NSpin,
  NTag,
  NText,
  NThing,
  NTree,
  type TreeOption,
} from 'naive-ui'
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
import type IndexMeta from '@/views/sys/db/type/resp/IndexMeta.ts'
import type IndexColumnMeta from '@/views/sys/db/type/resp/IndexColumnMeta.ts'

// ====== 数据 ======
const ds = ref<DataSourceDesc[]>([])
const loading = ref(false)
const dbObjTree = ref<DbObjTree[]>([])

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
 * 当前的选中节点
 */
const currentNode = ref<TreeOption>()

/**
 * 当前对象名称
 */
const objectName = ref<string>()
/**
 * 当前对象注释
 */
const objectComment = ref<string>()
/**
 * 查询条件
 */
const whereSQL = ref<string>()
/**
 * 表格或视图的字段元数据（如果当前对象是表格/视图）
 */
const columns = ref<ColumnMeta[]>([])
/**
 * 表的主键
 */
const primaryKey = ref<string[]>([])
/**
 * 数据表格loading状态
 */
const tableLoading = ref(false)
/**
 * 表格或视图的真实数据（分页）
 */
const data = shallowRef<Record<string, unknown>[]>([])
/**
 * 真实数据的总数据量
 */
const total = ref<number>(-1)
/**
 * 页码
 */
const pageNo = ref<number>(1)
/**
 * 当前页数据量
 */
const pageSize = ref<number>(1000)
/**
 * 总页数
 */
const pages = ref<number>(-1)

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
      raw: schema,
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
    color: iconColor,
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
      if (option.type === 'table' || option.type === 'view') {
        // 初始化表格分页数据
        pageNo.value = 1
        pageSize.value = 1000
        total.value = -1
        pages.value = -1

        whereSQL.value = undefined
        columns.value = []
        data.value = []
        objectName.value = option.name as string
        objectComment.value = option.comment as string

        currentNode.value = option

        // 拉取表/视图的数据
        fetchData(option)
      }
    },
  }
}

const fetchData = (option?: TreeOption) => {
  isChanged.value = false
  hasSelected.value = false
  if (!option) {
    return
  }
  tableLoading.value = true

  // 默认1000页
  if (pageSize.value === 0) {
    pageSize.value = 123
  }

  // table/view元数据
  let raw: TableMeta | ViewMeta
  if (option.type === 'table') {
    raw = option.raw as TableMeta
  } else {
    raw = option.raw as ViewMeta
  }

  // table的主键有且仅有一个，才使用主键作为表格的rowId
  if (raw.primaryKeys && raw.primaryKeys.length > 0) {
    primaryKey.value = raw.primaryKeys
  } else {
    primaryKey.value = []
  }

  // 列元数据
  columns.value = raw.columnMetas
  // 索引
  indices.value = raw.indexMetas ?? []

  // 异步拉取拉取总数量
  dbApi
    .fetchCount({
      ds: option.ds as string,
      schema: raw.schema,
      name: raw.name,
      where: whereSQL.value,
    })
    .then((count) => {
      // 有可能一些大表拉取总数据量很慢，等到拉到数据时，已经切换到其他页面了
      // 所以需要判断一下，当前最新的对象名称和这个count接口拉取数量时的对象名称是不是同一个
      if (raw.name !== objectName.value) {
        console.warn(
          `成功拉到 ${raw.name} 的总数据量共 ${count}，但已经切换到了 ${objectName.value}，所以忽略掉拉取到的数据`,
        )
        return
      }
      total.value = count
      pages.value = Math.ceil(count / pageSize.value)
    })

  // 异步拉取table真实数据
  dbApi
    .fetchData(
      {
        ds: option.ds as string,
        schema: raw.schema,
        name: raw.name,
        where: whereSQL.value,
      },
      pageNo.value,
      pageSize.value,
    )
    .then((result) => {
      pageSize.value = result.length
      data.value = result.map((row, index) => {
        // 产生rowId
        let _vxeId = undefined
        // 有主键，使用主键值拼接成rowId
        if (raw.primaryKeys && raw.primaryKeys.length > 0) {
          _vxeId = raw.primaryKeys.map((pk) => row[pk]).join('|')
        }
        return {
          ...row,
          _vxeId: _vxeId || `idx_${index}`,
        }
      })
    })
    .finally(() => {
      tableLoading.value = false
    })
}

/**
 * 分页变化时的回调
 */
const handlePageChange = (page: number) => {
  pageNo.value = page
  if (currentNode.value) {
    fetchData(currentNode.value)
  }
}
const handlePageSizeInput = () => {
  if (pageSize.value <= 0) {
    pageSize.value = 100
  }
  pageNo.value = 1
  if (currentNode.value) {
    fetchData(currentNode.value)
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
        raw: node.name,
      }
    })
    return
  }
  // 获取表
  else if (node.type === 'tableObjs') {
    const tables: TableMeta[] = await dbApi.tables(node.ds as string, node.schema as string)
    node.children = tables.map((item) => {
      return {
        id: node.id + '-table-' + item.name,
        name: item.name,
        ds: node.ds,
        schema: item.schema,
        type: 'table',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item,
      }
    })
    return
  }
  // 获取视图
  else if (node.type === 'viewObjs') {
    const views: ViewMeta[] = await dbApi.views(node.ds as string, node.schema as string)
    node.children = views.map((item) => {
      return {
        id: node.id + '-view-' + item.name,
        name: item.name,
        ds: node.ds,
        schema: item.schema,
        type: 'view',
        comment: item.comment,
        isLeaf: true,
        children: [],
        raw: item,
      }
    })
    return
  }
  // 获取函数
  else if (node.type === 'functionObjs') {
    const functions: FunctionMeta[] = await dbApi.functions(
      node.ds as string,
      node.schema as string,
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
        raw: item,
      }
    })
    return
  }
  // 获取存储过程
  else if (node.type === 'procedureObjs') {
    const procedures: ProcedureMeta[] = await dbApi.procedures(
      node.ds as string,
      node.schema as string,
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
        raw: item,
      }
    })
    return
  }
  // 获取序列
  else if (node.type === 'sequenceObjs') {
    const sequences: SequenceMeta[] = await dbApi.sequences(
      node.ds as string,
      node.schema as string,
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
        raw: item,
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
const handleEditClosed = async () => {
  console.log('表格编辑')
  updateTableStatus()
}

// ============================= 表格/视图的列元信息 ==============================>
const columnSearch = ref('')
/**
 * 格式化显示类型，例如: varchar -> varchar(255), decimal -> decimal(10, 2)
 */
const formatFullType = (col: ColumnMeta) => {
  let type = col.columnType.toLowerCase()
  if (col.columnLength > 0 && !type.includes('(')) {
    if (col.decimalDigits > 0) {
      type += `(${col.columnLength}, ${col.decimalDigits})`
    } else {
      type += `(${col.columnLength})`
    }
  }
  return type
}

/**
 * 过滤后的列数据
 */
const filteredColumns = computed(() => {
  if (!columnSearch.value) return columns.value
  const s = columnSearch.value.toLowerCase()
  return columns.value.filter(
    (c) =>
      c.columnName.toLowerCase().includes(s) ||
      (c.columnComment && c.columnComment.toLowerCase().includes(s)),
  )
})

/**
 * 获取主键图标渲染函数
 */
const renderKeyIcon = renderAsyncIcon('KeyOutline', { color: '#f0a020', size: 18 })
/**
 * 获取自增图标渲染函数
 */
const renderFlashIcon = renderAsyncIcon('FlashOutline', { color: '#1890ff', size: 18 })

// ============================= 表格/视图的列元信息 ==============================>
/**
 * 索引数据
 */
const indices = ref<IndexMeta[]>([])

// 渲染图标
const renderIndexIcon = renderAsyncIcon('FingerPrintOutline', { color: '#1890ff', size: 18 })
const renderShieldIcon = renderAsyncIcon('ShieldCheckmarkOutline', { color: '#52c41a', size: 16 })

// ============================= 表格数据的新增/删除/提交/取消/ ==============================>
/**
 * 是否有未提交的变动
 */
const isChanged = ref(false)
/**
 * 是否勾选了行
 */
const hasSelected = ref(false)

/**
 * 更新表格变动状态 (增删改)
 */
const updateTableStatus = () => {
  const $table = xTable.value
  if ($table) {
    const { insertRecords, updateRecords, removeRecords } = $table.getRecordset()
    isChanged.value =
      insertRecords.length > 0 || updateRecords.length > 0 || removeRecords.length > 0
  }
}

/**
 * 更新复选框勾选状态
 */
const updateSelectionStatus = () => {
  const $table = xTable.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    hasSelected.value = selectRecords.length > 0
  }
}

const handleAdd = async () => {
  const $table = xTable.value
  if ($table) {
    // 插入到最后，也可以不传参数默认插入到第一行
    const { row } = await $table.insertAt({}, -1)
    // 自动滚动并聚焦到新行
    await $table.scrollToRow(row)
    await $table.setEditCell(row, columns.value[0].columnName)

    updateTableStatus()
  }
}

const handleRemove = async () => {
  const $table = xTable.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length === 0) {
      message.warning('请至少选择一行数据进行删除')
      return
    }
    // 打印数据
    console.log('--- 准备删除的行 ---', selectRecords)
    // 从视图中移除（注意：这会将行放入 removeRecords 队列）
    await $table.removeCheckboxRow()
    console.info(`已标记移除 ${selectRecords.length} 条数据`)

    updateTableStatus()
    updateSelectionStatus()
  }
}

const handleRevert = async () => {
  const $table = xTable.value
  if ($table) {
    await $table.revertData()
    await nextTick()
    console.info('已撤销所有未提交的更改')

    updateTableStatus()
    updateSelectionStatus()
    isChanged.value = false
  }
}

const handleSubmit = async () => {
  const $table = xTable.value
  if (!$table) return

  const { insertRecords, updateRecords, removeRecords } = $table.getRecordset()

  if (insertRecords.length === 0 && updateRecords.length === 0 && removeRecords.length === 0) {
    console.log('没有发现任何更改')
    return
  }

  // 模拟提交
  console.log('--- 提交数据到后端 ---')
  console.log('新增:', insertRecords)
  console.log('修改:', updateRecords)
  console.log('删除:', removeRecords)

  const { fullData } = $table.getTableData()
  await $table.reloadData(fullData)

  await nextTick()

  updateTableStatus()
  updateSelectionStatus()
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

    <n-drawer v-model:show="dsDialogShowStatus" default-width="100%">
      <n-drawer-content :native-scrollbar="false" closable>
        <template #header>
          {{ currentDs?.name }}
        </template>
        <div flex w="[80%]" gap-3>
          <!-- 元数据菜单 -->
          <div>
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

          <!-- 数据区域 -->
          <div v-if="objectName" class="data-container" w="[100%]">
            <span text-xl font-600>{{ objectName }}({{ objectComment ?? '-' }})</span>
            <!-- 分割线 -->
            <n-divider />

            <n-grid :cols="4">
              <n-gi> 总数据量：{{ total < 0 ? 'loading...' : total }} </n-gi>
              <n-gi> 当前页：{{ pageNo }} </n-gi>
              <n-gi> 当前页数据量：{{ pageSize }} </n-gi>
              <n-gi> 总页数：{{ pages < 0 ? 'loading...' : pages }} </n-gi>
            </n-grid>

            <n-tabs type="line" animated>
              <n-tab-pane
                v-if="currentNode?.type === 'table' || currentNode?.type === 'view'"
                name="data"
                tab="表数据"
              >
                <n-spin :show="tableLoading">
                  <vxe-table
                    ref="xTable"
                    border
                    show-overflow="title"
                    show-header-overflow="title"
                    keep-source
                    height="550"
                    :scroll-y="{ enabled: true, gt: 20 }"
                    :scroll-x="{ enabled: true, gt: 10 }"
                    :row-config="{ keyField: '_vxeId', isHover: true, isCurrent: true }"
                    :column-config="{ resizable: true }"
                    :edit-config="{
                      trigger: 'click',
                      mode: 'cell',
                      showStatus: true,
                      showIcon: false,
                    }"
                    :data="data"
                    @edit-closed="handleEditClosed"
                    @checkbox-change="updateSelectionStatus"
                    @checkbox-all="updateSelectionStatus"
                  >
                    <!-- 复选框列，用于删除勾选 -->
                    <vxe-column type="checkbox" width="50" fixed="left" align="center" />

                    <!-- 数据库字段，动态渲染 -->
                    <vxe-column
                      v-for="column in columns"
                      align="center"
                      :key="column.columnName"
                      :field="column.columnName"
                      :title="column.columnName"
                      :min-width="getColumnWidth(column)"
                      :edit-render="{ name: 'input' }"
                      :fixed="primaryKey.includes(column.columnName) ? 'left' : undefined"
                    >
                      <template #header>
                        <div class="db-header" :title="undefined">
                          <div class="name">{{ column.columnName }}</div>
                          <div font-400>{{ column.columnType }}({{ column.columnLength }})</div>
                        </div>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </n-spin>

                <!-- 分割线 -->
                <n-divider />

                <!-- 表格底部 -->
                <n-flex align="center">
                  <n-button text type="primary" @click="handleAdd" :render-icon="renderAsyncIcon('AddOutline')" />
                  <n-button
                    text
                    :disabled="!hasSelected"
                    :type="hasSelected ? 'primary' : undefined"
                    @click="handleRemove"
                    :render-icon="renderAsyncIcon('RemoveOutline')"
                  />
                  <n-button
                    text
                    :disabled="!isChanged"
                    :type="isChanged ? 'primary' : undefined"
                    @click="handleRevert"
                    :render-icon="renderAsyncIcon('CloseOutline')"
                  />
                  <n-button
                    text
                    :disabled="!isChanged"
                    :type="isChanged ? 'primary' : undefined"
                    @click="handleSubmit"
                    :render-icon="renderAsyncIcon('CheckmarkOutline')"
                  />
                  <span>每页数据量</span>
                  <n-input-number
                    v-model:value="pageSize"
                    size="small"
                    :min="1"
                    :max="10000"
                    :step="1"
                    :show-button="false"
                    style="width: 70px"
                    @keyup.enter="handlePageSizeInput"
                    @blur="handlePageSizeInput"
                  />
                  <span>-</span>
                  <span>页数</span>
                  <n-pagination
                    v-model:page="pageNo"
                    :page-count="pages"
                    simple
                    @update:page="handlePageChange"
                  />
                  <span>-</span>
                  <!-- 条件输入框 -->
                  <div>
                    <n-input
                      v-model:value="whereSQL"
                      size="small"
                      type="text"
                      placeholder="查询条件"
                      style="width: 700px"
                    />
                    &nbsp;
                    <n-button type="primary" ghost size="small" @click="fetchData(currentNode)"
                      >搜索</n-button
                    >
                  </div>
                </n-flex>
              </n-tab-pane>
              <n-tab-pane v-if="currentNode?.type === 'table'" name="column" tab="表字段">
                <div class="flex flex-col gap-3">
                  <!-- 顶部操作栏 -->
                  <div class="flex justify-between items-center">
                    <n-input
                      v-model:value="columnSearch"
                      size="small"
                      placeholder="搜索字段名或备注..."
                      style="width: 300px"
                      clearable
                    >
                      <template #prefix>
                        <component :is="renderAsyncIcon('SearchOutline')" />
                      </template>
                    </n-input>
                    <n-text depth="3">共 {{ columns.length }} 个字段</n-text>
                  </div>

                  <!-- 字段信息表格 -->
                  <vxe-table
                    border
                    show-overflow="title"
                    height="550"
                    :row-config="{ isHover: true }"
                    :data="filteredColumns"
                  >
                    <!-- 1. 标识列 (主键/自增) -->
                    <vxe-column title="标识" width="80" align="center">
                      <template #default="{ row }">
                        <div class="flex justify-center gap-1">
                          <!-- 主键图标 -->
                          <n-tooltip v-if="primaryKey.includes(row.columnName)" trigger="hover">
                            <template #trigger>
                              <component :is="renderKeyIcon ? renderKeyIcon() : null" />
                            </template>
                            主键字段
                          </n-tooltip>
                          <!-- 自增图标 -->
                          <n-tooltip v-if="row.autoIncrement" trigger="hover">
                            <template #trigger>
                              <component :is="renderFlashIcon ? renderFlashIcon() : null" />
                            </template>
                            自动递增 (Auto Increment)
                          </n-tooltip>
                        </div>
                      </template>
                    </vxe-column>

                    <!-- 2. 字段名 -->
                    <vxe-column field="columnName" title="字段名称" min-width="180" align="center">
                      <template #default="{ row }">
                        {{ row.columnName }}
                      </template>
                    </vxe-column>

                    <!-- 3. 类型 -->
                    <vxe-column field="columnType" title="数据类型" width="180" align="center">
                      <template #default="{ row }">
                        {{ formatFullType(row) }}
                      </template>
                    </vxe-column>

                    <!-- 4. 允许为空 -->
                    <vxe-column field="nullable" title="可为空" width="80" align="center">
                      <template #default="{ row }">
                        <n-text v-if="!row.nullable" type="error" strong>NO</n-text>
                        <n-text v-else depth="3">YES</n-text>
                      </template>
                    </vxe-column>

                    <!-- 5. 备注 -->
                    <vxe-column field="columnComment" title="备注" min-width="250" align="center">
                      <template #default="{ row }">
                        <n-text v-if="row.columnComment" depth="2">{{ row.columnComment }}</n-text>
                        <n-text v-else depth="3" italic>--</n-text>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </n-tab-pane>
              <n-tab-pane v-if="currentNode?.type === 'table'" name="index" tab="索引">
                <div class="flex flex-col gap-3">
                  <!-- 顶部状态信息 -->
                  <div class="flex justify-between items-center">
                    <n-text depth="3">当前表共有 {{ indices.length }} 个索引</n-text>
                    <n-button size="small" type="primary" ghost> 刷新索引 </n-button>
                  </div>

                  <vxe-table
                    border
                    show-overflow="title"
                    height="550"
                    :row-config="{ isHover: true }"
                    :data="indices"
                  >
                    <!-- 1. 索引图标 & 名称 -->
                    <vxe-column field="name" title="索引名称" min-width="200" align="center">
                      <template #default="{ row }">
                        <n-flex justify="center">
                          <component :is="renderIndexIcon ? renderIndexIcon() : null" />
                          <n-text strong style="font-family: monospace">{{ row.name }}</n-text>
                        </n-flex>
                      </template>
                    </vxe-column>

                    <!-- 2. 索引属性 (唯一性) -->
                    <vxe-column field="unique" title="属性" width="120" align="center">
                      <template #default="{ row }">
                        <n-tag v-if="row.unique" size="small" type="success" :bordered="false">
                          <template #icon>
                            <component :is="renderShieldIcon ? renderShieldIcon() : null" />
                          </template>
                          UNIQUE
                        </n-tag>
                        <n-tag v-else size="small" :bordered="false" depth="3"> NORMAL </n-tag>
                      </template>
                    </vxe-column>

                    <!-- 3. 包含的列 -->
                    <vxe-column title="索引包含的列" min-width="400" align="center">
                      <template #default="{ row }">
                        <n-flex :size="4" justify="center">
                          <!-- 遍历索引下的所有列 -->
                          <n-tag
                            v-for="col in row.columns.sort(
                              (a: IndexColumnMeta, b: IndexColumnMeta) => a.position - b.position,
                            )"
                            :key="col.column"
                            :bordered="true"
                          >
                            <n-text depth="1" strong>{{ col.column }}</n-text>
                            <n-text depth="3" style="margin-left: 4px; font-size: 10px">
                              {{ col.order.startsWith('A') ? '↑' : '↓' }}
                            </n-text>
                          </n-tag>
                        </n-flex>
                      </template>
                    </vxe-column>

                    <!-- 4. 快速查看 SQL 语句 -->
                    <vxe-column title="操作" width="100" align="center">
                      <template #default>
                        <n-button text type="primary" size="small"> 查看 DDL </n-button>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </div>
              </n-tab-pane>
              <n-tab-pane v-if="currentNode?.type === 'view'" name="viewSQL" tab="视图SQL">
                视图SQL
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="dsDialogShowStatus = false">退　出</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
:deep(.n-tree-node.is-expanded .n-tree-node-content__text) {
  color: #1890ff;
  font-weight: 600;
}
</style>
