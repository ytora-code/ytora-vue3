<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { permissionApi } from './api/PermissionApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysPermissionReq from './type/req/SysPermissionReq.ts'
import type SysPermission from './type/resp/SysPermission.ts'
import RecycleBin from '@/views/sys/recyclebin/index.vue'

/**
 * 数据库表名称
 */
const tableName = 'sys_permission'
/**
 * 数据库表CODE
 */
const tableCode = 'permission-table'

/**
 * search表单数据
 */
const searchModel = reactive<SysPermissionReq>({})

/**
 * 表格数据
 */
const tableLoading = ref(false)

/**
 * 抽屉显示状态
 */
const drawShowStatus = ref(false)

/**
 * 新增或编辑时的数据
 */
const currentModel = ref<SysPermissionReq>({})

const tableModel = ref<Array<SysPermission>>([])

const list = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await permissionApi.tree({ ...toRaw(searchModel) })
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  resetDefault(searchModel)
  list()
}

const action = (payload: { eventKey: string; row: SysPermission }) => {
  console.log(payload)
  // 添加下级
  if (payload.eventKey === 'permission-table::action::add-sub') {
    openAddSubDraw(payload.row)
  }
  // 编辑
  if (payload.eventKey === 'permission-table::action::edit') {
    openEditDraw(payload.row)
  }
  // 删除
  if (payload.eventKey === 'permission-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

// Draw状态，1：新增，2：添加下级，3：编辑
let drawStatus: 1 | 2 | 3

const openAddDraw = () => {
  drawStatus = 1
  resetDefault(currentModel.value)

  currentModel.value.visible = true
  currentModel.value.pid = "0"
  drawShowStatus.value = true
}

const openAddSubDraw = (row: SysPermission) => {
  drawStatus = 2
  const meta = currentModel.value.meta
  resetDefault(currentModel.value)
  if (row.permissionType === 3) {
    currentModel.value.meta = meta
  } else {
    currentModel.value.meta = undefined
  }
  currentModel.value.visible = true
  currentModel.value.pname = row.permissionName
  currentModel.value.pid = row.id
  drawShowStatus.value = true
}

const openEditDraw = (row: SysPermission) => {
  drawStatus = 3
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const loadChild = (row: Record<string, unknown>) => {
  console.log(row)
}

const doAddOrEdit = () => {
  permissionApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      list()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysPermission) => {
  await permissionApi.remove(row.id)
  await list()
}

const options = [
  {
    label: '接口',
    value: '1'
  },
  {
    label: '页面',
    value: '2'
  },
  {
    label: '页面元素',
    value: '3'
  }
]

const componentType = [
  {
    label: '表格列-索引',
    value: 'table-col::index'
  },
  {
    label: '表格列-普通文本',
    value: 'table-col::normal'
  },
  {
    label: '表格列-按钮',
    value: 'table-col::button'
  },
  {
    label: '表格列-二次确认按钮',
    value: 'table-col::popconfirm'
  },
  {
    label: '表格列-标签',
    value: 'table-col::tag'
  },
  {
    label: '表格列-图标',
    value: 'table-col::icon'
  },
  {
    label: '表格列-插槽',
    value: 'table-col::slot'
  },
  {
    label: '表格列-组件',
    value: 'table-col::flex'
  }
]

// 元数据里面的attr列表
const attrList = ref<{ key: string, value: string }[]>([])
const addAttrRow = (index?: number) => {
  const newItem = { key: '', value: '' }

  if (index === undefined) {
    attrList.value.push(newItem)
  } else {
    attrList.value.splice(index + 1, 0, newItem)
  }
}

const removeAttrRow = (index: number) => {
  attrList.value.splice(index, 1)
}
// 当 meta.attr 存在时 → 初始化 attrList
watch(
  () => currentModel.value.meta,
  meta => {
    if (meta?.attr) {
      attrList.value = Object.entries(meta.attr).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    } else {
      attrList.value = []
    }
  },
  { immediate: true }
)

const recycleBinShowStatus = ref(false)

// attrList 变化时 → 回写 meta.attr
watch(
  attrList,
  (list) => {
    if (!currentModel.value.meta) return
    currentModel.value.meta.attr = list
      .filter(item => item.key)
      .reduce<Record<string, string>>((acc, cur) => {
        acc[cur.key] = cur.value
        return acc
      }, {})
  },
  { deep: true }
)

onMounted(() => {
  list()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="资源编码" path="permissionCode">
          <n-input placeholder="资源编码" v-model:value="searchModel.permissionCode" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="list()">
          搜索
        </n-button>
        <n-button type="primary" ghost :render-icon="renderAsyncIcon('SyncOutline')" @click="reset">
          重置
        </n-button>
      </n-form>
    </div>

    <div flex gap-x="3px">
      <n-button
        type="success"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('AddOutline')"
        @click="openAddDraw"
      >
        新增
      </n-button>
      <n-button
        type="primary"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('CloudUploadOutline')"
      >导入
      </n-button>
      <n-button
        type="primary"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('CloudDownloadOutline')"
      >
        导出
      </n-button>
      <n-button type="error" size="small" ghost :render-icon="renderAsyncIcon('TrashOutline')"
                @click="recycleBinShowStatus = true">
        回收站
      </n-button>
    </div>

    <DynamicTable
      :loading="tableLoading"
      :tableCode="tableCode"
      :data="tableModel"
      @onAction="action"
      @load="loadChild"
      :single-line="false"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ drawStatus === 1 ? '新增' : drawStatus === 2 ? '添加下级' : '编辑' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item v-if="drawStatus === 2" label="父资源名称" path="pname">
            <n-input placeholder="-" :value="currentModel.pname" disabled />
          </n-form-item>
          <n-form-item label="资源名称" path="permissionName">
            <n-input placeholder="资源名称" v-model:value="currentModel.permissionName" />
          </n-form-item>
          <n-form-item label="资源编码" path="permissionCode">
            <n-input placeholder="资源编码" v-model:value="currentModel.permissionCode" />
          </n-form-item>
          <n-form-item label="资源类型" path="permissionType">
            <n-select
              placeholder="资源类型"
              v-model:value="currentModel.permissionType"
              :options="options"
              clearable
            />
          </n-form-item>
          <n-form-item label="图标" path="icon">
            <n-input placeholder="图标" v-model:value="currentModel.icon" />
          </n-form-item>
          <n-form-item label="是否可见" path="visible">
            <n-switch v-model:value="currentModel.visible">
              <template #checked>正常</template>
              <template #unchecked>隐藏</template>
            </n-switch>
          </n-form-item>
          <n-form-item label="排序" path="index">
            <n-input-number placeholder="排序" v-model:value="currentModel.index" clearable />
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />
          </n-form-item>
          <n-form-item v-if="!currentModel.meta" label=" ">
            <n-button size="small" type="primary" :render-icon="renderAsyncIcon('Add')" ghost
                      @click="currentModel.meta = {}">
              添加元数据
            </n-button>
          </n-form-item>
          <div v-if="currentModel.meta">
            <n-divider />
            <!-- 元数据，type、key、width三个基本字段，以及对应的attr对象字段，attr里面可以有任意字段，这些字段都会作为组件的属性 -->
            <n-form-item label="组件类型" path="meta.type">
              <n-select
                placeholder="组件类型"
                v-model:value="currentModel.meta.type"
                :options="componentType"
                clearable
              />
            </n-form-item>
            <n-form-item label="组件key" path="meta.key">
              <n-input placeholder="组件key" v-model:value="currentModel.meta.key" clearable />
            </n-form-item>
            <n-form-item label="宽度" path="meta.width">
              <n-input-number placeholder="宽度" v-model:value="currentModel.meta.width"
                              clearable />
            </n-form-item>
            <!-- attr 属性是灵活的，可以有很多自定义属性 -->
            <n-form-item label="属性" path="meta.attr">
              <div flex="~ col gap-2" w="100%">
                <div
                  v-for="(item, index) in attrList"
                  :key="index"
                  flex="~ gap-2"
                  items-center
                >
                  <!-- key -->
                  <n-input placeholder="属性名" v-model:value="item.key" style="width: 35%" />

                  <!-- value -->
                  <n-input placeholder="属性值" v-model:value="item.value" style="width: 45%" />

                  <!-- 操作按钮 -->
                  <div flex="~ gap-1">
                    <n-button size="small" tertiary type="primary" @click="addAttrRow(index)"> +
                    </n-button>

                    <n-button size="small" tertiary type="error" @click="removeAttrRow(index)"
                              :disabled="attrList.length === 1">
                      −
                    </n-button>
                  </div>
                </div>

                <!-- 没有任何属性时 -->
                <n-button v-if="attrList.length === 0" size="small" dashed @click="addAttrRow()">
                  添加属性
                </n-button>
              </div>
            </n-form-item>

            <n-form-item label=" ">
              <n-button size="small" type="error" :render-icon="renderAsyncIcon('Add')" ghost
                        @click="currentModel.meta = undefined">
                取消元数据
              </n-button>
            </n-form-item>
          </div>

          <div v-if="currentModel.meta?.type === 'table'">
            <n-divider />
            <n-form-item label=" ">
              <n-button size="small" type="success" :render-icon="renderAsyncIcon('Add')" ghost>
                数据权限
              </n-button>
            </n-form-item>
          </div>
        </n-form>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="drawShowStatus = false">退　出</n-button>
            <n-button type="primary" @click="doAddOrEdit">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 回收站弹出框 -->
    <n-modal
      w="[70%]"
      min-w="[500px]"
      v-model:show="recycleBinShowStatus"
      preset="card"
      title="回收站"
      flex-height
      draggable
    >
      <RecycleBin :table-name="tableName" :table-code="tableCode" @restore="list" />
    </n-modal>
  </div>
</template>

<style scoped></style>
