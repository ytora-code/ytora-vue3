<script setup lang="ts" generic="TModel extends FormModelValue = FormModelValue">
import { computed, ref } from 'vue'
import { NButton, NForm, NFormItem, type FormInst, type FormRules } from 'naive-ui'

import FieldRenderer from './FieldRenderer.vue'
import { useFormLayout } from './composable/useFormLayout'
import { useFormModel } from './composable/useFormModel'
import { useFormSchema } from './composable/useFormSchema'
import type { DynamicFormSlots } from './type/DynamicFormSlots'
import type DynamicFormSchema from './type/DynamicFormSchema'
import type { FormFieldKey, FormModelValue } from './type/FormRenderContext'
import { renderIcon } from '@/features/sys/icon/composable/icon'

const props = withDefaults(
  defineProps<{
    modelValue?: TModel
    schemas?: DynamicFormSchema<TModel>[]
    rules?: FormRules
    labelWidth?: number | string
    labelPosition?: 'left' | 'top'
    size?: 'small' | 'medium' | 'large'
    minHeight?: number | string
    maxHeight?: number | string
    minWidth?: number | string
    maxWidth?: number | string
    loading?: boolean
    disabled?: boolean
    showFeedback?: boolean
    showActionRow?: boolean
    submitText?: string
    resetText?: string
    submitIcon?: string
    resetIcon?: string
    actionPlacement?: 'bottom-left' | 'bottom-right' | 'inline'
  }>(),
  {
    modelValue: () => ({}) as TModel,
    schemas: () => [],
    rules: undefined,
    labelWidth: 100,
    labelPosition: 'left',
    size: 'medium',
    minHeight: undefined,
    maxHeight: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    loading: false,
    disabled: false,
    showFeedback: true,
    showActionRow: true,
    submitIcon: undefined,
    resetIcon: undefined,
    actionPlacement: 'bottom-left',
    submitText: '提交',
    resetText: '重置',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: TModel): void
  (e: 'submit', value: TModel): void
  (e: 'reset', value: TModel): void
  (
    e: 'field-change',
    payload: {
      key: string
      dataKey: FormFieldKey<TModel>
      value: unknown
      model: TModel
      schema: DynamicFormSchema<TModel>
    },
  ): void
}>()

defineSlots<DynamicFormSlots<TModel>>()
const formRef = ref<FormInst | null>(null)
const containerRef = ref<globalThis.HTMLElement | null>(null)

const { model, setFieldValue, setFieldsValue, resetFieldsValue } = useFormModel({
  modelValue: () => props.modelValue,
  schemas: () => props.schemas,
  emit,
})

const { resolvedSchemas } = useFormSchema({
  schemas: () => props.schemas,
  labelPosition: () => props.labelPosition,
  disabled: () => props.disabled,
})

const { gridItems, nextGridPosition } = useFormLayout({
  schemas: () => resolvedSchemas.value,
})

const loadingValue = computed(() => props.loading ?? false)
const submitIconRenderer = computed(() => renderIcon(props.submitIcon))
const resetIconRenderer = computed(() => renderIcon(props.resetIcon))
const isInlineAction = computed(() => props.actionPlacement === 'inline')
const actionRowClass = computed(() => ({
  'dynamic-form__actions': true,
  'dynamic-form__actions--right': props.actionPlacement === 'bottom-right',
}))
const inlineActionStyle = computed(() => {
  const remainingSpan = 25 - nextGridPosition.value.col
  const shouldWrapToNextRow = remainingSpan < 4

  return {
    gridColumn: shouldWrapToNextRow ? '1 / -1' : `${nextGridPosition.value.col} / -1`,
    gridRow: `${shouldWrapToNextRow ? nextGridPosition.value.row + 1 : nextGridPosition.value.row}`,
  }
})

const containerStyle = computed<Record<string, string>>(() => {
  const nextStyle: Record<string, string> = {}

  for (const [key, value] of Object.entries({
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  })) {
    if (value !== undefined) {
      nextStyle[key] = typeof value === 'number' ? `${value}px` : value
    }
  }

  return nextStyle
})

// Submit always validates first so consumers can trust the emitted model shape.
const handleSubmit = async () => {
  await formRef.value?.validate()
  emit('submit', model.value)
}

const handleReset = () => {
  resetFieldsValue()
  formRef.value?.restoreValidation()
  emit('reset', getFieldsValue())
}

const validate = async () => {
  await formRef.value?.validate()
}

const reset = () => {
  handleReset()
}

const getFieldsValue = () => ({ ...model.value }) as TModel

const scrollToField = (field: FormFieldKey<TModel>) => {
  const target = containerRef.value?.querySelector<globalThis.HTMLElement>(
    `[data-field="${field}"], [data-data-key="${field}"]`,
  )
  target?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  })
}

defineExpose({
  validate,
  reset,
  setFieldsValue,
  getFieldsValue,
  scrollToField,
})
</script>

<template>
  <div ref="containerRef" class="dynamic-form" :style="containerStyle">
    <slot name="header" />

    <n-form
      ref="formRef"
      class="dynamic-form__body"
      :model="model"
      :rules="rules"
      :label-width="labelWidth"
      :label-placement="labelPosition"
      :size="size"
      :disabled="disabled"
    >
      <div class="dynamic-form__grid">
        <div
          v-for="item in gridItems"
          :key="item.schema.key"
          class="dynamic-form__grid-item"
          :style="item.style"
          :data-field="item.schema.key"
          :data-data-key="item.schema.dataKey"
        >
          <n-form-item
            class="dynamic-form__form-item"
            :label="item.schema.label"
            :label-width="item.schema.labelWidth"
            :path="item.schema.dataKey"
            :rule="item.schema.rules"
            :label-placement="item.schema.labelPosition"
            :show-feedback="showFeedback"
          >
            <FieldRenderer
              :schema="item.schema"
              :model="model"
              :form-size="size"
              :set-value="setFieldValue"
            />
          </n-form-item>
        </div>

        <div
          v-if="showActionRow && isInlineAction"
          class="dynamic-form__grid-item dynamic-form__grid-item--actions"
          :style="inlineActionStyle"
        >
          <div class="dynamic-form__actions dynamic-form__actions--inline">
            <slot
              name="actions"
              :submit="handleSubmit"
              :reset="handleReset"
              :loading="loadingValue"
              :model="model"
            >
              <n-button type="primary" :loading="loadingValue" @click="handleSubmit">
                <template v-if="submitIconRenderer" #icon>
                  <component :is="submitIconRenderer" />
                </template>
                {{ submitText }}
              </n-button>
              <n-button type="primary" ghost @click="handleReset">
                <template v-if="resetIconRenderer" #icon>
                  <component :is="resetIconRenderer" />
                </template>
                {{ resetText }}
              </n-button>
            </slot>
          </div>
        </div>
      </div>

      <div v-if="showActionRow && !isInlineAction" :class="actionRowClass">
        <slot
          name="actions"
          :submit="handleSubmit"
          :reset="handleReset"
          :loading="loadingValue"
          :model="model"
        >
          <n-button type="primary" :loading="loadingValue" @click="handleSubmit">
            <template v-if="submitIconRenderer" #icon>
              <component :is="submitIconRenderer" />
            </template>
            {{ submitText }}
          </n-button>
          <n-button secondary @click="handleReset">
            <template v-if="resetIconRenderer" #icon>
              <component :is="resetIconRenderer" />
            </template>
            {{ resetText }}
          </n-button>
        </slot>
      </div>
    </n-form>

    <slot name="footer" />
  </div>
</template>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
}

.dynamic-form__body {
  min-height: 0;
}

.dynamic-form__grid {
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.dynamic-form__grid-item {
  min-width: 0;
}

.dynamic-form__grid-item--actions {
  min-width: 0;
}

.dynamic-form__form-item {
  height: 100%;
}

.dynamic-form__form-item :deep(.n-form-item-blank) {
  min-width: 0;
}

.dynamic-form__form-item :deep(.n-form-item-feedback-wrapper) {
  min-height: 22px;
}

.dynamic-form__form-item :deep(.n-form-item-feedback) {
  min-height: 16px;
  font-size: 12px;
  line-height: 16px;
}

.dynamic-form__form-item :deep(.n-form-item-feedback--error) {
  padding-top: 2px;
}

.dynamic-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.dynamic-form__actions--right {
  justify-content: flex-end;
}

.dynamic-form__actions--inline {
  margin-top: 0;
  width: 100%;
  height: 100%;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .dynamic-form__grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .dynamic-form__grid-item {
    grid-column: 1 / -1 !important;
    grid-row: auto !important;
  }

  .dynamic-form__actions--right {
    justify-content: flex-start;
  }
}
</style>
