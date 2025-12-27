<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { userApi } from './api/UserApi.ts'
import {
  type DataTableColumns,
  NButton,
  NFlex,
  NPopconfirm,
  NTag,
  type PaginationInfo,
  type UploadCustomRequestOptions
} from 'naive-ui'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import type SysUserReq from '@/views/rbac/user/type/req/SysUserReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import { getDefaultAvatar } from '@/utils/image.ts'

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
const searchModel = reactive<SysUserReq>({})

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
const currentModel = ref<SysUserReq>({})

const tableModel = ref<PageResp<SysUserResp>>()

const columns: DataTableColumns<SysUserResp> = [
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
  { title: '用户名', key: 'userName', align: 'center', width: 150, ellipsis: { tooltip: true } },
  { title: '真实姓名', key: 'realName', align: 'center', width: 150, ellipsis: { tooltip: true } },
  { title: '电话', key: 'phone', align: 'center', width: 200, ellipsis: { tooltip: true } },
  { title: '邮箱', key: 'email', align: 'center', width: 200, ellipsis: { tooltip: true } },
  { title: '生日', key: 'birthday', align: 'center', width: 180, ellipsis: { tooltip: true } },
  { title: '证件号', key: 'idCard', align: 'center', width: 200, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    width: 100,
    render(row) {
      const isNormal = row.status === '1'
      return h(
        NTag,
        { type: isNormal ? 'success' : 'error' },
        { default: () => (isNormal ? '正常' : '冻结') },
      )
    },
  },
  { title: '备注', key: 'remark', align: 'center', width: 200, ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 220,
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
              { default: () => '角色' },
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
                default: () => `确定删除用户「${row.userName}」吗？`,
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

const add = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const edit = (row: SysUserResp) => {
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const del = (row: SysUserResp) => {
  console.log(row)
}

const uploading = ref(false)

const handleCustomUpload = async ({
  file,
  onFinish,
  onError,
  onProgress,
}: UploadCustomRequestOptions) => {
  uploading.value = true
  if (!file.file) return
  const formData = new FormData()
  formData.append('file', file.file)
  try {
    console.log(file)
    onFinish()
  } catch (err) {
    console.log(err)
    onError()
  } finally {
    uploading.value = false
  }
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
      :scroll-x="1800"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="头像" path="avatar" style="align-items: center">
            <n-flex w="[100%]" h="[120px]" align="center" inline>
              <n-image
                height="120px"
                object-fit="contain"
                :src="currentModel.avatar || getDefaultAvatar()"
              />
              <n-upload
                :show-file-list="false"
                accept="image/*"
                w-auto
                :custom-request="handleCustomUpload"
              >
                <n-button type="primary" ghost :loading="uploading">更换头像</n-button>
              </n-upload>
            </n-flex>
          </n-form-item>
          <n-form-item label="用户名" path="userName">
            <n-input placeholder="用户名" v-model:value="currentModel.userName" />
          </n-form-item>
          <n-form-item label="真实姓名" path="realName">
            <n-input placeholder="真实姓名" v-model:value="currentModel.realName" />
          </n-form-item>
          <n-form-item label="电话" path="phone">
            <n-input placeholder="电话" v-model:value="currentModel.phone" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input placeholder="邮箱" v-model:value="currentModel.email" />
          </n-form-item>
          <n-form-item label="生日" path="birthday">
            <n-input placeholder="生日" v-model:value="currentModel.birthday" />
          </n-form-item>
          <n-form-item label="证件号" path="idCard">
            <n-input placeholder="证件号" v-model:value="currentModel.idCard" />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch checked-value="1" unchecked-value="2" v-model:value="currentModel.status">
              <template #checked> 正常 </template>
              <template #unchecked> 冻结 </template>
            </n-switch>
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="drawShowStatus = false">退　出</n-button>
            <n-button type="primary">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped></style>
