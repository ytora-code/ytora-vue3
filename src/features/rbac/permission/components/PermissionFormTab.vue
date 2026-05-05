<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import usePermissionForm from '../composable/usePermissionForm'

const {
  permissionId,
  formLoading,
  formRecords,
  checkedFormKeys,
  formModalVisible,
  formModalLoading,
  formSubmitLoading,
  formFormRef,
  formFormModel,
  schemaDrawerVisible,
  schemaDrawerLoading,
  schemaRecords,
  checkedSchemaKeys,
  schemaModalVisible,
  schemaModalLoading,
  schemaSubmitLoading,
  schemaFormRef,
  schemaFormModel,
  formRules,
  schemaRules,
  formModalTitle,
  schemaDrawerTitle,
  schemaModalTitle,
  formTableSchemas,
  schemaTableSchemas,
  formFormSchemas,
  schemaFormSchemas,
  openCreateForm,
  openEditForm,
  closeFormModal,
  submitForm,
  handleDeleteForm,
  handleBatchDeleteForms,
  openSchemaDrawer,
  closeSchemaDrawer,
  openCreateSchema,
  openEditSchema,
  closeSchemaModal,
  submitSchema,
  handleDeleteSchema,
  handleBatchDeleteSchemas,
} = usePermissionForm()
</script>

<template>
  <div v-if="!permissionId" class="permission-page__empty-tab">
    <n-empty description="请先选择资源，再管理对应的表单资源" />
  </div>

  <div v-else class="permission-form">
    <div class="permission-form__toolbar">
      <n-button type="success" size="small" ghost @click="openCreateForm">新 增</n-button>
      <n-button type="error" size="small" ghost @click="handleBatchDeleteForms">
        批量删除
      </n-button>
    </div>

    <DynamicTable
      v-model:checked-row-keys="checkedFormKeys"
      :data="formRecords"
      :schemas="formTableSchemas"
      :loading="formLoading"
      row-key="id"
      empty-description="当前资源暂无表单资源"
    >
      <template #action="{ row }">
        <div class="permission-form__table-actions">
          <n-button type="primary" ghost size="small" @click="openEditForm(row.id)">编辑</n-button>
          <n-button type="success" ghost size="small" @click="openSchemaDrawer(row)">
            表单项
          </n-button>
          <n-button type="error" ghost size="small" @click="handleDeleteForm(row.id)">
            删除
          </n-button>
        </div>
      </template>
    </DynamicTable>

    <n-modal
      v-model:show="formModalVisible"
      preset="card"
      :title="formModalTitle"
      :style="{ width: 'min(680px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="formModalLoading">
        <DynamicForm
          ref="formFormRef"
          v-model="formFormModel"
          :schemas="formFormSchemas"
          :rules="formRules"
          label-position="top"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="permission-form__footer">
          <n-button @click="closeFormModal">取 消</n-button>
          <n-button type="primary" :loading="formSubmitLoading" @click="submitForm">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="schemaDrawerVisible" :width="760" placement="right">
      <n-drawer-content :title="schemaDrawerTitle" closable>
        <div class="permission-form__drawer-panel">
          <div class="permission-form__toolbar">
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
              empty-description="当前表单暂无表单项"
              :max-height="560"
            >
              <template #action="{ row }">
                <div class="permission-form__table-actions">
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
          <div class="permission-form__footer">
            <n-button @click="closeSchemaDrawer">关 闭</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal
      v-model:show="schemaModalVisible"
      preset="card"
      :title="schemaModalTitle"
      :style="{ width: 'min(760px, calc(100vw - 32px))' }"
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
        <div class="permission-form__footer">
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
.permission-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-form__toolbar,
.permission-form__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-form__toolbar {
  justify-content: flex-start;
}

.permission-form__drawer-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-form__footer {
  justify-content: flex-end;
}

.permission-form__table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
