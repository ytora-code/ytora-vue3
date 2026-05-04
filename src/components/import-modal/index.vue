<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from '@/utils/naiveApi'

const props = withDefaults(
  defineProps<{
    show?: boolean
    title?: string
    width?: number | string
    accept?: string
    hintText?: string
    importLoading?: boolean
    templateLoading?: boolean
    cancelText?: string
    importText?: string
    templateText?: string
    downloadTemplate?: (() => void | Promise<void>) | undefined
    submitImport: (formData: globalThis.FormData) => void | Promise<void>
  }>(),
  {
    show: false,
    title: '导入文件',
    width: 520,
    accept: '.xls,.xlsx',
    hintText: '请先下载模板，按模板填写后再导入。',
    importLoading: false,
    templateLoading: false,
    cancelText: '取 消',
    importText: '开始导入',
    templateText: '下载模板',
    downloadTemplate: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'after-leave'): void
}>()

const inputRef = ref<globalThis.HTMLInputElement | null>(null)
const selectedFile = ref<globalThis.File | null>(null)

const modalStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))

const fileName = computed(() => selectedFile.value?.name || '')
const showTemplateAction = computed(() => typeof props.downloadTemplate === 'function')

const close = () => {
  emit('update:show', false)
}

const resetSelectedFile = () => {
  selectedFile.value = null

  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

const handleAfterLeave = () => {
  resetSelectedFile()
  emit('after-leave')
}

const triggerFileSelect = () => {
  inputRef.value?.click()
}

const handleFileChange = (event: globalThis.Event) => {
  const target = event.target as globalThis.HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
}

const submit = async () => {
  if (!selectedFile.value) {
    message.warning('请先选择要导入的文件')
    return
  }

  const formData = new globalThis.FormData()
  formData.append('file', selectedFile.value)
  await props.submitImport(formData)
}

const handleDownloadTemplate = async () => {
  await props.downloadTemplate?.()
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    :style="modalStyle"
    @update:show="emit('update:show', $event)"
    @after-leave="handleAfterLeave"
  >
    <div class="import-modal">
      <div v-if="showTemplateAction" class="import-modal__hint">
        <span>{{ hintText }}</span>
        <n-button text type="primary" :loading="templateLoading" @click="handleDownloadTemplate">
          {{ templateText }}
        </n-button>
      </div>

      <input
        ref="inputRef"
        class="import-modal__input"
        type="file"
        :accept="accept"
        @change="handleFileChange"
      >

      <div class="import-modal__file-box">
        <div class="import-modal__file-text">
          {{ fileName || '暂未选择文件' }}
        </div>
        <div class="import-modal__file-actions">
          <n-button @click="triggerFileSelect">选择文件</n-button>
          <n-button quaternary :disabled="!fileName" @click="resetSelectedFile">清空</n-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="import-modal__footer">
        <n-button @click="close">{{ cancelText }}</n-button>
        <n-button type="primary" :loading="importLoading" @click="submit">
          {{ importText }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.import-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-modal__hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--global-text-color-secondary);
}

.import-modal__input {
  display: none;
}

.import-modal__file-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border: 1px dashed var(--global-border-color);
  border-radius: 8px;
  background: #fafcff;
}

.import-modal__file-text {
  min-width: 0;
  color: var(--global-text-color);
  word-break: break-all;
}

.import-modal__file-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.import-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
