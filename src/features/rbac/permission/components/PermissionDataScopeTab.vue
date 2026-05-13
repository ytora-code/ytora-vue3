<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import usePermissionDataScope from '../composable/usePermissionDataScope'

const {
  permissionId,
  groupLoading,
  groupPageNo,
  groupPageSize,
  groupTotal,
  groupRecords,
  checkedGroupKeys,
  groupModalVisible,
  groupModalLoading,
  groupSubmitLoading,
  groupFormRef,
  groupFormModel,
  scopeDrawerVisible,
  scopeDrawerLoading,
  scopeSearchFormModel,
  scopeRecords,
  checkedScopeKeys,
  scopeModalVisible,
  scopeModalLoading,
  scopeSubmitLoading,
  scopeFormRef,
  scopeFormModel,
  userPickerVisible,
  userPickerLoading,
  userPickerSearchFormModel,
  userPickerPageNo,
  userPickerPageSize,
  userPickerTotal,
  userPickerRecords,
  checkedUserPickerKeys,
  departPickerVisible,
  departPickerLoading,
  departPickerSearchFormModel,
  departTreeData,
  checkedDepartKeys,
  expandedDepartKeys,
  groupRules,
  scopeRules,
  groupDrawerTitle,
  scopeDrawerTitle,
  scopeFormDrawerTitle,
  groupTableSchemas,
  scopeTableSchemas,
  userPickerTableSchemas,
  scopeSearchFormSchemas,
  userSearchFormSchemas,
  departSearchFormSchemas,
  groupFormSchemas,
  scopeFormSchemas,
  handleGroupPageChange,
  handleGroupPageSizeChange,
  openCreateGroup,
  openEditGroup,
  closeGroupModal,
  submitGroup,
  handleDeleteGroup,
  handleBatchDeleteGroups,
  openScopeDrawer,
  closeScopeDrawer,
  handleScopeSearch,
  resetScopeSearch,
  openCreateScope,
  openEditScope,
  closeScopeModal,
  submitScope,
  handleDeleteScope,
  handleBatchDeleteScopes,
  handleUserPickerSearch,
  resetUserPickerSearch,
  handleUserPickerPageChange,
  handleUserPickerPageSizeChange,
  handleUserPickerSelectionChange,
  closeUserPicker,
  confirmUserPicker,
  handleDepartPickerSearch,
  resetDepartPickerSearch,
  closeDepartPicker,
  confirmDepartPicker,
} = usePermissionDataScope()
</script>

<template>
  <div v-if="!permissionId" class="permission-page__empty-tab">
    <n-empty description="请先选择资源，再管理对应的数据范围" />
  </div>

  <div v-else class="permission-scope">
    <div class="permission-scope__toolbar">
      <n-button type="success" size="small" ghost @click="openCreateGroup">新 增</n-button>
      <n-button type="error" size="small" ghost @click="handleBatchDeleteGroups">
        批量删除
      </n-button>
    </div>

    <DynamicTable
      v-model:data="groupRecords"
      v-model:checked-row-keys="checkedGroupKeys"
      :schemas="groupTableSchemas"
      :loading="groupLoading"
      row-key="id"
      empty-description="当前资源暂无数据范围组"
    >
      <template #action="{ row }">
        <div class="permission-scope__table-actions">
          <n-button type="primary" ghost size="small" @click="openEditGroup(row.id)">编辑</n-button>
          <n-button type="success" ghost size="small" @click="openScopeDrawer(row)">
            数据范围
          </n-button>
          <n-button type="error" ghost size="small" @click="handleDeleteGroup(row.id)">
            删除
          </n-button>
        </div>
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

    <n-modal
      v-model:show="groupModalVisible"
      preset="card"
      :title="groupDrawerTitle"
      :style="{ width: 'min(520px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="groupModalLoading">
        <DynamicForm
          ref="groupFormRef"
          v-model="groupFormModel"
          :schemas="groupFormSchemas"
          :rules="groupRules"
          label-position="top"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="permission-scope__footer">
          <n-button @click="closeGroupModal">取 消</n-button>
          <n-button type="primary" :loading="groupSubmitLoading" @click="submitGroup">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="scopeDrawerVisible" :width="760" placement="right">
      <n-drawer-content :title="scopeDrawerTitle" closable>
        <div class="permission-scope__drawer-panel">
          <DynamicForm
            v-model="scopeSearchFormModel"
            :schemas="scopeSearchFormSchemas"
            submit-text="搜 索"
            submit-icon="i-lucide-search"
            reset-text="重 置"
            reset-icon="i-lucide-rotate-ccw"
            action-placement="inline"
            :show-feedback="false"
            @submit="handleScopeSearch"
            @reset="resetScopeSearch"
          />

          <div class="permission-scope__toolbar">
            <n-button type="success" size="small" ghost @click="openCreateScope">新 增</n-button>
            <n-button type="error" size="small" ghost @click="handleBatchDeleteScopes">
              批量删除
            </n-button>
          </div>

          <n-spin :show="scopeDrawerLoading">
            <DynamicTable
              v-model:data="scopeRecords"
              v-model:checked-row-keys="checkedScopeKeys"
              :schemas="scopeTableSchemas"
              :loading="scopeDrawerLoading"
              row-key="id"
              empty-description="当前分组暂无数据范围"
              :max-height="560"
            >
              <template #action="{ row }">
                <div class="permission-scope__table-actions">
                  <n-button type="primary" ghost size="small" @click="openEditScope(row.id)">
                    编辑
                  </n-button>
                  <n-button type="error" ghost size="small" @click="handleDeleteScope(row.id)">
                    删除
                  </n-button>
                </div>
              </template>
            </DynamicTable>
          </n-spin>
        </div>

        <template #footer>
          <div class="permission-scope__footer">
            <n-button @click="closeScopeDrawer">关 闭</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal
      v-model:show="scopeModalVisible"
      preset="card"
      :title="scopeFormDrawerTitle"
      :style="{ width: 'min(540px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="scopeModalLoading">
        <DynamicForm
          ref="scopeFormRef"
          v-model="scopeFormModel"
          :schemas="scopeFormSchemas"
          :rules="scopeRules"
          label-position="top"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="permission-scope__footer">
          <n-button @click="closeScopeModal">取 消</n-button>
          <n-button type="primary" :loading="scopeSubmitLoading" @click="submitScope">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="userPickerVisible"
      preset="card"
      title="选择用户"
      :style="{ width: 'min(1080px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <div class="permission-scope__picker-panel">
        <DynamicForm
          v-model="userPickerSearchFormModel"
          :schemas="userSearchFormSchemas"
          submit-text="搜 索"
          submit-icon="i-lucide-search"
          reset-text="重 置"
          reset-icon="i-lucide-rotate-ccw"
          action-placement="inline"
          :show-feedback="false"
          @submit="handleUserPickerSearch"
          @reset="resetUserPickerSearch"
        />

        <DynamicTable
          v-model:data="userPickerRecords"
          v-model:checked-row-keys="checkedUserPickerKeys"
          :schemas="userPickerTableSchemas"
          :loading="userPickerLoading"
          row-key="id"
          empty-description="暂无可选择用户"
          @selection-change="handleUserPickerSelectionChange"
        />

        <div class="permission-scope__pagination">
          <n-pagination
            :page="userPickerPageNo"
            :page-size="userPickerPageSize"
            :item-count="userPickerTotal"
            :page-sizes="[10, 20, 30, 50]"
            :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
            show-size-picker
            show-quick-jumper
            @update:page="handleUserPickerPageChange"
            @update:page-size="handleUserPickerPageSizeChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="permission-scope__footer">
          <n-button @click="closeUserPicker">取 消</n-button>
          <n-button type="primary" @click="confirmUserPicker">确 定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="departPickerVisible"
      preset="card"
      title="选择部门"
      :style="{ width: 'min(720px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <div class="permission-scope__picker-panel">
        <DynamicForm
          v-model="departPickerSearchFormModel"
          :schemas="departSearchFormSchemas"
          submit-text="搜 索"
          submit-icon="i-lucide-search"
          reset-text="重 置"
          reset-icon="i-lucide-rotate-ccw"
          action-placement="inline"
          :show-feedback="false"
          @submit="handleDepartPickerSearch"
          @reset="resetDepartPickerSearch"
        />

        <n-spin :show="departPickerLoading">
          <div class="permission-scope__depart-tree">
            <n-tree
              v-model:checked-keys="checkedDepartKeys"
              v-model:expanded-keys="expandedDepartKeys"
              block-line
              cascade
              checkable
              check-strategy="child"
              key-field="key"
              label-field="label"
              children-field="children"
              :data="departTreeData"
              :pattern="departPickerSearchFormModel.departName"
              :show-irrelevant-nodes="false"
              :filter="
                (pattern, node) =>
                  String(node.label ?? '')
                    .toLowerCase()
                    .includes(String(pattern).trim().toLowerCase())
              "
            />
          </div>
        </n-spin>
      </div>

      <template #footer>
        <div class="permission-scope__footer">
          <n-button @click="closeDepartPicker">取 消</n-button>
          <n-button type="primary" @click="confirmDepartPicker">确 定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.permission-scope {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-scope__meta,
.permission-scope__toolbar,
.permission-scope__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-scope__toolbar {
  justify-content: flex-start;
}

.permission-scope__pagination {
  display: flex;
  justify-content: flex-end;
}

.permission-scope__drawer-panel,
.permission-scope__picker-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-scope__footer {
  justify-content: flex-end;
}

.permission-scope__table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.permission-scope__depart-tree {
  max-height: 480px;
  overflow: auto;
  border: 1px solid #ededf3;
  border-radius: 6px;
  padding: 12px;
}
</style>
