import { computed } from 'vue'

import type DynamicFormSchema from '../type/DynamicFormSchema'
import type ResolvedDynamicFormSchema from '../type/ResolvedDynamicFormSchema'
import { getDefaultPlaceholder } from './useFormPlaceholder'
import type { FormModelValue } from '../type/FormRenderContext'

interface UseFormSchemaOptions<Model extends FormModelValue> {
  schemas: () => DynamicFormSchema<Model>[]
  labelPosition: () => 'left' | 'top'
  disabled: () => boolean
}

const normalizeSpan = (span?: number): number => {
  if (typeof span !== 'number' || Number.isNaN(span) || span <= 0) return 24
  if (span > 24) {
    console.warn(`[DynamicForm] span ${span} 超出 24，已自动按 24 处理`)
    return 24
  }
  return Math.floor(span)
}

const normalizeRowSpan = (rowSpan?: number): number => {
  if (typeof rowSpan !== 'number' || Number.isNaN(rowSpan) || rowSpan <= 0) return 1
  return Math.floor(rowSpan)
}

const useFormSchema = <Model extends FormModelValue>(options: UseFormSchemaOptions<Model>) => {
  const resolvedSchemas = computed<ResolvedDynamicFormSchema<Model>[]>(() =>
    options
      .schemas()
      .map((schema, index) => {
        const key = schema.key || schema.dataKey || `field-${index}`

        return {
          ...schema,
          key,
          span: normalizeSpan(schema.span),
          rowSpan: normalizeRowSpan(schema.rowSpan),
          hidden: schema.hidden ?? false,
          disabled: options.disabled() || (schema.disabled ?? false),
          placeholder: schema.placeholder ?? getDefaultPlaceholder(schema.type, schema.label),
          labelPosition: schema.labelPosition ?? options.labelPosition(),
        }
      })
      .filter((schema) => !schema.hidden),
  )

  return {
    resolvedSchemas,
  }
}

export { useFormSchema }
