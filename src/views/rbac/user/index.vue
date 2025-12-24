<script setup lang="ts">
import { onMounted } from 'vue'
import { userApi } from './api/UserApi.ts'
import { type DataTableColumns, type PaginationInfo } from 'naive-ui'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'

const page = ref<PageResp<SysUserResp>>()

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
  page: page.value?.pageNo || 1,
  pageSize: page.value?.pageSize || 10,
  itemCount: page.value?.total || 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: (info: PaginationInfo) => {
    return `共 ${info.itemCount} 条记录 / 共 ${page.value?.pages || 0} 页`
  },
  showQuickJumper: true,
  // 当用户点击页码切换时触发
  onChange: (p: number) => {
    console.log(p)
  },
  // 当用户切换每页显示数量时触发
  onUpdatePageSize: (size: number) => {
    console.log(size)
  }
}))

const page1 = async () => {
  page.value = await userApi.page()
}

onMounted(() => {
  page1()
})

</script>

<template>
  <div>
    <n-data-table
      remote
      :columns="columns"
      :data="page?.records"
      :pagination="pagination"
      :bordered="false"
      :single-line="false"
    />
  </div>
</template>

<style scoped></style>
