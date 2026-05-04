<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    values: Array<number | null>
    color?: string
    areaColor?: string
    height?: number
  }>(),
  {
    color: 'var(--global-color-primary)',
    areaColor: 'rgb(24 144 255 / 0.12)',
    height: 56,
  },
)

const normalizedValues = computed(() => {
  const values = props.values.filter(
    (item): item is number => typeof item === 'number' && Number.isFinite(item),
  )
  if (values.length === 0) {
    return []
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  return values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100
    const y = 100 - ((value - min) / span) * 100
    return { x, y, value }
  })
})

const polylinePoints = computed(() =>
  normalizedValues.value.map((point) => `${point.x},${point.y}`).join(' '),
)

const areaPoints = computed(() => {
  const points = normalizedValues.value
  if (points.length === 0) {
    return ''
  }

  const first = points[0]
  const last = points[points.length - 1]
  return `0,100 ${first.x},${first.y} ${points.map((point) => `${point.x},${point.y}`).join(' ')} ${last.x},100`
})
</script>

<template>
  <div class="monitor-sparkline" :style="{ height: `${height}px` }">
    <svg v-if="normalizedValues.length > 1" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon :points="areaPoints" :fill="areaColor" />
      <polyline
        :points="polylinePoints"
        fill="none"
        :stroke="color"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div v-else class="monitor-sparkline__empty">等待实时样本</div>
  </div>
</template>

<style scoped>
.monitor-sparkline {
  width: 100%;
  min-height: 36px;
}

.monitor-sparkline svg {
  display: block;
  width: 100%;
  height: 100%;
}

.monitor-sparkline__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--global-text-color-tertiary);
  font-size: 12px;
}
</style>
