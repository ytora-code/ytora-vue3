<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import ImportModal from '@/components/import-modal/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useCrud from './composable/useCrud'
import useImportExport from './composable/useImportExport'
import useSchema from './composable/useSchema'
import type SysSchedulerTaskData from './type/SysSchedulerTaskData'

/**
 * 表单和表格结构元数据
 */
const { searchFormSchemas, drawerFormSchemas, drawerRules, tableSchemas } = useSchema()

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
  resetSearch,
  pageChange,
  pageSizeChange,
  drawerVisible,
  drawerLoading,
  submitLoading,
  drawerTitle,
  drawerFormRef,
  drawerFormModel,
  openCreateDrawer,
  openEditDrawer,
  closeDrawer,
  handleDrawerAfterLeave,
  submitDrawer,
  deleteLoading,
  deleteRow,
  deleteBatch,
  actionLoadingId,
  handleMoreAction,
} = useCrud()

/**
 * 文件的导入导出
 */
const {
  importDialogVisible,
  importLoading,
  exportLoading,
  templateLoading,
  openImportDialog,
  handleImportDialogAfterLeave,
  downloadTemplate,
  submitImport,
  exportData,
} = useImportExport({
  searchFormModel,
  page,
})

onMounted(async () => {
  await page()
})

const resolveMoreOptions = (row: SysSchedulerTaskData) => {
  const isRunning = row.status === 1

  return [
    {
      label: '执行一次',
      key: 'runOnce',
    },
    {
      label: '启动',
      key: 'start',
      disabled: isRunning,
    },
    {
      label: '关闭',
      key: 'stop',
      disabled: !isRunning,
    },
  ]
}
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
          @submit="search"
          @reset="resetSearch"
        />
      </template>

      <template #toolbar>
        <div class="toolbar-actions">
          <n-button type="success" size="small" ghost @click="openCreateDrawer">新 增</n-button>
          <n-button type="primary" size="small" ghost @click="openImportDialog">导 入</n-button>
          <n-button type="primary" size="small" ghost :loading="exportLoading" @click="exportData">
            导 出
          </n-button>
          <n-button type="error" size="small" ghost :loading="deleteLoading" @click="deleteBatch">
            批量删除
          </n-button>
        </div>
      </template>

      <template #table>
        <DynamicTable
          v-model:data="records"
          v-model:checked-row-keys="checkedRowKeys"
          :schemas="tableSchemas"
          :loading="tableLoading"
          row-key="id"
        >
          <template #action="{ row }">
            <div flex justify-center gap-2>
              <n-button type="primary" ghost size="small" @click="openEditDrawer(row.id)">
                编 辑
              </n-button>
              <n-popconfirm @positive-click="deleteRow(row)">
                <template #trigger>
                  <n-button type="error" ghost size="small" :loading="deleteLoading">
                    删 除
                  </n-button>
                </template>
                确定删除当前数据吗？
              </n-popconfirm>
              <n-dropdown
                trigger="click"
                :options="resolveMoreOptions(row)"
                @select="(key) => handleMoreAction(row, key as 'runOnce' | 'start' | 'stop')"
              >
                <n-button type="success" ghost size="small" :loading="actionLoadingId === row.id">
                  更 多
                </n-button>
              </n-dropdown>
            </div>
          </template>
        </DynamicTable>
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
      title="导入调度任务"
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
