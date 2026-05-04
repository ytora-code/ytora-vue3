import { ref, type Ref } from 'vue'
import { formatTimeLabel } from '../utils/monitor'

export type NumericPoint = number | null

export const useTimeSeries = (capacity: number = 60) => {
  const labels = ref<string[]>([])

  const createSeries = (): Ref<NumericPoint[]> => {
    return ref<NumericPoint[]>([])
  }

  const push = (
    timestamp: number | null | undefined,
    samples: Array<{
      series: Ref<NumericPoint[]>
      value: number | null | undefined
    }>,
  ) => {
    const label = formatTimeLabel(timestamp ?? Date.now())
    labels.value = [...labels.value, label].slice(-capacity)

    samples.forEach(({ series, value }) => {
      const nextValue = typeof value === 'number' && Number.isFinite(value) ? value : null
      series.value = [...series.value, nextValue].slice(-capacity)
    })
  }

  return {
    labels,
    createSeries,
    push,
  }
}
