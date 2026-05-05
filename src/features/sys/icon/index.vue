<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from '@/utils/naiveApi'

import iconApi from './api/IconApi'
import IconGrid, { type IconGridItem } from './IconGrid.vue'
import { renderIcon } from '@/features/sys/icon/composable/icon'

const loading = ref(false)
const keyword = ref('')
const pageNo = ref(1)
const pageSize = ref(30)
const total = ref(0)
const iconList = ref<IconGridItem[]>([])

const loadIcons = async () => {
  loading.value = true
  try {
    const result = await iconApi.page({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      key: keyword.value,
    })

    pageNo.value = result.pageNo
    pageSize.value = result.pageSize
    total.value = result.total ?? 0
    iconList.value = result.records
  } finally {
    loading.value = false
  }
}

const applyFilter = async () => {
  pageNo.value = 1
  await loadIcons()
}

const resetFilter = async () => {
  keyword.value = ''
  pageNo.value = 1
  await loadIcons()
}

const pageChange = async (value: number) => {
  pageNo.value = value
  await loadIcons()
}

const pageSizeChange = async (value: number) => {
  pageNo.value = 1
  pageSize.value = value
  await loadIcons()
}

const copyIconCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    message.success(`已复制图标编码：${code}`)
  } catch {
    message.error('复制失败，请手动复制图标编码')
  }
}

onMounted(() => {
  loadIcons()
})
</script>

<template>
  <div class="icon-page">
    <n-card size="large" class="icon-page__panel">
      <div class="icon-page__header">
        <div>
          <div class="icon-page__title">图标库</div>
        </div>

        <div class="icon-page__meta">
          <n-tag type="info">{{ total }} 个图标</n-tag>
          <n-tag type="default">{{ pageSize }} / 页</n-tag>
        </div>
      </div>

      <div class="icon-page__toolbar">
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="搜索图标名称、编码或类型"
          class="icon-page__search"
          @keyup.enter="applyFilter"
        />
        <n-button type="primary" :render-icon="renderIcon('i-lucide-search')" @click="applyFilter">
          查 询
        </n-button>
        <n-button ghost @click="resetFilter">重 置</n-button>
      </div>

      <n-spin :show="loading">
        <IconGrid :icons="iconList" @copy="copyIconCode" />
        <div class="icon-page__pagination">
          <n-pagination
            :page="pageNo"
            :page-size="pageSize"
            :item-count="total"
            :page-sizes="[20, 30, 60]"
            :prefix="({ itemCount }) => '共 ' + (itemCount ?? 0) + ' 条'"
            show-size-picker
            show-quick-jumper
            @update:page="pageChange"
            @update:page-size="pageSizeChange"
          />
        </div>
      </n-spin>
    </n-card>
  </div>
</template>

<style scoped>
.icon-page {
  gap: 16px;
}

.icon-page__panel {
  overflow: hidden;
}

.icon-page__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.icon-page__title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--global-text-color);
}

.icon-page__subtitle {
  margin-top: 8px;
  color: var(--global-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.icon-page__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-page__toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.icon-page__search {
  max-width: 360px;
}

.icon-page__pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}

@media (max-width: 768px) {
  .icon-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .icon-page__toolbar {
    flex-direction: column;
  }

  .icon-page__search {
    max-width: none;
  }

  .icon-page__pagination {
    justify-content: center;
  }
}
</style>
