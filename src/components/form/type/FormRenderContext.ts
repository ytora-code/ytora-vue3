import type { VNodeChild } from 'vue'

import type DynamicFormSchema from './DynamicFormSchema'

type FormModelValue = object
type FormFieldKey<Model extends FormModelValue = FormModelValue> = Extract<keyof Model, string>

interface FormRenderContext<Model extends FormModelValue = FormModelValue> {
  model: Model
  schema: DynamicFormSchema<Model>
  value: unknown
  setValue: (value: unknown) => void
}

type FormRender<Model extends FormModelValue = FormModelValue> = (
  context: FormRenderContext<Model>,
) => VNodeChild

export type { FormFieldKey, FormModelValue, FormRender, FormRenderContext }
