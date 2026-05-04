import { computed, ref, toRaw, watch } from 'vue'

import type DynamicFormSchema from '../type/DynamicFormSchema'
import type { FormFieldKey, FormModelValue } from '../type/FormRenderContext'

interface UseFormModelOptions<Model extends FormModelValue> {
  modelValue: () => Model
  schemas: () => DynamicFormSchema<Model>[]
  emit: {
    (event: 'update:modelValue', value: Model): void
    (
      event: 'field-change',
      payload: {
        key: string
        dataKey: FormFieldKey<Model>
        value: unknown
        model: Model
        schema: DynamicFormSchema<Model>
      },
    ): void
  }
}

const buildDefaultModel = <Model extends FormModelValue>(
  schemas: DynamicFormSchema<Model>[],
  modelValue: Model,
) => {
  const nextModel = { ...modelValue }
  const nextModelRecord = nextModel as Record<FormFieldKey<Model>, unknown>
  let changed = false

  for (const schema of schemas) {
    if (nextModelRecord[schema.dataKey] === undefined && schema.defaultValue !== undefined) {
      nextModelRecord[schema.dataKey] = schema.defaultValue
      changed = true
    }
  }

  return {
    changed,
    model: nextModel,
  }
}

const clonePlainValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => clonePlainValue(item))
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (value && typeof value === 'object') {
    const rawValue = toRaw(value) as Record<string, unknown>
    const nextValue: Record<string, unknown> = {}

    for (const [key, item] of Object.entries(rawValue)) {
      nextValue[key] = clonePlainValue(item)
    }

    return nextValue
  }

  return value
}

const cloneModel = <Model extends FormModelValue>(model: Model): Model =>
  clonePlainValue(toRaw(model)) as Model

const replaceModelState = <Model extends FormModelValue>(target: Model, source: Model) => {
  const targetRecord = target as Record<string, unknown>
  const sourceRecord = source as Record<string, unknown>

  for (const key of Object.keys(targetRecord)) {
    if (!(key in sourceRecord)) {
      delete targetRecord[key]
    }
  }

  Object.assign(targetRecord, sourceRecord)
}

const createEmptyFieldValue = (schema: DynamicFormSchema<FormModelValue>) => {
  switch (schema.type) {
    case 'input':
    case 'textarea':
      return ''
    case 'input-number':
      return null
    case 'select':
    case 'dict':
    case 'radio':
    case 'date-picker':
      return null
    case 'checkbox':
      return []
    case 'switch':
      return false
    default:
      return undefined
  }
}

const createResetModel = <Model extends FormModelValue>(schemas: DynamicFormSchema<Model>[]) => {
  const nextModel = {} as Record<FormFieldKey<Model>, unknown>

  for (const schema of schemas) {
    nextModel[schema.dataKey] = createEmptyFieldValue(
      schema as unknown as DynamicFormSchema<FormModelValue>,
    )
  }

  return nextModel as Model
}

const useFormModel = <Model extends FormModelValue>(options: UseFormModelOptions<Model>) => {
  const modelState = ref<Model>({} as Model)
  const model = computed(() => modelState.value as Model)

  /*
   * 所有字段写入都先落到组件内部状态，
   * 再通过 update:modelValue 同步给外部，
   * 避免直接修改 props 导致视图和数据不同步。
   */
  const setFieldValue = (schema: DynamicFormSchema<Model>, value: unknown) => {
    ;(modelState.value as Record<FormFieldKey<Model>, unknown>)[schema.dataKey] = value
    const nextModel = cloneModel(modelState.value)

    options.emit('update:modelValue', nextModel)
    options.emit('field-change', {
      key: schema.key || schema.dataKey,
      dataKey: schema.dataKey,
      value,
      model: nextModel,
      schema,
    })
  }

  const setFieldsValue = (values: Partial<Model>) => {
    Object.assign(modelState.value, values)
    options.emit('update:modelValue', cloneModel(modelState.value))
  }

  const resetFieldsValue = () => {
    replaceModelState(modelState.value, createResetModel(options.schemas()))
    options.emit('update:modelValue', cloneModel(modelState.value))
  }

  watch(
    [options.schemas, options.modelValue],
    ([schemas, modelValue]) => {
      const { changed, model: normalizedModel } = buildDefaultModel(schemas, cloneModel(modelValue))

      replaceModelState(modelState.value, cloneModel(normalizedModel))

      if (changed) {
        options.emit('update:modelValue', cloneModel(normalizedModel))
      }
    },
    { immediate: true, deep: true },
  )

  return {
    model,
    setFieldValue,
    setFieldsValue,
    resetFieldsValue,
  }
}

export { useFormModel }
