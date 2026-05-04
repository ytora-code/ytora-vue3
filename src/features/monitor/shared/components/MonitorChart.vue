<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import VChart from 'vue-echarts'
import '../chart/echarts'

defineProps<{
  option: EChartsOption
  height?: number
}>()
</script>

<template>
  <VChart
    :option="option"
    autoresize
    class="monitor-chart"
    :style="{ height: `${height ?? 280}px` }"
  />
</template>

<style scoped>
.monitor-chart {
  width: 100%;
}
</style>
