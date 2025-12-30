<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { roleApi } from './api/RoleApi.ts'
import {
  type DataTableColumns,
  NButton,
  NFlex,
  NPopconfirm,
  NTag,
  type PaginationInfo,
} from 'naive-ui'
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

const columns: DataTableColumns<SysRole> = [
  {
    title: '序号',
    key: 'index',
    align: 'center',
    width: 70,
    fixed: 'left',
    render: (_row, index) => {
      const pageNo = tableModel.value?.pageNo ?? pageModel.pageNo ?? 1
      const pageSize = tableModel.value?.pageSize ?? pageModel.pageSize ?? 10
      return (pageNo - 1) * pageSize + index + 1
    },
  },
  { title: '角色名称', key: 'roleName', align: 'center', width: 100, ellipsis: { tooltip: true } },
  { title: '角色编码', key: 'roleCode', align: 'center', width: 100, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    width: 80,
    render(row) {
      const isNormal = row.status === '1'
      return h(
        NTag,
        { type: isNormal ? 'success' : 'error' },
        { default: () => (isNormal ? '正常' : '冻结') },
      )
    },
  },
  { title: '备注', key: 'remark', align: 'center', width: 140, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render(row) {
      return h(
        NFlex,
        { size: 8, justify: 'center', wrap: false },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', type: 'primary', ghost: true, onClick: () => edit(row) },
              { default: () => '资源' },
            ),
            h(
              NButton,
              { size: 'small', type: 'success', ghost: true, onClick: () => edit(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => del(row),
                negativeText: '取消',
                positiveText: '确定',
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    { size: 'small', type: 'error', ghost: true },
                    { default: () => '删除' },
                  ),
                default: () => `确定删除角色「${row.roleCode}」吗？`,
              },
            ),
          ],
        },
      )
    },
  },
]

const pagination = computed(() => ({
  page: tableModel.value?.pageNo || 1,
  pageSize: tableModel.value?.pageSize || 10,
  itemCount: tableModel.value?.total || 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: PaginationInfo) => {
    return `共 ${info.itemCount} 条记录 / 共 ${tableModel.value?.pages || 0} 页`
  },
  showQuickJumper: true,
  // 当用户点击页码切换时触发
  onChange: (p: number) => {
    pageModel.pageNo = p
    page()
  },
  // 当用户切换每页显示数量时触发
  onUpdatePageSize: (size: number) => {
    pageModel.pageSize = size
    page()
  },
}))

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

onMounted(() => {
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="角色名称" path="roleName">
          <n-input placeholder="角色名称" v-model:value="searchModel.roleName" />
        </n-form-item>
        <n-form-item label="角色编码" path="roleCode">
          <n-input placeholder="角色编码" v-model:value="searchModel.roleCode" />
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
      <n-button type="primary" size="small" ghost :render-icon="renderAsyncIcon('DownloadOutline')">
        导出
      </n-button>
    </div>

    <n-data-table
      remote
      :loading="tableLoading"
      :columns="columns"
      :data="tableModel?.records"
      :pagination="pagination"
      :single-line="false"
      :scroll-x="1000"
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
            <n-switch checked-value="1" unchecked-value="2" v-model:value="currentModel.status">
              <template #checked> 正常</template>
              <template #unchecked> 冻结</template>
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
