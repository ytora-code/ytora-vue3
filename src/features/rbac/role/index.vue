<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import ImportModal from '@/components/import-modal/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import PermissionDetailModal from './PermissionDetailModal.vue'
import useCrud from './composable/useCrud'
import useImportExport from './composable/useImportExport'
import useRolePermission from './composable/useRolePermission'
import useSchema from './composable/useSchema'

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

const {
  checkedPermissionKeys,
  closePermissionDrawer,
  collapseAllPermissions,
  currentRoleId,
  currentPermission,
  expandAllPermissions,
  handlePermissionCheckedKeysUpdate,
  closePermissionDetail,
  openPermissionDrawer,
  permissionDetailVisible,
  permissionDrawerTitle,
  permissionDrawerVisible,
  permissionExpandedKeys,
  permissionSubmitLoading,
  permissionTreeData,
  permissionTreeLoading,
  renderPermissionLabel,
  renderPermissionPrefix,
  submitRolePermission,
} = useRolePermission()

onMounted(async () => {
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
                编辑
              </n-button>
              <n-button type="success" ghost size="small" @click="openPermissionDrawer(row)">
                资源
              </n-button>
              <n-popconfirm @positive-click="deleteRow(row)">
                <template #trigger>
                  <n-button type="error" ghost size="small" :loading="deleteLoading">删除</n-button>
                </template>
                确定删除当前数据吗？
              </n-popconfirm>
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
      title="导入角色"
      :import-loading="importLoading"
      :template-loading="templateLoading"
      :download-template="downloadTemplate"
      :submit-import="submitImport"
      @after-leave="handleImportDialogAfterLeave"
    />

    <!-- 资源弹框 -->
    <n-drawer v-model:show="permissionDrawerVisible" :width="520" placement="right">
      <n-drawer-content :title="permissionDrawerTitle" closable>
        <div class="permission-drawer">
          <div class="permission-drawer__toolbar">
            <div class="permission-drawer__toolbar-actions">
              <n-button size="small" @click="expandAllPermissions">展开全部</n-button>
              <n-button size="small" @click="collapseAllPermissions">收起全部</n-button>
            </div>
          </div>

          <n-spin :show="permissionTreeLoading">
            <n-scrollbar class="permission-drawer__scrollbar">
              <n-tree
                v-model:expanded-keys="permissionExpandedKeys"
                :data="permissionTreeData"
                :checked-keys="checkedPermissionKeys"
                :render-prefix="renderPermissionPrefix"
                :render-label="renderPermissionLabel"
                block-line
                checkable
                check-on-click
                key-field="key"
                label-field="label"
                children-field="children"
                show-line
                @update:checked-keys="handlePermissionCheckedKeysUpdate"
              />
            </n-scrollbar>
          </n-spin>
        </div>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="closePermissionDrawer">取 消</n-button>
            <n-button
              type="primary"
              :loading="permissionSubmitLoading"
              @click="submitRolePermission"
            >
              保 存
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <PermissionDetailModal
      v-model:show="permissionDetailVisible"
      :role-id="currentRoleId"
      :permission="currentPermission"
      @update:show="(value) => !value && closePermissionDetail()"
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

.permission-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.permission-drawer__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 82%, transparent);
  border-radius: var(--global-border-radius);
  background: color-mix(in srgb, var(--global-fill-color) 24%, var(--global-bg-container));
}

.permission-drawer__summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.permission-drawer__summary-label {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.permission-drawer__summary-value {
  color: var(--global-text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  word-break: break-all;
}

.permission-drawer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.permission-drawer__toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-drawer__scrollbar {
  max-height: calc(100vh - 260px);
}

:deep(.role-permission-tree__label) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

:deep(.role-permission-tree__name) {
  color: var(--global-text-color);
  min-width: 0;
  flex: 1;
}

:deep(.role-permission-tree__meta) {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

:deep(.role-permission-tree__detail-button) {
  flex-shrink: 0;
}
</style>
