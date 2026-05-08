<script setup lang="ts">
import { ref, watch } from 'vue'
import DynamicForm from '@/components/form/index.vue'
import ImportModal from '@/components/import-modal/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import OnlineApiEditorModal from './components/OnlineApiEditorModal.vue'
import OnlineApiGroupDialog from './components/OnlineApiGroupDialog.vue'
import useCrud from './composable/useCrud'
import useImportExport from './composable/useImportExport'
import useOnlineApiManager from './composable/useOnlineApiManager'
import useSchema from './composable/useSchema'
import { collectMatchedExpandedKeys, menuIcon } from './composable/onlineApiShared'

const currentGroupIdBridge = ref('')
const renderTreePrefix = () => menuIcon('FolderTree')

const {
  searchFormSchemas,
  basicFormSchemas,
  codeFormSchemas,
  basicFormRules,
  codeFormRules,
  tableSchemas,
} = useSchema()

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
  drawerFormModel,
  openCreateDrawer,
  openEditDrawer,
  closeDrawer,
  handleDrawerAfterLeave,
  submitDrawer,
  deleteLoading,
  publishLoadingId,
  offlineLoadingId,
  deleteRow,
  deleteBatch,
  publishRow,
  offlineRow,
} = useCrud({
  currentGroupId: currentGroupIdBridge,
})

const {
  closeContextMenu,
  closeIcon,
  contextOptions,
  currentGroup,
  currentGroupId,
  ctxVisible,
  ctxX,
  ctxY,
  editorActiveTab,
  executeTest,
  expandedKeys,
  groupDialogLoading,
  groupDialogTitle,
  groupDialogVisible,
  groupFormModel,
  groupFormRules,
  groupFormSchemas,
  groupSubmitLoading,
  handleBlankContextMenu,
  handleContextSelect,
  handleEditorAfterLeave,
  handleGroupDialogAfterLeave,
  handlePublishToggle,
  handleTreeSelect,
  loadTree,
  nodeProps,
  openCreateEditorDialog,
  openEditEditorDialog,
  selectedKeys,
  submitEditorDialog,
  submitGroupDialog,
  testLoading,
  testResultColumns,
  testResultRows,
  treeData,
  treeFilter,
  treeKeyword,
  treeLoading,
  treeRenderKey,
  syncListAfterGroupChanged,
} = useOnlineApiManager({
  drawerFormModel,
  closeDrawer,
  handleDrawerAfterLeave,
  openCreateDrawer,
  openEditDrawer,
  submitDrawer,
  pageNo,
  checkedRowKeys,
  page,
  publishRow,
  offlineRow,
})

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
  currentGroupId: currentGroupIdBridge,
  page,
})

const handleGroupModelUpdate = (value: typeof groupFormModel.value) => {
  groupFormModel.value = value
}

const handleDrawerModelUpdate = (value: typeof drawerFormModel.value) => {
  drawerFormModel.value = value
}

watch(
  () => [treeKeyword.value, treeData.value] as const,
  ([keyword]) => {
    expandedKeys.value = collectMatchedExpandedKeys(treeData.value, keyword)
  },
  { immediate: true },
)

watch(currentGroupId, async () => {
  currentGroupIdBridge.value = currentGroupId.value
  await syncListAfterGroupChanged()
})

onMounted(async () => {
  await loadTree()
})
</script>

<template>
  <div class="online-api-page">
    <section class="online-api-page__tree-panel" @contextmenu="handleBlankContextMenu">
      <n-input
        v-model:value="treeKeyword"
        clearable
        placeholder="按分组名称搜索"
        class="online-api-page__tree-search"
      />

      <n-spin :show="treeLoading" class="online-api-page__panel-spin">
        <n-scrollbar class="online-api-page__tree-scrollbar">
          <n-tree
            :key="treeRenderKey"
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            :data="treeData"
            :node-props="nodeProps"
            :render-prefix="renderTreePrefix"
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

    <section class="online-api-page__detail-panel">
      <div v-if="currentGroup" class="online-api-page__detail-content">
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
              <n-button type="success" size="small" ghost @click="openCreateEditorDialog">新 增</n-button>
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
              empty-description="当前分组暂无接口数据"
            >
              <template #action="{ row }">
                <div flex justify-center gap-2>
                  <n-button type="primary" ghost size="small" @click="openEditEditorDialog(row.id)">
                    编辑
                  </n-button>
                  <n-button
                    :type="row.status === 1 ? 'success' : 'warning'"
                    ghost
                    size="small"
                    :loading="
                      publishLoadingId === String(row.id) || offlineLoadingId === String(row.id)
                    "
                    @click="handlePublishToggle(row)"
                  >
                    {{ row.status === 1 ? '上线' : '下线' }}
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
      </div>

      <div v-else class="online-api-page__empty">
        <n-empty description="请先在左侧选择一个接口分组" />
      </div>
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

    <OnlineApiGroupDialog
      :show="groupDialogVisible"
      :title="groupDialogTitle"
      :loading="groupDialogLoading"
      :submit-loading="groupSubmitLoading"
      :model="groupFormModel"
      :schemas="groupFormSchemas"
      :rules="groupFormRules"
      @update:show="groupDialogVisible = $event"
      @update:model="handleGroupModelUpdate"
      @submit="submitGroupDialog"
      @after-leave="handleGroupDialogAfterLeave"
    />

    <OnlineApiEditorModal
      :show="drawerVisible"
      :title="drawerTitle"
      :loading="drawerLoading"
      :submit-loading="submitLoading"
      :close-icon="closeIcon"
      :model="drawerFormModel"
      :active-tab="editorActiveTab"
      :basic-form-schemas="basicFormSchemas"
      :basic-form-rules="basicFormRules"
      :code-form-schemas="codeFormSchemas"
      :code-form-rules="codeFormRules"
      :test-loading="testLoading"
      :test-result-rows="testResultRows"
      :test-result-columns="testResultColumns"
      @update:show="drawerVisible = $event"
      @update:model="handleDrawerModelUpdate"
      @update:active-tab="editorActiveTab = $event"
      @submit="submitEditorDialog"
      @execute-test="executeTest"
      @after-leave="handleEditorAfterLeave"
    />

    <ImportModal
      v-model:show="importDialogVisible"
      title="导入动态API接口"
      :import-loading="importLoading"
      :template-loading="templateLoading"
      :download-template="downloadTemplate"
      :submit-import="submitImport"
      @after-leave="handleImportDialogAfterLeave"
    />
  </div>
</template>

<style scoped>
.online-api-page {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 136px);
  min-height: 0;
}

.online-api-page__tree-panel,
.online-api-page__detail-panel {
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

.online-api-page__tree-search {
  margin-bottom: 16px;
}

.online-api-page__panel-spin,
.online-api-page__detail-content {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

:deep(.online-api-page__panel-spin .n-spin-content) {
  display: flex;
  flex: 1;
  min-height: 0;
}

.online-api-page__tree-scrollbar {
  height: 100%;
  min-height: 0;
}

.online-api-page__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

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

:deep(.online-api-tree__node--context .n-tree-node-content__text) {
  color: #1ca15b !important;
  font-weight: 700;
}

:deep(.online-api-tree__node--context .n-tree-node-content__prefix svg) {
  color: #1ca15b !important;
}

@media (max-width: 960px) {
  .online-api-page {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .online-api-page__tree-scrollbar {
    max-height: 360px;
  }
}
</style>
