<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { departApi } from './api/DepartApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import type PageResp from '@/types/resp/PageResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysDepartReq from './type/req/SysDepartReq.ts'
import type SysDepart from './type/resp/SysDepartResp.ts'

/**
 * 分页数据
 */
const pageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10,
})

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

const tableModel = ref<PageResp<SysDepart>>()

const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await departApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
    pageModel.pageNo = tableModel.value.pageNo
    pageModel.pageSize = tableModel.value.pageSize
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  resetDefault(searchModel)
  page()
}

const pageChange = (pageNo: number, pageSize: number) => {
  if (tableModel.value) {
    tableModel.value.pageNo = pageNo
    tableModel.value.pageSize = pageSize
  }
  pageModel.pageNo = pageNo
  pageModel.pageSize = pageSize
  page()
}

const action = (payload: { eventKey: string; row: SysDepart }) => {
  console.log(payload)
  if (payload.eventKey === 'depart-table::action::edit') {
    edit(payload.row)
  }
  if (payload.eventKey === 'depart-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

const add = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const edit = (row: SysDepart) => {
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const doAddOrEdit = () => {
  departApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      page()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysDepart) => {
  await departApi.remove(row.id)
  await page()
}

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
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="部门名称" path="departName">
          <n-input placeholder="部门名称" v-model:value="searchModel.departName" clearable />
        </n-form-item>
        <n-form-item label="部门编码" path="departCode">
          <n-input placeholder="部门编码" v-model:value="searchModel.departCode" clearable />
        </n-form-item>
        <n-form-item label="部门类型" path="type">
          <n-input placeholder="部门类型" v-model:value="searchModel.type" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="page">
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
        @click="add"
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
      :data="tableModel?.records"
      :page-no="tableModel?.pageNo"
      :page-size="tableModel?.pageSize"
      :total="tableModel?.total"
      @pageChange="pageChange"
      @onAction="action"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="部门名称" path="departName">
            <n-input placeholder="部门名称" v-model:value="currentModel.departName" />
          </n-form-item>
          <n-form-item label="部门编码" path="departCode">
            <n-input placeholder="部门编码" v-model:value="currentModel.departCode" />
          </n-form-item>
          <n-form-item label="部门类型" path="type">
            <n-input placeholder="部门类型" v-model:value="searchModel.type" clearable />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch
              checked-value="1"
              unchecked-value="2"
              v-model:value="currentModel.status"
              :rail-style="railStyle"
            >
              <template #checked>正常</template>
              <template #unchecked>禁用</template>
            </n-switch>
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />
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
