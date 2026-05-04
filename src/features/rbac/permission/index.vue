<script setup lang="ts">
import PermissionComponentTab from './components/PermissionComponentTab.vue'
import PermissionDataScopeTab from './components/PermissionDataScopeTab.vue'
import PermissionDetailTab from './components/PermissionDetailTab.vue'
import PermissionFormTab from './components/PermissionFormTab.vue'
import PermissionTableTab from './components/PermissionTableTab.vue'
import DynamicForm from '@/components/form/index.vue'
import { collectMatchedExpandedKeys } from './composable/permissionShared'
import usePermissionManager from './composable/usePermissionManager'
import useSchema from './composable/useSchema'

const { permissionFormSchemas, permissionFormRules } = useSchema()
const activeTab = ref<'detail' | 'data-scope' | 'table' | 'form' | 'component'>('detail')
const treeKeyword = ref('')

const {
  closeContextMenu,
  closeEditDialog,
  contextOptions,
  ctxVisible,
  ctxX,
  ctxY,
  currentPermission,
  editDialogTitle,
  editDialogVisible,
  editFormModel,
  editFormRef,
  expandedKeys,
  handleBlankContextMenu,
  handleContextSelect,
  handleTreeSelect,
  loadTree,
  nodeProps,
  renderPrefix,
  selectedKeys,
  submitDialogLoading,
  submitEditDialog,
  treeData,
  treeRenderKey,
  treeLoading,
} = usePermissionManager()

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

onMounted(async () => {
  await loadTree()
})
</script>

<template>
  <div class="permission-page">
    <section class="permission-page__tree-panel" @contextmenu="handleBlankContextMenu">
      <div class="permission-page__panel-header">
        <div class="permission-page__title">菜单</div>
      </div>

      <n-input
        v-model:value="treeKeyword"
        clearable
        placeholder="按菜单名称搜索"
        class="permission-page__tree-search"
      />

      <n-spin :show="treeLoading" class="permission-page__panel-spin">
        <n-scrollbar class="permission-page__tree-scrollbar">
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

    <section class="permission-page__detail-panel">
      <div class="permission-page__panel-header">
        <div class="permission-page__title">
          {{ currentPermission?.permissionName }}
        </div>
      </div>

      <n-scrollbar class="permission-page__detail-scrollbar">
        <div v-if="currentPermission" class="permission-page__detail-content">
          <n-tabs v-model:value="activeTab" type="line" animated>
            <n-tab-pane name="detail" tab="资源详情">
              <PermissionDetailTab />
            </n-tab-pane>

            <n-tab-pane name="data-scope" tab="数据范围">
              <PermissionDataScopeTab />
            </n-tab-pane>

            <n-tab-pane name="table" tab="表格">
              <PermissionTableTab />
            </n-tab-pane>

            <n-tab-pane name="form" tab="表单">
              <PermissionFormTab />
            </n-tab-pane>

            <n-tab-pane name="component" tab="其他组件">
              <PermissionComponentTab />
            </n-tab-pane>
          </n-tabs>
        </div>

        <div v-else class="permission-page__empty">
          <n-empty description="请先从左侧菜单树选择一个节点" />
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
        :schemas="permissionFormSchemas"
        :rules="permissionFormRules"
        :show-action-row="false"
        label-width="110"
      />

      <template #footer>
        <div class="permission-page__dialog-footer">
          <n-button @click="closeEditDialog">取 消</n-button>
          <n-button type="primary" :loading="submitDialogLoading" @click="submitEditDialog">
            保 存
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.permission-page {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 136px);
  min-height: 0;
}

.permission-page__tree-panel,
.permission-page__detail-panel {
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

.permission-page__panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.permission-page__tree-search {
  margin-bottom: 16px;
}

.permission-page__title {
  color: var(--global-text-color);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.permission-page__panel-spin {
  flex: 1;
  min-height: 0;
}

:deep(.permission-page__panel-spin .n-spin-content) {
  height: 100%;
  min-height: 0;
}

.permission-page__tree-scrollbar {
  height: 100%;
}

.permission-page__detail-scrollbar {
  height: 100%;
}

.permission-page__detail-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
}

.permission-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.permission-page__empty-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.permission-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.permission-tree__node--context .n-tree-node-content__text) {
  color: #1ca15b !important;
  font-weight: 700;
}

:deep(.permission-tree__node--context .n-tree-node-content__prefix svg) {
  color: #1ca15b !important;
}

@media (max-width: 960px) {
  .permission-page {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .permission-page__tree-scrollbar {
    max-height: 360px;
  }

  .permission-page__detail-scrollbar {
    max-height: none;
  }
}
</style>
