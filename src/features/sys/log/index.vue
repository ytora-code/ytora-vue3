<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import ImportModal from '@/components/import-modal/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useCrud from './composable/useCrud'
import useImportExport from './composable/useImportExport'
import useSchema from './composable/useSchema'
import type { SysLogType } from './composable/useSchema'

/**
 * 表单和表格结构元数据
 */
const {
  searchFormSchemas,
  drawerFormSchemas,
  drawerRules,
  normalLogTableSchemas,
  requestLogTableSchemas,
  loginLogTableSchemas,
  scheduleTaskLogTableSchemas,
  errorLogTableSchemas,
} = useSchema()

const logTypeTabs: Array<{ label: string; value: SysLogType }> = [
  { label: '普通日志', value: 'NORMAL_LOG' },
  { label: '请求日志', value: 'REQUEST_LOG' },
  { label: '登录日志', value: 'LOGIN_LOG' },
  { label: '定时任务日志', value: 'SCHEDULE_TASK_LOG' },
  { label: '错误日志', value: 'ERROR_LOG' },
]

/**
 * CRUD逻辑
 */
const {
  searchFormModel,
  pageNo,
  pageSize,
  total,
  records,
  tableLoading,
  checkedRowKeys,
  page,
  search,
  setSearchType,
  resetSearch,
  pageChange,
  pageSizeChange,
  drawerVisible,
  drawerLoading,
  submitLoading,
  drawerTitle,
  drawerFormRef,
  drawerFormModel,
  closeDrawer,
  handleDrawerAfterLeave,
  submitDrawer,
} = useCrud()

const activeLogType = ref<SysLogType>('NORMAL_LOG')

const tableSchemasMap: Record<SysLogType, typeof normalLogTableSchemas> = {
  NORMAL_LOG: normalLogTableSchemas,
  REQUEST_LOG: requestLogTableSchemas,
  LOGIN_LOG: loginLogTableSchemas,
  SCHEDULE_TASK_LOG: scheduleTaskLogTableSchemas,
  ERROR_LOG: errorLogTableSchemas,
}

const handleSearch = async () => {
  setSearchType(activeLogType.value)
  await search()
}

const handleResetSearch = async () => {
  await resetSearch(activeLogType.value)
}

const handleLogTypeChange = async (value: string) => {
  activeLogType.value = value as SysLogType
  checkedRowKeys.value = []
  await resetSearch(activeLogType.value)
}

/**
 * 文件的导入导出
 */
const {
  importDialogVisible,
  importLoading,
  templateLoading,
  handleImportDialogAfterLeave,
  downloadTemplate,
  submitImport,
} = useImportExport({
  searchFormModel,
  page,
})

onMounted(async () => {
  setSearchType(activeLogType.value)
  await page()
})
</script>

<template>
  <div>
    <PageLayout>
      <template #search>
        <DynamicForm
          v-model="searchFormModel"
          :schemas="searchFormSchemas"
          submit-text="搜 索"
          submit-icon="i-lucide-search"
          reset-text="重 置"
          reset-icon="i-lucide-rotate-ccw"
          action-placement="inline"
          :show-feedback="false"
          @submit="handleSearch"
          @reset="handleResetSearch"
        />
      </template>

      <template #table>
        <n-tabs :value="activeLogType" type="line" animated @update:value="handleLogTypeChange">
          <n-tab-pane
            v-for="item in logTypeTabs"
            :key="item.value"
            :name="item.value"
            :tab="item.label"
          >
            <DynamicTable
              v-model:data="records"
              v-model:checked-row-keys="checkedRowKeys"
              :schemas="tableSchemasMap[item.value]"
              :loading="tableLoading"
              row-key="id"
            />
          </n-tab-pane>
        </n-tabs>
      </template>

      <template #pagination>
        <div class="pagination-bar">
          <n-pagination
            :page="pageNo"
            :page-size="pageSize"
            :item-count="total"
            :page-sizes="[10, 20, 30, 50]"
            :prefix="({ itemCount }) => '共 ' + (itemCount ?? 0) + ' 条'"
            show-size-picker
            show-quick-jumper
            @update:page="pageChange"
            @update:page-size="pageSizeChange"
          />
        </div>
      </template>
    </PageLayout>

    <n-drawer
      v-model:show="drawerVisible"
      :width="520"
      placement="right"
      @after-leave="handleDrawerAfterLeave"
    >
      <n-drawer-content :title="drawerTitle" closable>
        <n-spin :show="drawerLoading">
          <DynamicForm
            ref="drawerFormRef"
            v-model="drawerFormModel"
            :schemas="drawerFormSchemas"
            :rules="drawerRules"
            :show-action-row="false"
          />
        </n-spin>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="closeDrawer">取 消</n-button>
            <n-button type="primary" :loading="submitLoading" @click="submitDrawer">保 存</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <ImportModal
      v-model:show="importDialogVisible"
      title="导入日志"
      :import-loading="importLoading"
      :template-loading="templateLoading"
      :download-template="downloadTemplate"
      :submit-import="submitImport"
      @after-leave="handleImportDialogAfterLeave"
    />
  </div>
</template>

<style scoped>
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
