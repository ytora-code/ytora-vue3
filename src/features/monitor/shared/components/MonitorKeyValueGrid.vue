<script setup lang="ts">
import type { KeyValueItem } from '../utils/monitor'

defineProps<{
  items: KeyValueItem[]
  columns?: number
}>()
</script>

<template>
  <div
    class="monitor-kv-grid"
    :style="{ gridTemplateColumns: `repeat(${columns ?? 2}, minmax(0, 1fr))` }"
  >
    <div v-for="item in items" :key="item.label" class="monitor-kv-grid__item">
      <div class="monitor-kv-grid__label">{{ item.label }}</div>
      <div class="monitor-kv-grid__value" :class="{ 'monitor-kv-grid__value--mono': item.mono }">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-kv-grid {
  display: grid;
  gap: 12px;
}

.monitor-kv-grid__item {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--global-border-color) 82%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--global-bg-container) 92%, var(--global-fill-color));
}

.monitor-kv-grid__label {
  margin-bottom: 8px;
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.monitor-kv-grid__value {
  color: var(--global-text-color);
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.monitor-kv-grid__value--mono {
  font-family: 'Cascadia Mono', 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

@media (max-width: 768px) {
  .monitor-kv-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
