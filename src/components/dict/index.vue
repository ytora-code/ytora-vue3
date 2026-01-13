<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { SelectOption } from 'naive-ui'
import { useDictCache } from '@/stores/useDictCache.ts'

const dictCache = useDictCache()

type ModelValue = string | number | boolean | Date | undefined

const props = defineProps<{
  dictCode: string
  value?: ModelValue
}>()

const emit = defineEmits<{
  (e: 'update:value', value: ModelValue): void
}>()

const innerValue = computed<ModelValue>({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})

const options = ref<SelectOption[]>([])
const loading = ref(false)

const loadOptions = async () => {
  if (!props.dictCode) {
    options.value = []
    return
  }
  loading.value = true
  try {
    options.value = await dictCache.getDict(props.dictCode)
  } finally {
    loading.value = false
  }
}

onMounted(loadOptions)
watch(() => props.dictCode, loadOptions)
</script>

<template>
  <n-select v-bind="$attrs" v-model:value="innerValue" :options="options" :loading="loading" />
</template>
