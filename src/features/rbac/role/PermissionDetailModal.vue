<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicTable from '@/components/table/index.vue'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import useRolePermissionDataScope from '@/features/rbac/permission/composable/useRolePermissionDataScope'
import useRolePermissionTable from '@/features/rbac/permission/composable/useRolePermissionTable'
import useRolePermissionForm from '@/features/rbac/permission/composable/useRolePermissionForm'

const props = defineProps<{
  show: boolean
  roleId: string | null
  permission: SysPermissionData | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const close = () => {
  emit('update:show', false)
}

const activeTab = ref<'data-scope' | 'table' | 'form'>('data-scope')
const permissionId = computed(() => props.permission?.id ?? null)
const submitLoading = ref(false)

const {
  groupLoading,
  groupPageNo,
  groupPageSize,
  groupTotal,
  groupRecords,
  roleGroupTableSchemas,
  handleGroupPageChange,
  handleGroupPageSizeChange,
  scopeModalVisible,
  scopeLoading,
  scopeSubmitLoading,
  currentGroup,
  scopeRecords,
  checkedScopeKeys,
  checkedGroupKeys,
  scopeTableSchemas,
  refreshRoleGroup,
  closeScopeModal,
  openScopeModal,
  refreshRoleGroupDataScope,
} = useRolePermissionDataScope(computed(() => props.show), computed(() => props.roleId), permissionId)

const {
  tableLoading,
  tablePageNo,
  tablePageSize,
  tableTotal,
  tableRecords,
  checkedTableKeys,
  tableSchemaModalVisible,
  tableSchemaLoading,
  tableSchemaSubmitLoading,
  currentTable,
  tableSchemaRecords,
  checkedTableSchemaKeys,
  tableTableSchemas,
  tableColumnSchemas,
  refreshRoleTables,
  handleTablePageChange,
  handleTablePageSizeChange,
  closeTableSchemaModal,
  openTableSchemaModal,
  refreshRoleTableSchemas,
} = useRolePermissionTable(computed(() => props.show), computed(() => props.roleId), permissionId)

const {
  formLoading,
  formPageNo,
  formPageSize,
  formTotal,
  formRecords,
  checkedFormKeys,
  formSchemaModalVisible,
  formSchemaLoading,
  formSchemaSubmitLoading,
  currentForm,
  formSchemaRecords,
  checkedFormSchemaKeys,
  formTableSchemas,
  formItemSchemas,
  refreshRoleForms,
  handleFormPageChange,
  handleFormPageSizeChange,
  closeFormSchemaModal,
  openFormSchemaModal,
  refreshRoleFormSchemas,
} = useRolePermissionForm(computed(() => props.show), computed(() => props.roleId), permissionId)

const handleSubmit = async () => {
  submitLoading.value = true

  try {
    if (activeTab.value === 'data-scope') {
      await refreshRoleGroup()
      return
    }
    if (activeTab.value === 'table') {
      await refreshRoleTables()
      return
    }
    await refreshRoleForms()
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="资源详情"
    :style="{ width: 'min(800px, calc(100vw - 32px))', height: 'min(580px, calc(100vw - 64px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && close()"
  >
    <div class="permission-detail-modal__content">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="data-scope" tab="数据范围">
          <DynamicTable
            v-model:data="groupRecords"
            v-model:checked-row-keys="checkedGroupKeys"
            :schemas="roleGroupTableSchemas"
            :loading="groupLoading"
            row-key="id"
            empty-description="当前资源暂无数据范围组"
          >
            <template #action="{ row }">
              <n-button type="primary" size="small" ghost @click="openScopeModal(row)">
                数据范围
              </n-button>
            </template>
          </DynamicTable>

          <div class="permission-scope__pagination">
            <n-pagination
              :page="groupPageNo"
              :page-size="groupPageSize"
              :item-count="groupTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleGroupPageChange"
              @update:page-size="handleGroupPageSizeChange"
            />
          </div>
        </n-tab-pane>

        <n-tab-pane name="table" tab="表格">
          <DynamicTable
            v-model:data="tableRecords"
            v-model:checked-row-keys="checkedTableKeys"
            :schemas="tableTableSchemas"
            :loading="tableLoading"
            row-key="id"
            empty-description="当前资源暂无表格"
          >
            <template #action="{ row }">
              <n-button type="primary" size="small" ghost @click="openTableSchemaModal(row)">
                表格列
              </n-button>
            </template>
          </DynamicTable>

          <div class="permission-scope__pagination">
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
        </n-tab-pane>

        <n-tab-pane name="form" tab="表单">
          <DynamicTable
            v-model:data="formRecords"
            v-model:checked-row-keys="checkedFormKeys"
            :schemas="formTableSchemas"
            :loading="formLoading"
            row-key="id"
            empty-description="当前资源暂无表单"
          >
            <template #action="{ row }">
              <n-button type="primary" size="small" ghost @click="openFormSchemaModal(row)">
                表单项
              </n-button>
            </template>
          </DynamicTable>

          <div class="permission-scope__pagination">
            <n-pagination
              :page="formPageNo"
              :page-size="formPageSize"
              :item-count="formTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleFormPageChange"
              @update:page-size="handleFormPageSizeChange"
            />
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="close">关 闭</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleSubmit">确 认</n-button>
      </div>
    </template>
  </n-modal>

  <n-modal
    :show="scopeModalVisible"
    preset="card"
    :title="currentGroup?.name ? `数据范围：${currentGroup.name}` : '数据范围'"
    :style="{ width: 'min(920px, calc(100vw - 32px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && closeScopeModal()"
  >
    <n-spin :show="scopeLoading">
      <DynamicTable
        v-model:data="scopeRecords"
        v-model:checked-row-keys="checkedScopeKeys"
        :schemas="scopeTableSchemas"
        row-key="id"
        empty-description="当前分组暂无数据范围"
      />
    </n-spin>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="closeScopeModal">关 闭</n-button>
        <n-button type="primary" :loading="scopeSubmitLoading" @click="refreshRoleGroupDataScope">
          确 认
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-modal
    :show="tableSchemaModalVisible"
    preset="card"
    :title="currentTable?.permissionName ? `表格列：${currentTable.permissionName}` : '表格列'"
    :style="{ width: 'min(960px, calc(100vw - 32px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && closeTableSchemaModal()"
  >
    <n-spin :show="tableSchemaLoading">
      <DynamicTable
        v-model:data="tableSchemaRecords"
        v-model:checked-row-keys="checkedTableSchemaKeys"
        :schemas="tableColumnSchemas"
        row-key="id"
        empty-description="当前表格暂无字段列"
      />
    </n-spin>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="closeTableSchemaModal">关 闭</n-button>
        <n-button type="primary" :loading="tableSchemaSubmitLoading" @click="refreshRoleTableSchemas">
          确 认
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-modal
    :show="formSchemaModalVisible"
    preset="card"
    :title="currentForm?.permissionName ? `表单项：${currentForm.permissionName}` : '表单项'"
    :style="{ width: 'min(960px, calc(100vw - 32px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && closeFormSchemaModal()"
  >
    <n-spin :show="formSchemaLoading">
      <DynamicTable
        v-model:data="formSchemaRecords"
        v-model:checked-row-keys="checkedFormSchemaKeys"
        :schemas="formItemSchemas"
        row-key="id"
        empty-description="当前表单暂无表单项"
      />
    </n-spin>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="closeFormSchemaModal">关 闭</n-button>
        <n-button type="primary" :loading="formSchemaSubmitLoading" @click="refreshRoleFormSchemas">
          确 认
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.permission-detail-modal__content {
  min-height: 160px;
}

.permission-detail-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-scope__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
