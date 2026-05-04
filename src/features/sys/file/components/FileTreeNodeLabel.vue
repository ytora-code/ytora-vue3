<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { NButton, NInput, NSpace, type InputInst } from 'naive-ui'

const props = defineProps<{
  editing: boolean
  label: string
  modelValue: string
}>()

defineEmits<{
  cancel: []
  save: []
  'update:modelValue': [value: string]
}>()

const inputRef = ref<InputInst | null>(null)

const stopOnly = (event: globalThis.Event) => event.stopPropagation()
const stopAndPrevent = (event: globalThis.Event) => {
  event.preventDefault()
  event.stopPropagation()
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

watch(
  () => props.editing,
  async (editing) => {
    if (editing) {
      await focusInput()
    }
  },
  { immediate: true },
)
</script>

<template>
  <span v-if="!editing">{{ label }}</span>

  <div v-else @mousedown="stopAndPrevent" @click="stopOnly" @dblclick="stopAndPrevent">
    <n-space align="center" :wrap="false" :size="4">
      <n-input
        ref="inputRef"
        :value="modelValue"
        size="tiny"
        autofocus
        @update:value="$emit('update:modelValue', $event)"
        @mousedown="stopOnly"
        @click="stopOnly"
        @keyup.enter="$emit('save')"
        @keyup.esc="$emit('cancel')"
      />

      <n-button size="tiny" type="primary" ghost @mousedown="stopOnly" @click="$emit('save')">
        确定
      </n-button>

      <n-button size="tiny" ghost @mousedown="stopOnly" @click="$emit('cancel')"> 取消 </n-button>
    </n-space>
  </div>
</template>
