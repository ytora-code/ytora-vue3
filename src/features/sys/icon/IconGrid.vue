<script setup lang="ts">
import type { Component } from 'vue'
import type SysIconData from './type/SysIconData'

export interface IconGridItem extends SysIconData {
  renderer?: Component
}

defineProps<{
  icons: IconGridItem[]
}>()

const emit = defineEmits<{
  (e: 'copy', code: string): void
}>()
</script>

<template>
  <n-empty v-if="!icons.length" description="没有匹配到图标" class="icon-page__empty" />

  <div v-else class="icon-page__grid">
    <button
      v-for="item in icons"
      :key="item.id || item.code"
      type="button"
      class="icon-card"
      @click="emit('copy', item.code)"
    >
      <div class="icon-card__preview">
        <component :is="item.renderer" />
      </div>

      <div class="icon-card__body">
        <div class="icon-card__name" :title="item.name">{{ item.name }}</div>
        <div class="icon-card__code" :title="item.code">{{ item.code }}</div>
        <n-tag size="small" type="default" round>{{ item.type || 'unknown' }}</n-tag>
      </div>
    </button>
  </div>
</template>

<style scoped>
.icon-page__empty {
  padding: 48px 0 32px;
}

.icon-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-width: 0;
  padding: 20px 16px 18px;
  border: 1px solid var(--global-border-color);
  border-radius: 4px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--global-bg-container) 96%, white 4%),
      var(--global-bg-elevated)
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--global-color-primary) 8%, transparent),
      color-mix(in srgb, var(--global-color-success) 6%, transparent)
    );
  cursor: pointer;
  text-align: center;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.icon-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--global-color-primary) 36%, var(--global-border-color));
  box-shadow:
    0 18px 30px -24px rgb(15 23 42 / 0.24),
    0 8px 18px -20px color-mix(in srgb, var(--global-color-primary) 28%, transparent);
}

.icon-card__preview {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 4px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--global-color-primary) 14%, var(--global-bg-color)),
    color-mix(in srgb, var(--global-bg-elevated) 88%, var(--global-bg-color))
  );
  color: var(--global-color-primary);
  font-size: 30px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--global-color-primary) 30%, transparent);
}

.icon-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.icon-card__name,
.icon-card__code {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--global-text-color);
}

.icon-card__code {
  font-size: 12px;
  color: var(--global-text-color-secondary);
}

@media (max-width: 768px) {
  .icon-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
