import { ref, type Ref } from 'vue'

export const useMetricSeries = (capacity: number = 12) => {
  const createSeries = (seed?: Array<number | null | undefined>): Ref<number[]> => {
    const series = ref<number[]>([])
    ;(seed ?? []).forEach((item) => {
      if (typeof item === 'number' && Number.isFinite(item)) {
        series.value.push(item)
      }
    })
    return series
  }

  const append = (series: Ref<number[]>, value: number | null | undefined) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return
    }
    const next = [...series.value, value]
    series.value = next.slice(-capacity)
  }

  return {
    createSeries,
    append,
  }
}
