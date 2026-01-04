<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { permissionApi } from './api/PermissionApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysPermissionReq from './type/req/SysPermissionReq.ts'
import type SysPermission from './type/resp/SysPermission.ts'

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
    tableModel.value = await permissionApi.list({ ...toRaw(searchModel) })
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
    edit(payload.row)
  }
  // 编辑
  if (payload.eventKey === 'permission-table::action::edit') {
    edit(payload.row)
  }
  // 删除
  if (payload.eventKey === 'permission-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

const add = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const edit = (row: SysPermission) => {
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
      tableCode="permission-table"
      :data="tableModel"
      @onAction="action"
      @load="loadChild"
      :single-line="false"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <!--        <n-form :model="currentModel" label-placement="left" :label-width="100">-->
        <!--          <n-form-item label="资源名称" path="permissionName">-->
        <!--            <n-input placeholder="资源名称" v-model:value="currentModel.permissionName" />-->
        <!--          </n-form-item>-->
        <!--          <n-form-item label="资源编码" path="permissionCode">-->
        <!--            <n-input placeholder="资源编码" v-model:value="currentModel.permissionCode" />-->
        <!--          </n-form-item>-->
        <!--          <n-form-item label="备注" path="remark">-->
        <!--            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />-->
        <!--          </n-form-item>-->
        <!--        </n-form>-->

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
