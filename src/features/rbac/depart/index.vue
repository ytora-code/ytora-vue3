<script setup lang="ts">
import DepartDetailTab from './components/DepartDetailTab.vue'
import DepartUsersTab from './components/DepartUsersTab.vue'
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import { collectMatchedExpandedKeys } from './composable/departShared'
import useDepartManager from './composable/useDepartManager'
import useSchema from './composable/useSchema'

const { bindUserTableSchemas, createDepartFormRules, createDepartFormSchemas } = useSchema()
const treeKeyword = ref('')

const {
  activeTab,
  checkedContactUserKeys,
  clearContact,
  closeContactDialog,
  closeContextMenu,
  closeEditDialog,
  confirmContactSelection,
  contactDialogLoading,
  contactDialogVisible,
  contactUserOptions,
  contactUserPageNo,
  contactUserPageSize,
  contactUserTotal,
  contextOptions,
  ctxVisible,
  ctxX,
  ctxY,
  currentDepart,
  editContactName,
  editDialogTitle,
  editDialogVisible,
  editFormModel,
  editFormRef,
  expandedKeys,
  handleBlankContextMenu,
  handleContactSelectionChange,
  handleContactUserPageChange,
  handleContactUserPageSizeChange,
  handleContextSelect,
  handleTreeSelect,
  loadTree,
  nodeProps,
  openContactPicker,
  renderPrefix,
  selectedKeys,
  submitDialogLoading,
  submitEditDialog,
  treeData,
  treeRenderKey,
  treeLoading,
} = useDepartManager()

const treeFilter = (pattern: string, node: { label?: string | number }) =>
  String(node.label ?? '')
    .toLowerCase()
    .includes(pattern.trim().toLowerCase())

watch(
  () => [treeKeyword.value, treeData.value] as const,
  ([keyword]) => {
    expandedKeys.value = collectMatchedExpandedKeys(treeData.value, keyword)
  },
  { immediate: true },
)

const editFormSchemas = computed(() =>
  createDepartFormSchemas({
    showDepartCode: editDialogTitle.value !== '新增下级部门',
    disableDepartCode: editDialogTitle.value !== '新增顶级部门',
    contactName: editContactName.value,
    openContactPicker: () => {
      void openContactPicker('edit')
    },
    clearContact: () => {
      clearContact()
    },
  }),
)

const editFormRules = computed(() =>
  createDepartFormRules({
    showDepartCode: editDialogTitle.value !== '新增下级部门',
  }),
)

onMounted(async () => {
  await loadTree()
})
</script>

<template>
  <div class="depart-page">
    <section class="depart-page__tree-panel" @contextmenu="handleBlankContextMenu">
      <div class="depart-page__panel-header">
        <div class="depart-page__title">部门</div>
      </div>

      <n-input
        v-model:value="treeKeyword"
        clearable
        placeholder="按部门名称搜索"
        class="depart-page__tree-search"
      />

      <n-spin :show="treeLoading" class="depart-page__panel-spin">
        <n-scrollbar class="depart-page__tree-scrollbar">
          <n-tree
            :key="treeRenderKey"
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :data="treeData"
            :node-props="nodeProps"
            :render-prefix="renderPrefix"
            :pattern="treeKeyword"
            :filter="treeFilter"
            :show-irrelevant-nodes="false"
            block-line
            key-field="key"
            label-field="label"
            children-field="children"
            expand-on-click
            selectable
            show-line
            @update:selected-keys="handleTreeSelect"
          />
        </n-scrollbar>
      </n-spin>
    </section>

    <section class="depart-page__detail-panel">
      <div class="depart-page__panel-header">
        <div class="depart-page__title">
          {{ currentDepart?.departName ?? '-' }}({{ currentDepart?.departCode ?? '-' }})
        </div>
      </div>

      <n-scrollbar class="depart-page__detail-scrollbar">
        <div v-if="currentDepart" class="depart-page__detail-content">
          <n-tabs v-model:value="activeTab" type="line" animated>
            <n-tab-pane name="detail" tab="部门详情">
              <DepartDetailTab />
            </n-tab-pane>

            <n-tab-pane name="users" tab="部门用户">
              <DepartUsersTab />
            </n-tab-pane>
          </n-tabs>
        </div>

        <div v-else class="depart-page__empty">
          <n-empty description="请先从左侧部门树选择一个节点" />
        </div>
      </n-scrollbar>
    </section>

    <n-dropdown
      :show="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      placement="bottom-start"
      trigger="manual"
      :options="contextOptions"
      @select="handleContextSelect"
      @clickoutside="closeContextMenu"
    />

    <n-modal
      v-model:show="editDialogVisible"
      preset="card"
      :title="editDialogTitle"
      :style="{ width: 'min(680px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <DynamicForm
        ref="editFormRef"
        v-model="editFormModel"
        :schemas="editFormSchemas"
        :rules="editFormRules"
        :show-action-row="false"
        label-width="110"
      />

      <template #footer>
        <div class="depart-page__dialog-footer">
          <n-button @click="closeEditDialog">取 消</n-button>
          <n-button type="primary" :loading="submitDialogLoading" @click="submitEditDialog">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="contactDialogVisible"
      preset="card"
      title="选择部门负责人"
      :style="{ width: 'min(920px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="contactDialogLoading">
        <div class="depart-page__tab-section">
          <div class="depart-page__tab-hint">请选择一个用户作为当前部门负责人</div>

          <DynamicTable
            v-model:data="contactUserOptions"
            v-model:checked-row-keys="checkedContactUserKeys"
            :schemas="bindUserTableSchemas"
            row-key="id"
            empty-description="暂无可选择用户"
            :min-height="180"
            @selection-change="handleContactSelectionChange"
          />

          <div class="depart-page__pagination-bar">
            <n-pagination
              :page="contactUserPageNo"
              :page-size="contactUserPageSize"
              :item-count="contactUserTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleContactUserPageChange"
              @update:page-size="handleContactUserPageSizeChange"
            />
          </div>
        </div>
      </n-spin>

      <template #footer>
        <div class="depart-page__dialog-footer">
          <n-button @click="closeContactDialog">取 消</n-button>
          <n-button type="primary" @click="confirmContactSelection">确 定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.depart-page {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 136px);
  min-height: 0;
}

.depart-page__tree-panel,
.depart-page__detail-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 16px;
  border: 1px solid var(--global-border-color);
  border-radius: calc(var(--global-border-radius) + 2px);
  background: var(--global-bg-container);
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.04),
    0 10px 24px -20px rgb(15 23 42 / 0.1);
}

.depart-page__panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.depart-page__tree-search {
  margin-bottom: 16px;
}

.depart-page__title {
  color: var(--global-text-color);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.depart-page__panel-spin {
  flex: 1;
  min-height: 0;
}

:deep(.depart-page__panel-spin .n-spin-content) {
  height: 100%;
  min-height: 0;
}

.depart-page__tree-scrollbar {
  height: 100%;
}

.depart-page__detail-scrollbar {
  height: 100%;
}

.depart-page__detail-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
}

.depart-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.depart-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.depart-page__tab-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.depart-page__tab-hint {
  color: var(--global-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.depart-page__pagination-bar {
  display: flex;
  justify-content: flex-end;
}

:deep(.depart-tree__node--context .n-tree-node-content__text) {
  color: #1ca15b !important;
  font-weight: 700;
}

:deep(.depart-tree__node--context .n-tree-node-content__prefix svg) {
  color: #1ca15b !important;
}

@media (max-width: 960px) {
  .depart-page {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .depart-page__tree-scrollbar {
    max-height: 360px;
  }

  .depart-page__detail-scrollbar {
    max-height: none;
  }
}
</style>
