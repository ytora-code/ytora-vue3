<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'
import MonitorChart from './MonitorChart.vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string
    subtitle?: string
    icon?: string
    tone?: 'blue' | 'green' | 'amber' | 'red'
    trend?: Array<number | null>
  }>(),
  {
    subtitle: '',
    icon: 'i-lucide-activity',
    tone: 'blue',
    trend: () => [],
  },
)

const iconRenderer = computed(() => renderIcon(props.icon))

const toneMap = {
  blue: {
    accent: '#2080f0',
    soft: 'rgb(32 128 240 / 0.14)',
    glow: 'rgb(32 128 240 / 0.18)',
  },
  green: {
    accent: '#18a058',
    soft: 'rgb(24 160 88 / 0.14)',
    glow: 'rgb(24 160 88 / 0.18)',
  },
  amber: {
    accent: '#f0a020',
    soft: 'rgb(240 160 32 / 0.14)',
    glow: 'rgb(240 160 32 / 0.18)',
  },
  red: {
    accent: '#d03050',
    soft: 'rgb(208 48 80 / 0.14)',
    glow: 'rgb(208 48 80 / 0.18)',
  },
} as const

const currentTone = computed(() => toneMap[props.tone])

const trendOption = computed<EChartsOption>(() => ({
  animation: false,
  grid: {
    top: 2,
    left: 0,
    right: 0,
    bottom: 0,
  },
  xAxis: {
    type: 'category',
    show: false,
    data: props.trend.map((_, index) => index),
  },
  yAxis: {
    type: 'value',
    show: false,
    min: 'dataMin',
    max: 'dataMax',
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: currentTone.value.accent,
      },
      areaStyle: {
        color: currentTone.value.soft,
      },
      data: props.trend,
    },
  ],
}))
</script>

<template>
  <div
    class="metric-card"
    :style="{
      '--metric-accent': currentTone.accent,
      '--metric-soft': currentTone.soft,
      '--metric-glow': currentTone.glow,
    }"
  >
    <div class="metric-card__head">
      <div class="metric-card__title">{{ title }}</div>
      <div class="metric-card__icon">
        <component :is="iconRenderer" v-if="iconRenderer" />
      </div>
    </div>

    <div class="metric-card__value">{{ value }}</div>
    <div v-if="subtitle" class="metric-card__subtitle">{{ subtitle }}</div>

    <MonitorChart
      v-if="trend.length > 0"
      class="metric-card__chart"
      :option="trendOption"
      :height="50"
    />
  </div>
</template>

<style scoped>
.metric-card {
  position: relative;
  overflow: hidden;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--metric-accent) 16%, var(--global-border-color));
  border-radius: 3px;
  background: var(--global-bg-container);
}

.metric-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-card__title,
.metric-card__subtitle {
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}

.metric-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 3px;
  background: var(--metric-soft);
  color: var(--metric-accent);
  font-size: 18px;
}

.metric-card__value {
  margin-top: 14px;
  color: var(--global-text-color);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}

.metric-card__subtitle {
  margin-top: 6px;
  line-height: 1.5;
}

.metric-card__chart {
  margin-top: 12px;
}
</style>
