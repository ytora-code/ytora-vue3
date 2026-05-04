<script setup lang="ts" generic="TRow extends TableRowData = TableRowData">
import type { TableRowData } from './type/TableRenderContext'
import { computed } from 'vue'
import { NImage, NSpace, NSwitch, NTag } from 'naive-ui'

import RenderFactory from '@/components/form/RenderFactory.vue'
import type ResolvedDynamicTableSchema from './type/ResolvedDynamicTableSchema'

type SwitchValue = string | number | boolean | undefined

const props = defineProps<{
  row: TRow
  rowIndex: number
  schema: ResolvedDynamicTableSchema<TRow>
  value: unknown
  setValue: (value: unknown) => void
}>()

const slots = useSlots()

const slotName = computed(() => props.schema.key)

const stringValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') {
    return props.schema.emptyText
  }

  if (props.schema.formatter) {
    const formatted = props.schema.formatter(props.value, props.row, props.schema, props.rowIndex)
    return formatted === null || formatted === undefined || formatted === ''
      ? props.schema.emptyText
      : String(formatted)
  }

  return String(props.value)
})

const tagItems = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return []

  const source = Array.isArray(props.value)
    ? props.value
    : String(props.value)
        .split(props.schema.tagSplitPattern)
        .map((item) => item.trim())
        .filter(Boolean)

  return source.map((item) => {
    const key = String(item)
    const option = props.schema.tagMap?.[key]

    return {
      key,
      label: option?.label ?? key,
      type: option?.type ?? 'default',
      bordered: option?.bordered ?? false,
      round: option?.round ?? true,
    }
  })
})

const linkHref = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return ''
  return String(props.value)
})

const linkText = computed(() => props.schema.linkText ?? stringValue.value)

const imageSrc = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return ''
  return String(props.value)
})

const switchValue = computed<SwitchValue>({
  get: () => props.value as SwitchValue,
  set: (value) => {
    props.setValue(value)
  },
})

const renderContext = computed(() => ({
  row: props.row,
  rowIndex: props.rowIndex,
  schema: props.schema,
  value: props.value,
  setValue: props.setValue,
}))
</script>

<template>
  <RenderFactory v-if="schema.render" :render="() => schema.render!(renderContext)" />
  <slot
    v-else-if="slots[slotName]"
    :name="slotName"
    :row="row"
    :row-index="rowIndex"
    :schema="schema"
    :value="value"
    :set-value="setValue"
  />
  <a
    v-else-if="schema.type === 'link' && linkHref"
    class="dynamic-table__link"
    :href="linkHref"
    :target="schema.linkTarget"
    :rel="schema.linkRel"
  >
    {{ linkText }}
  </a>
  <span v-else-if="schema.type === 'number' || schema.type === 'date' || schema.type === 'text'">
    {{ stringValue }}
  </span>
  <div v-else-if="schema.type === 'image' && imageSrc" class="dynamic-table__image-wrapper">
    <n-image
      class="dynamic-table__image"
      :src="imageSrc"
      :alt="schema.imageAlt || schema.title || schema.key"
      :width="schema.imageWidth || 40"
      :height="schema.imageHeight || 40"
      :fallback-src="schema.imageFallbackSrc"
      :preview-disabled="schema.imagePreviewDisabled ?? false"
      object-fit="cover"
    />
  </div>
  <span v-else-if="schema.type === 'image'">{{ schema.emptyText }}</span>
  <n-space v-else-if="schema.type === 'tag' && tagItems.length" :size="8" wrap>
    <n-tag
      v-for="item in tagItems"
      :key="`${schema.key}-${item.key}`"
      :type="item.type"
      :bordered="item.bordered"
      :round="item.round"
      size="small"
    >
      {{ item.label }}
    </n-tag>
  </n-space>
  <span v-else-if="schema.type === 'tag'">{{ schema.emptyText }}</span>
  <n-switch
    v-else-if="schema.type === 'switch'"
    v-model:value="switchValue"
    :checked-value="schema.switchCheckedValue ?? true"
    :unchecked-value="schema.switchUncheckedValue ?? false"
    :disabled="schema.switchDisabled"
  >
    <template #checked>{{ schema.switchCheckedText }}</template>
    <template #unchecked>{{ schema.switchUncheckedText }}</template>
  </n-switch>
  <span v-else-if="schema.type === 'slot'">{{ schema.emptyText }}</span>
  <span v-else>{{ stringValue }}</span>
</template>

<style scoped>
.dynamic-table__link {
  color: var(--global-color-primary);
  text-decoration: none;
}

.dynamic-table__link:hover {
  text-decoration: underline;
}

.dynamic-table__image {
  display: block;
  overflow: hidden;
  border-radius: 1px;
}

.dynamic-table__image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
</style>
