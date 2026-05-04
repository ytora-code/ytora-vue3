<script setup lang="ts">
import { ref } from 'vue'
import AppBusinessTab from './components/AppBusinessTab.vue'
import AppOverviewTab from './components/AppOverviewTab.vue'
import AppRequestTab from './components/AppRequestTab.vue'

const activeTab = ref('overview')
</script>

<template>
  <div class="monitor-page">
    <n-card :bordered="false" class="monitor-page__panel">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <template #suffix>
          <div class="monitor-page__meta">
            <n-tag :bordered="false" type="default">应用监控</n-tag>
          </div>
        </template>

        <n-tab-pane name="overview" tab="运行总览">
          <AppOverviewTab v-if="activeTab === 'overview'" />
        </n-tab-pane>

        <n-tab-pane name="requests" tab="请求与错误">
          <AppRequestTab v-if="activeTab === 'requests'" />
        </n-tab-pane>

        <n-tab-pane name="business" tab="业务指标">
          <AppBusinessTab v-if="activeTab === 'business'" />
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
