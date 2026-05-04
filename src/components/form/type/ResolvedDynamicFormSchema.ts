import type DynamicFormSchema from './DynamicFormSchema'
import type { FormModelValue } from './FormRenderContext'

interface ResolvedDynamicFormSchema<
  Model extends FormModelValue = FormModelValue,
> extends DynamicFormSchema<Model> {
  key: string
  span: number
  rowSpan: number
  hidden: boolean
  disabled: boolean
  placeholder: string
  labelPosition: 'left' | 'top'
}

export default ResolvedDynamicFormSchema
