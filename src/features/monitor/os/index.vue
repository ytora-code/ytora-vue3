<script setup lang="ts">
import { ref } from 'vue'
import OsNetworkTab from './components/OsNetworkTab.vue'
import OsOverviewTab from './components/OsOverviewTab.vue'
import OsStorageTab from './components/OsStorageTab.vue'

const activeTab = ref('overview')
</script>

<template>
  <div class="monitor-page">
    <n-card :bordered="false" class="monitor-page__panel">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <template #suffix>
          <div class="monitor-page__meta">
            <n-tag :bordered="false" type="default">操作系统监控</n-tag>
          </div>
        </template>

        <n-tab-pane name="overview" tab="系统总览">
          <OsOverviewTab v-if="activeTab === 'overview'" />
        </n-tab-pane>

        <n-tab-pane name="storage" tab="磁盘与分区">
          <OsStorageTab v-if="activeTab === 'storage'" />
        </n-tab-pane>

        <n-tab-pane name="network" tab="网络与进程">
          <OsNetworkTab v-if="activeTab === 'network'" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style scoped>
.monitor-page__panel {
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
  background: var(--global-bg-container);
  box-shadow: none;
}

.monitor-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 16px;
}

@media (max-width: 768px) {
  .monitor-page__meta {
    padding-left: 0;
  }
}
</style>
