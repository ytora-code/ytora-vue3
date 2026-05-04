<script setup lang="ts">
interface BarItem {
  label: string
  value: string
  percent: number
  hint?: string
}

defineProps<{
  items: BarItem[]
  tone?: 'blue' | 'green' | 'amber' | 'red'
}>()
</script>

<template>
  <div class="monitor-bar-list" :data-tone="tone ?? 'blue'">
    <div v-for="item in items" :key="item.label" class="monitor-bar-list__item">
      <div class="monitor-bar-list__head">
        <div class="monitor-bar-list__label">{{ item.label }}</div>
        <div class="monitor-bar-list__value">{{ item.value }}</div>
      </div>
      <div class="monitor-bar-list__track">
        <div
          class="monitor-bar-list__fill"
          :style="{ width: `${Math.max(0, Math.min(100, item.percent))}%` }"
        />
      </div>
      <div v-if="item.hint" class="monitor-bar-list__hint">{{ item.hint }}</div>
    </div>
  </div>
</template>

<style scoped>
.monitor-bar-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.monitor-bar-list[data-tone='blue'] {
  --bar-color: #2080f0;
  --bar-soft: rgb(32 128 240 / 0.12);
}

.monitor-bar-list[data-tone='green'] {
  --bar-color: #18a058;
  --bar-soft: rgb(24 160 88 / 0.12);
}

.monitor-bar-list[data-tone='amber'] {
  --bar-color: #f0a020;
  --bar-soft: rgb(240 160 32 / 0.12);
}

.monitor-bar-list[data-tone='red'] {
  --bar-color: #d03050;
  --bar-soft: rgb(208 48 80 / 0.12);
}

.monitor-bar-list__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.monitor-bar-list__label,
.monitor-bar-list__hint {
  color: var(--global-text-color-secondary);
  font-size: 12px;
}

.monitor-bar-list__value {
  color: var(--global-text-color);
  font-weight: 600;
}

.monitor-bar-list__track {
  overflow: hidden;
  height: 8px;
  border-radius: 999px;
  background: var(--bar-soft);
}

.monitor-bar-list__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, white 18%, var(--bar-color)),
    var(--bar-color)
  );
}

.monitor-bar-list__hint {
  margin-top: 6px;
}
</style>
