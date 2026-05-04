import type ResolvedDynamicFormSchema from './ResolvedDynamicFormSchema'
import type { FormModelValue } from './FormRenderContext'

interface FormGridItem<Model extends FormModelValue = FormModelValue> {
  schema: ResolvedDynamicFormSchema<Model>
  style: Record<string, string>
}

export default FormGridItem
