<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { departApi } from './api/DepartApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysDepartReq from './type/req/SysDepartReq.ts'
import type SysDepart from './type/resp/SysDepartResp.ts'

/**
 * search表单数据
 */
const searchModel = reactive<SysDepartReq>({})

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
const currentModel = ref<SysDepartReq>({})

const tableModel = ref<Array<SysDepart>>([])

const tree = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await departApi.tree(searchModel.departName)
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  resetDefault(searchModel)
  tree()
}

const action = (payload: { eventKey: string; row: SysDepart }) => {
  console.log(payload)
  if (payload.eventKey === 'depart-table::action::addSub') {
    openAddSubDraw(payload.row)
  }
  if (payload.eventKey === 'depart-table::action::edit') {
    openEditDraw(payload.row)
  }
  if (payload.eventKey === 'depart-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

// Draw状态，1：新增，2：添加下级，3：编辑
let drawStatus: 1 | 2 | 3

const openAddDraw = () => {
  drawStatus = 1
  resetDefault(currentModel.value)
  currentModel.value.pid = '0'
  drawShowStatus.value = true
}

const openAddSubDraw = (row: SysDepart) => {
  drawStatus = 2
  resetDefault(currentModel.value)
  currentModel.value.pid = row.id
  currentModel.value.departCode = '自动产生'
  drawShowStatus.value = true
}

const openEditDraw = (row: SysDepart) => {
  drawStatus = 3
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const doAddOrEdit = () => {
  if (drawStatus === 2) {
    currentModel.value.departCode = undefined
  }
  if (!currentModel.value.status) {
    currentModel.value.status = 2
  }
  departApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      tree()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysDepart) => {
  await departApi.remove(row.id)
  await tree()
}

const options = [
  {
    label: '公司',
    value: '1',
  },
  {
    label: '部门',
    value: '2',
  },
  {
    label: '小组',
    value: '3',
  },
]

function railStyle({ focused, checked }: { focused: boolean; checked: boolean }) {
  const style: CSSProperties = {}
  if (!checked) {
    style.background = '#d03050'
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040'
    }
  } else {
    style.background = '#2080f0'
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040'
    }
  }
  return style
}

onMounted(() => {
  tree()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="部门名称" path="departName">
          <n-input placeholder="部门名称" v-model:value="searchModel.departName" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="tree">
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
      <n-button type="error" size="small" ghost :render-icon="renderAsyncIcon('TrashOutline')">
        回收站
      </n-button>
    </div>

    <DynamicTable
      :loading="tableLoading"
      tableCode="depart-table"
      :data="tableModel"
      @onAction="action"
      :single-line="false"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ drawStatus === 1 ? '新增' : drawStatus === 2 ? '添加下级' : '编辑' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="部门名称" path="departName">
            <n-input placeholder="部门名称" v-model:value="currentModel.departName" clearable />
          </n-form-item>
          <n-form-item label="部门编码" path="departCode">
            <n-input placeholder="部门编码" v-model:value="currentModel.departCode" :disabled="drawStatus !== 1" />
          </n-form-item>
          <n-form-item label="部门类型" path="type">
            <n-select
              placeholder="部门类型"
              v-model:value="currentModel.type"
              :options="options"
              clearable
            />
          </n-form-item>
          <n-form-item label="部门联系人" path="contactUserName">
            <n-input
              placeholder="部门联系人"
              v-model:value="currentModel.contactUserName"
              clearable
            />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch
              checked-value="1"
              unchecked-value="2"
              v-model:value="currentModel.status"
              :rail-style="railStyle"
            >
              <template #checked>正常</template>
              <template #unchecked>停用</template>
            </n-switch>
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input
              type="textarea"
              placeholder="备注"
              v-model:value="currentModel.remark"
              clearable
            />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="drawShowStatus = false">退　出</n-button>
            <n-button type="primary" @click="doAddOrEdit">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped></style>
