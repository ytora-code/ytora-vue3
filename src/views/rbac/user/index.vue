<script setup lang="ts">
import { onMounted } from 'vue'
import { userApi } from './api/UserApi.ts'
import { type DataTableColumns, type PaginationInfo } from 'naive-ui'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import type SysUserReq from '@/views/rbac/user/type/req/SysUserReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'

/**
 * 分页数据
 */
const pageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10
})

/**
 * search表单数据
 */
const searchModel = reactive<SysUserReq>({})

/**
 * 表格数据
 */
const tableLoading = ref(false)

const tableModel = ref<PageResp<SysUserResp>>()

const columns: DataTableColumns<SysUserResp> = [
  { title: '用户名', key: 'userName' },
  { title: '真实姓名', key: 'realName' },
  { title: '密码', key: 'password' },
  { title: '电话', key: 'phone' },
  { title: '邮箱', key: 'email' },
  { title: '生日', key: 'birthday' },
  { title: '证件号', key: 'idCard' }
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
  }
}))

const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await userApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
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

onMounted(() => {
  page()
})

</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="用户名" path="userName">
          <n-input placeholder="用户名" v-model:value="searchModel.userName" />
        </n-form-item>
        <n-form-item label="真实姓名" path="realName">
          <n-input placeholder="真实姓名" v-model:value="searchModel.realName" />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input placeholder="电话" v-model:value="searchModel.phone" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-input placeholder="状态" v-model:value="searchModel.status" />
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
      <n-button type="success" size="small" ghost :render-icon="renderAsyncIcon('AddOutline')">
        新增
      </n-button>
      <n-button type="primary" size="small" ghost
                :render-icon="renderAsyncIcon('CloudUploadOutline')">导入
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
    />
  </div>
</template>

<style scoped></style>
