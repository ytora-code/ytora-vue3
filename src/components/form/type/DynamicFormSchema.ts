import type { FormItemRule } from 'naive-ui'

import type FormPoint from './FormPoint'
import type { FormFieldKey, FormModelValue, FormRender } from './FormRenderContext'

type FormItemType =
  | 'input'
  | 'textarea'
  | 'input-number'
  | 'select'
  | 'dict'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date-picker'

interface DynamicFormSchema<Model extends FormModelValue = FormModelValue> {
  startPoint?: FormPoint
  endPoint?: FormPoint
  span?: number
  rowSpan?: number

  label?: string
  labelPosition?: 'left' | 'top'
  labelWidth?: number | string
  size?: 'small' | 'medium' | 'large'
  placeholder?: string
  type: FormItemType
  key?: string
  dataKey: FormFieldKey<Model>
  dictCode?: string
  hidden?: boolean
  disabled?: boolean
  defaultValue?: unknown
  rules?: FormItemRule[]

  prop?: Record<string, unknown>
  on?: Record<string, (...args: unknown[]) => unknown>
  render?: FormRender<Model>
}

export type { FormItemType }
export default DynamicFormSchema
