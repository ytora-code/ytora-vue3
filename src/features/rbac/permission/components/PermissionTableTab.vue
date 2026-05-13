<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import usePermissionTable from '../composable/usePermissionTable'

const {
  permissionId,
  tableLoading,
  tableRecords,
  tablePageNo,
  tablePageSize,
  tableTotal,
  checkedTableKeys,
  tableModalVisible,
  tableModalLoading,
  tableSubmitLoading,
  tableFormRef,
  tableFormModel,
  schemaDrawerVisible,
  schemaDrawerLoading,
  schemaRecords,
  checkedSchemaKeys,
  schemaModalVisible,
  schemaModalLoading,
  schemaSubmitLoading,
  schemaFormRef,
  schemaFormModel,
  tableRules,
  schemaRules,
  tableModalTitle,
  schemaDrawerTitle,
  schemaModalTitle,
  tableTableSchemas,
  schemaTableSchemas,
  tableFormSchemas,
  schemaFormSchemas,
  handleTablePageChange,
  handleTablePageSizeChange,
  openCreateTable,
  openEditTable,
  closeTableModal,
  submitTable,
  handleDeleteTable,
  handleBatchDeleteTables,
  openSchemaDrawer,
  closeSchemaDrawer,
  openCreateSchema,
  openEditSchema,
  closeSchemaModal,
  submitSchema,
  handleDeleteSchema,
  handleBatchDeleteSchemas,
} = usePermissionTable()
</script>

<template>
  <div v-if="!permissionId" class="permission-page__empty-tab">
    <n-empty description="请先选择资源，再管理对应的表格资源" />
  </div>

  <div v-else class="permission-table">
    <div class="permission-table__toolbar">
      <n-button type="success" size="small" ghost @click="openCreateTable">新 增</n-button>
      <n-button type="error" size="small" ghost @click="handleBatchDeleteTables">
        批量删除
      </n-button>
    </div>

    <DynamicTable
      v-model:checked-row-keys="checkedTableKeys"
      :data="tableRecords"
      :schemas="tableTableSchemas"
      :loading="tableLoading"
      row-key="id"
      empty-description="当前资源暂无表格资源"
    >
      <template #action="{ row }">
        <div class="permission-table__table-actions">
          <n-button type="primary" ghost size="small" @click="openEditTable(row.id)">编辑</n-button>
          <n-button type="success" ghost size="small" @click="openSchemaDrawer(row)">
            字段列
          </n-button>
          <n-button type="error" ghost size="small" @click="handleDeleteTable(row.id)">
            删除
          </n-button>
        </div>
      </template>
    </DynamicTable>

    <div class="permission-table__pagination">
      <n-pagination
        :page="tablePageNo"
        :page-size="tablePageSize"
        :item-count="tableTotal"
        :page-sizes="[10, 20, 30, 50]"
        :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
        show-size-picker
        show-quick-jumper
        @update:page="handleTablePageChange"
        @update:page-size="handleTablePageSizeChange"
      />
    </div>

    <n-modal
      v-model:show="tableModalVisible"
      preset="card"
      :title="tableModalTitle"
      :style="{ width: 'min(680px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="tableModalLoading">
        <DynamicForm
          ref="tableFormRef"
          v-model="tableFormModel"
          :schemas="tableFormSchemas"
          :rules="tableRules"
          label-position="top"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="permission-table__footer">
          <n-button @click="closeTableModal">取 消</n-button>
          <n-button type="primary" :loading="tableSubmitLoading" @click="submitTable">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="schemaDrawerVisible" :width="760" placement="right">
      <n-drawer-content :title="schemaDrawerTitle" closable>
        <div class="permission-table__drawer-panel">
          <div class="permission-table__toolbar">
            <n-button type="success" size="small" ghost @click="openCreateSchema">新 增</n-button>
            <n-button type="error" size="small" ghost @click="handleBatchDeleteSchemas">
              批量删除
            </n-button>
          </div>

          <n-spin :show="schemaDrawerLoading">
            <DynamicTable
              v-model:checked-row-keys="checkedSchemaKeys"
              :data="schemaRecords"
              :schemas="schemaTableSchemas"
              :loading="schemaDrawerLoading"
              row-key="id"
              empty-description="当前表格暂无字段列"
              :max-height="560"
            >
              <template #action="{ row }">
                <div class="permission-table__table-actions">
                  <n-button type="primary" ghost size="small" @click="openEditSchema(row.id)">
                    编辑
                  </n-button>
                  <n-button type="error" ghost size="small" @click="handleDeleteSchema(row.id)">
                    删除
                  </n-button>
                </div>
              </template>
            </DynamicTable>
          </n-spin>
        </div>

        <template #footer>
          <div class="permission-table__footer">
            <n-button @click="closeSchemaDrawer">关 闭</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal
      v-model:show="schemaModalVisible"
      preset="card"
      :title="schemaModalTitle"
      :style="{ width: 'min(720px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="schemaModalLoading">
        <DynamicForm
          ref="schemaFormRef"
          v-model="schemaFormModel"
          :schemas="schemaFormSchemas"
          :rules="schemaRules"
          label-position="top"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="permission-table__footer">
          <n-button @click="closeSchemaModal">取 消</n-button>
          <n-button type="primary" :loading="schemaSubmitLoading" @click="submitSchema">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.permission-table {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-table__toolbar,
.permission-table__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-table__toolbar {
  justify-content: flex-start;
}

.permission-table__drawer-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-table__footer {
  justify-content: flex-end;
}

.permission-table__table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.permission-table__pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
