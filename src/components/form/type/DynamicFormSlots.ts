import type { VNodeChild } from 'vue'

import type DynamicFormSchema from './DynamicFormSchema'
import type { FormModelValue } from './FormRenderContext'

interface DynamicFormFieldSlotProps<Model extends FormModelValue = FormModelValue> {
  model: Model
  schema: DynamicFormSchema<Model>
  value: unknown
  setValue: (value: unknown) => void
}

interface DynamicFormActionSlotProps<Model extends FormModelValue = FormModelValue> {
  submit: () => Promise<void>
  reset: () => void
  loading: boolean
  model: Model
}

interface DynamicFormSlots<Model extends FormModelValue = FormModelValue> {
  header?: () => VNodeChild
  footer?: () => VNodeChild
  actions?: (
    props: DynamicFormFieldSlotProps<Model> | DynamicFormActionSlotProps<Model>,
  ) => VNodeChild
  [name: string]:
    | ((props: DynamicFormFieldSlotProps<Model> | DynamicFormActionSlotProps<Model>) => VNodeChild)
    | undefined
}

export type { DynamicFormActionSlotProps, DynamicFormFieldSlotProps, DynamicFormSlots }
