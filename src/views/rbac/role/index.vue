<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { roleApi } from './api/RoleApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import type PageResp from '@/types/resp/PageResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysRoleReq from './type/req/SysRoleReq.ts'
import type SysRole from './type/resp/SysRole.ts'

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
const searchModel = reactive<SysRoleReq>({})

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
const currentModel = ref<SysRoleReq>({})

const tableModel = ref<PageResp<SysRole>>()

const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await roleApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
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

const action = (payload: { eventKey: string; row: SysRole }) => {
  console.log(payload)
  if (payload.eventKey === 'role-table::action::edit') {
    edit(payload.row)
  }
  if (payload.eventKey === 'role-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

const add = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const edit = (row: SysRole) => {
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const doAddOrEdit = () => {
  roleApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      page()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysRole) => {
  await roleApi.remove(row.id)
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
        <n-form-item label="角色名称" path="roleName">
          <n-input placeholder="角色名称" v-model:value="searchModel.roleName" clearable />
        </n-form-item>
        <n-form-item label="角色编码" path="roleCode">
          <n-input placeholder="角色编码" v-model:value="searchModel.roleCode" clearable />
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

    <!--    <n-data-table-->
    <!--      remote-->
    <!--      :loading="tableLoading"-->
    <!--      :columns="columns"-->
    <!--      :data="tableModel?.records"-->
    <!--      :pagination="pagination"-->
    <!--      :single-line="false"-->
    <!--      :scroll-x="1000"-->
    <!--    />-->
    <DynamicTable
      :loading="tableLoading"
      tableCode="role-table"
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
          <n-form-item label="角色名称" path="roleName">
            <n-input placeholder="角色名称" v-model:value="currentModel.roleName" />
          </n-form-item>
          <n-form-item label="角色编码" path="roleCode">
            <n-input placeholder="角色编码" v-model:value="currentModel.roleCode" />
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
