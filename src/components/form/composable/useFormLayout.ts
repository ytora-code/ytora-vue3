import { computed } from 'vue'

import type FormGridItem from '../type/FormGridItem'
import type FormPoint from '../type/FormPoint'
import type ResolvedDynamicFormSchema from '../type/ResolvedDynamicFormSchema'
import type { FormModelValue } from '../type/FormRenderContext'

interface Cursor {
  row: number
  col: number
}

interface UseFormLayoutOptions<Model extends FormModelValue> {
  schemas: () => ResolvedDynamicFormSchema<Model>[]
}

const toGridArea = (startPoint: FormPoint, endPoint: FormPoint): Record<string, string> => ({
  gridColumn: `${startPoint.col + 1} / ${endPoint.col + 2}`,
  gridRow: `${startPoint.row + 1} / ${endPoint.row + 1}`,
})

const useFormLayout = <Model extends FormModelValue>(options: UseFormLayoutOptions<Model>) => {
  const gridItems = computed<FormGridItem<Model>[]>(() => {
    const cursor: Cursor = { row: 1, col: 1 }

    return options.schemas().map((schema) => {
      if (schema.startPoint && schema.endPoint) {
        return {
          schema,
          style: toGridArea(schema.startPoint, schema.endPoint),
        }
      }

      if (cursor.col + schema.span - 1 > 24) {
        cursor.row += 1
        cursor.col = 1
      }

      const startRow = cursor.row
      const startCol = cursor.col

      cursor.col += schema.span
      if (cursor.col > 24) {
        cursor.row += 1
        cursor.col = 1
      }

      return {
        schema,
        style: {
          gridColumn: `${startCol} / span ${schema.span}`,
          gridRow: `${startRow} / span ${schema.rowSpan}`,
        },
      }
    })
  })

  const nextGridPosition = computed(() => {
    const cursor: Cursor = { row: 1, col: 1 }

    options.schemas().forEach((schema) => {
      if (schema.startPoint && schema.endPoint) {
        return
      }

      if (cursor.col + schema.span - 1 > 24) {
        cursor.row += 1
        cursor.col = 1
      }

      cursor.col += schema.span
      if (cursor.col > 24) {
        cursor.row += 1
        cursor.col = 1
      }
    })

    return {
      row: cursor.row,
      col: cursor.col,
    }
  })

  return {
    gridItems,
    nextGridPosition,
  }
}

export { useFormLayout }
