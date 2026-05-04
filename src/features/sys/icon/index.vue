<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from '@/utils/naiveApi'

import iconApi from './api/IconApi'
import IconGrid, { type IconGridItem } from './IconGrid.vue'
import { renderIcon } from '@/utils/icon'

const loading = ref(false)
const keyword = ref('')
const iconList = ref<IconGridItem[]>([])
const displayedIcons = ref<IconGridItem[]>([])

const applyFilter = () => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  if (!normalizedKeyword) {
    displayedIcons.value = iconList.value
    return
  }

  displayedIcons.value = iconList.value.filter((item) => {
    return [item.name, item.code, item.type].some((value) =>
      value?.toLowerCase().includes(normalizedKeyword),
    )
  })
}

const loadIcons = async () => {
  loading.value = true
  try {
    const response = await iconApi.list()
    const normalizedIcons = response.map((item) => ({
      ...item,
      renderer: renderIcon(item.code),
    }))

    iconList.value = normalizedIcons
    displayedIcons.value = normalizedIcons
  } finally {
    loading.value = false
  }
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
          <n-tag type="info">{{ displayedIcons.length }} / {{ iconList.length }}</n-tag>
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
      </div>

      <n-spin :show="loading">
        <IconGrid :icons="displayedIcons" @copy="copyIconCode" />
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
}
</style>
