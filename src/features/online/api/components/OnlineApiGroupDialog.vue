<script setup lang="ts">
import type { FormRules } from 'naive-ui'

import DynamicForm from '@/components/form/index.vue'
import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type { GroupFormModel } from '../composable/onlineApiShared'

interface FormInstance {
  validate: () => Promise<void>
}

const props = defineProps<{
  show: boolean
  title: string
  loading: boolean
  submitLoading: boolean
  model: GroupFormModel
  schemas: DynamicFormSchema<GroupFormModel>[]
  rules: FormRules
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:model', value: GroupFormModel): void
  (e: 'submit'): void
  (e: 'after-leave'): void
}>()

const formRef = ref<FormInstance | null>(null)
const localModel = computed({
  get: () => props.model,
  set: (value: GroupFormModel) => {
    emit('update:model', value)
  },
})

const handleClose = () => {
  emit('update:show', false)
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  emit('submit')
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    :style="{ width: 'min(640px, calc(100vw - 32px))' }"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
    @after-leave="emit('after-leave')"
  >
    <n-spin :show="loading">
      <DynamicForm
        ref="formRef"
        v-model="localModel"
        :schemas="schemas"
        :rules="rules"
        :show-action-row="false"
        label-width="100"
      />
    </n-spin>

    <template #footer>
      <div class="online-api-dialog__footer">
        <n-button @click="handleClose">取 消</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleSubmit">保 存</n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.online-api-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
