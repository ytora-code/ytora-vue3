<script setup lang="ts" generic="TRow extends TableRowData = TableRowData">
import type { TableRowData } from './type/TableRenderContext'
import { computed, onMounted, ref, watch } from 'vue'
import { NImage, NSpace, NSwitch, NTag } from 'naive-ui'
import type { SelectOption } from 'naive-ui'

import RenderFactory from '@/components/form/RenderFactory.vue'
import type ResolvedDynamicTableSchema from './type/ResolvedDynamicTableSchema'
import { useDictStore } from '@/stores/useDictStore'

type SwitchValue = string | number | boolean | undefined

const props = defineProps<{
  row: TRow
  rowIndex: number
  schema: ResolvedDynamicTableSchema<TRow>
  value: unknown
  setValue: (value: unknown) => void
}>()

const slots = useSlots()
const dictStore = useDictStore()

const slotName = computed(() => props.schema.key)
const dictOptions = ref<SelectOption[]>([])
const dictLoading = ref(false)

const loadDictOptions = async () => {
  if (props.schema.type !== 'dict' || !props.schema.dictCode) {
    dictOptions.value = []
    return
  }

  dictLoading.value = true
  try {
    dictOptions.value = await dictStore.getDict(props.schema.dictCode)
  } finally {
    dictLoading.value = false
  }
}

const isEmptyValue = (value: unknown) => value === null || value === undefined || value === ''

const stringValue = computed(() => {
  if (isEmptyValue(props.value)) {
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
  if (isEmptyValue(props.value)) return []

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

const dictOptionMap = computed(() => {
  const map = new Map<string, SelectOption>()

  dictOptions.value.forEach((option) => {
    map.set(String(option.value ?? ''), option)
  })

  return map
})

const dictItems = computed(() => {
  if (isEmptyValue(props.value)) return []

  const source = Array.isArray(props.value)
    ? props.value
    : String(props.value)
        .split(props.schema.tagSplitPattern)
        .map((item) => item.trim())
        .filter(Boolean)

  return source.map((item) => {
    const key = String(item)
    const option = dictOptionMap.value.get(key)

    return {
      key,
      label: String(option?.label ?? key),
    }
  })
})

const linkHref = computed(() => {
  if (isEmptyValue(props.value)) return ''
  return String(props.value)
})

const linkText = computed(() => props.schema.linkText ?? stringValue.value)

const imageSrc = computed(() => {
  if (isEmptyValue(props.value)) return ''
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

onMounted(() => {
  void loadDictOptions()
})

watch(
  () => [props.schema.type, props.schema.dictCode] as const,
  () => {
    void loadDictOptions()
  },
  { immediate: false },
)
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
  <n-space v-else-if="schema.type === 'dict' && dictItems.length" :size="8" wrap>
    <n-tag
      v-for="item in dictItems"
      :key="`${schema.key}-${item.key}`"
      type="primary"
      :bordered="false"
      size="small"
    >
      {{ item.label }}
    </n-tag>
  </n-space>
  <span v-else-if="schema.type === 'dict'">{{ dictLoading ? '加载中...' : schema.emptyText }}</span>
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
