<script setup lang="ts" generic="TModel extends FormModelValue = FormModelValue">
import type { FormModelValue } from './type/FormRenderContext'
import { computed } from 'vue'
import {
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
} from 'naive-ui'

import Dict from '@/components/dict/index.vue'
import RenderFactory from './RenderFactory.vue'
import type DynamicFormSchema from './type/DynamicFormSchema'
import type FormOption from './type/FormOption'
import type ResolvedDynamicFormSchema from './type/ResolvedDynamicFormSchema'

type FormFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number>
  | [string, string]
  | [number, number]

const props = defineProps<{
  schema: ResolvedDynamicFormSchema<TModel>
  model: TModel
  formSize?: 'small' | 'medium' | 'large'
  setValue: (schema: DynamicFormSchema<TModel>, value: unknown) => void
}>()

const slots = useSlots()

const currentValue = computed<FormFieldValue>({
  get: () => (props.model as Record<string, unknown>)[props.schema.dataKey] as FormFieldValue,
  set: (value: FormFieldValue) => {
    props.setValue(props.schema, value)
  },
})

const inputValue = computed<string | [string, string] | null | undefined>({
  get: () => {
    if (currentValue.value === undefined || currentValue.value === null) {
      return ''
    }

    return currentValue.value as string | [string, string] | null | undefined
  },
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const selectValue = computed<string | number | string[] | number[] | null | undefined>({
  get: () =>
    (currentValue.value ?? null) as string | number | string[] | number[] | null | undefined,
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const inputNumberValue = computed<number | null | undefined>({
  get: () => {
    if (typeof currentValue.value === 'number') {
      return currentValue.value
    }

    if (currentValue.value === '' || currentValue.value == null) {
      return null
    }

    const parsedValue = Number(currentValue.value)
    return Number.isNaN(parsedValue) ? null : parsedValue
  },
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const radioValue = computed<string | number | boolean | null | undefined>({
  get: () => (currentValue.value ?? null) as string | number | boolean | null | undefined,
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const checkboxValue = computed<Array<string | number> | null | undefined>({
  get: () => {
    if (Array.isArray(currentValue.value)) {
      return currentValue.value
    }

    return []
  },
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const switchValue = computed<string | number | boolean | undefined>({
  get: () => (currentValue.value ?? false) as string | number | boolean | undefined,
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const dateValue = computed<number | [number, number] | null | undefined>({
  get: () => (currentValue.value ?? null) as number | [number, number] | null | undefined,
  set: (value) => {
    props.setValue(props.schema, value)
  },
})

const slotName = computed(() => props.schema.key)

const options = computed<FormOption[]>(() => {
  const rawOptions = props.schema.prop?.options
  return Array.isArray(rawOptions) ? (rawOptions as FormOption[]) : []
})

const componentSize = computed(() => props.schema.size ?? props.formSize)

const normalizedEvents = computed<Record<string, unknown>>(() => {
  const result: Record<string, unknown> = {}
  const eventMap = props.schema.on || {}

  for (const [eventName, handler] of Object.entries(eventMap)) {
    if (eventName.startsWith('on')) {
      result[eventName] = handler
      continue
    }

    if (eventName.includes(':')) {
      const [name, suffix] = eventName.split(':')
      const normalizedName = name.charAt(0).toUpperCase() + name.slice(1)
      result[`on${normalizedName}:${suffix}`] = handler
      continue
    }

    const normalizedName = eventName.charAt(0).toUpperCase() + eventName.slice(1)
    result[`on${normalizedName}`] = handler
  }

  return result
})

const mergedProps = computed<Record<string, unknown>>(() => {
  const restProps = props.schema.prop || {}
  const nextProps: Record<string, unknown> = {
    ...restProps,
    size: componentSize.value,
    disabled: props.schema.disabled,
  }

  if (
    ['input', 'textarea', 'input-number', 'select', 'date-picker'].includes(props.schema.type) &&
    props.schema.placeholder
  ) {
    nextProps.placeholder = props.schema.placeholder
  }

  if (props.schema.type === 'textarea') {
    nextProps.type = 'textarea'
  }

  return nextProps
})

const renderContext = computed(() => ({
  model: props.model,
  schema: props.schema,
  value: currentValue.value,
  setValue: (value: unknown) => {
    props.setValue(props.schema, value)
  },
}))
</script>

<template>
  <RenderFactory v-if="schema.render" :render="() => schema.render!(renderContext)" />
  <slot
    v-else-if="slots[slotName]"
    :name="slotName"
    :model="model"
    :schema="schema"
    :value="currentValue"
    :set-value="renderContext.setValue"
  />
  <n-input
    v-else-if="schema.type === 'input' || schema.type === 'textarea'"
    v-model:value="inputValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <n-input-number
    v-else-if="schema.type === 'input-number'"
    v-model:value="inputNumberValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <n-select
    v-else-if="schema.type === 'select'"
    v-model:value="selectValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <Dict
    v-else-if="schema.type === 'dict'"
    v-model:value="selectValue"
    :dict-code="schema.dictCode || ''"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <n-radio-group
    v-else-if="schema.type === 'radio'"
    v-model:value="radioValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  >
    <n-space :size="16">
      <n-radio
        v-for="option in options"
        :key="`${schema.key}-${option.value}`"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </n-radio>
    </n-space>
  </n-radio-group>
  <n-checkbox-group
    v-else-if="schema.type === 'checkbox'"
    v-model:value="checkboxValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  >
    <n-space :size="16">
      <n-checkbox
        v-for="option in options"
        :key="`${schema.key}-${option.value}`"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </n-checkbox>
    </n-space>
  </n-checkbox-group>
  <n-switch
    v-else-if="schema.type === 'switch'"
    v-model:value="switchValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <n-date-picker
    v-else-if="schema.type === 'date-picker'"
    v-model:value="dateValue"
    v-bind="mergedProps"
    v-on="normalizedEvents"
  />
  <div v-else class="dynamic-form__empty-field" />
</template>

<style scoped>
.dynamic-form__empty-field {
  min-height: 34px;
}
</style>
