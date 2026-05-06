<script setup lang="ts">
import 'vxe-table/lib/style.css'

import { ref } from 'vue'
import OnlineDatabaseColumnsTab from './components/OnlineDatabaseColumnsTab.vue'
import OnlineDatabaseDataTab from './components/OnlineDatabaseDataTab.vue'
import OnlineDatabaseForeignKeysTab from './components/OnlineDatabaseForeignKeysTab.vue'
import OnlineDatabaseIndexesTab from './components/OnlineDatabaseIndexesTab.vue'
import { provideOnlineDatabasePageContext } from './composable/useOnlineDatabasePageContext'
import { useOnlineDatabaseTree } from './composable/useOnlineDatabaseTree'

const activeTab = ref<'data' | 'columns' | 'indexes' | 'foreignKeys'>('data')
const pageContext = provideOnlineDatabasePageContext()

const treeState = useOnlineDatabaseTree({
  onTableNodeSelect: (node) => {
    pageContext.setActiveTableNode(node)
    activeTab.value = 'data'
  },
  onNodeUnselectTable: () => {
    pageContext.setActiveTableNode(null)
    activeTab.value = 'data'
  },
})

const { activeTableNode } = pageContext

const {
  expandedKeys,
  handleExpandedKeysUpdate,
  handleNodeLoad,
  handleTreeSelect,
  renderPrefix,
  selectedKeys,
  selectedNode,
  treeData,
  treeFilter,
  treeKeyword,
  treeLoading,
} = treeState
</script>

<template>
  <div class="online-db-page">
    <section class="online-db-page__tree-panel">
      <n-input
        v-model:value="treeKeyword"
        clearable
        placeholder="按数据源、Schema、对象名搜索"
        class="online-db-page__tree-search"
      />

      <n-spin :show="treeLoading" class="online-db-page__panel-spin">
        <n-scrollbar class="online-db-page__tree-scrollbar">
          <n-tree
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            :data="treeData"
            :pattern="treeKeyword"
            :filter="treeFilter"
            :show-irrelevant-nodes="false"
            :render-prefix="renderPrefix"
            block-line
            key-field="key"
            label-field="label"
            children-field="children"
            :on-load="handleNodeLoad"
            selectable
            show-line
            @update:expanded-keys="handleExpandedKeysUpdate"
            @update:selected-keys="handleTreeSelect"
          />
        </n-scrollbar>
      </n-spin>
    </section>

    <section class="online-db-page__detail-panel">
      <div v-if="activeTableNode" class="online-db-page__detail-content">
        <n-card :bordered="false" class="online-db-page__table-card">
          <n-tabs v-model:value="activeTab" type="line" animated class="online-db-page__tabs">
            <n-tab-pane name="data" tab="数据">
              <div class="online-db-page__tab-pane-content">
                <OnlineDatabaseDataTab />
              </div>
            </n-tab-pane>

            <n-tab-pane name="columns" tab="字段">
              <div class="online-db-page__tab-pane-content">
                <OnlineDatabaseColumnsTab />
              </div>
            </n-tab-pane>

            <n-tab-pane name="indexes" tab="索引">
              <div class="online-db-page__tab-pane-content">
                <OnlineDatabaseIndexesTab />
              </div>
            </n-tab-pane>

            <n-tab-pane name="foreignKeys" tab="外键">
              <div class="online-db-page__tab-pane-content">
                <OnlineDatabaseForeignKeysTab />
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </div>

      <div v-else class="online-db-page__empty">
        <n-empty
          :description="
            selectedNode
              ? '当前节点不是表或视图，请继续展开并选择具体表节点'
              : '请先从左侧数据库树选择一个表节点'
          "
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.online-db-page {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 136px);
  min-height: 0;
}

.online-db-page__tree-panel,
.online-db-page__detail-panel {
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

.online-db-page__tree-search {
  margin-bottom: 16px;
}

.online-db-page__panel-spin {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

:deep(.online-db-page__panel-spin .n-spin-content) {
  display: flex;
  flex: 1;
  min-height: 0;
}

:deep(.online-db-page__panel-spin .n-scrollbar) {
  height: 100%;
  min-height: 0;
}

.online-db-page__tree-scrollbar {
  height: 100%;
  min-height: 0;
}

.online-db-page__detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.online-db-page__table-card {
  display: flex;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--global-border-color);
  background: var(--global-bg-container);
}

.online-db-page__tabs {
  flex: 1;
  min-height: 0;
}

.online-db-page__tab-pane-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

:deep(.online-db-page__tabs .n-tabs-nav) {
  flex: 0 0 auto;
}

:deep(.online-db-page__tabs .n-tabs-pane-wrapper) {
  display: flex;
  flex: 1;
  min-height: 0;
}

:deep(.online-db-page__tabs .n-tab-pane) {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.online-db-page__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.online-db__tree-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--global-text-color-secondary);
}

.online-db__tree-icon svg {
  width: 16px;
  height: 16px;
  display: block;
}

.online-db__db-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.online-db__db-logo svg {
  width: 18px;
  height: 18px;
  display: block;
}

.online-db__tree-icon--spin {
  animation: online-db-spin 1s linear infinite;
}

@keyframes online-db-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .online-db-page {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .online-db-page__tree-scrollbar {
    max-height: 360px;
  }
}

@media (max-width: 768px) {
  .online-db-page__panel-header--detail {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
