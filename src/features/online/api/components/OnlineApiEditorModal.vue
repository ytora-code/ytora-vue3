<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableColumns, FormRules } from 'naive-ui'
import { useRouter } from 'vue-router'

import CodeEditor from '@/components/coder/index.vue'
import DynamicForm from '@/components/form/index.vue'
import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type SysDynamicApiParam from '../type/SysDynamicApiParam'

interface FormInstance {
  validate: () => Promise<void>
}

type EditorTab = 'basic' | 'code'
type TestRow = Record<string, unknown>

const props = defineProps<{
  show: boolean
  title: string
  loading: boolean
  submitLoading: boolean
  closeIcon?: object | (() => unknown) | null
  model: SysDynamicApiParam
  activeTab: EditorTab
  basicFormSchemas: DynamicFormSchema<SysDynamicApiParam>[]
  basicFormRules: FormRules
  codeFormSchemas: DynamicFormSchema<SysDynamicApiParam>[]
  codeFormRules: FormRules
  testLoading: boolean
  testResultRows: TestRow[]
  testResultColumns: DataTableColumns<TestRow>
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:activeTab', value: EditorTab): void
  (e: 'update:model', value: SysDynamicApiParam): void
  (e: 'submit'): void
  (e: 'execute-test'): void
  (e: 'after-leave'): void
}>()

const basicFormRef = ref<FormInstance | null>(null)
const codeFormRef = ref<FormInstance | null>(null)
const router = useRouter()
const localModel = computed({
  get: () => props.model,
  set: (value: SysDynamicApiParam) => {
    emit('update:model', value)
  },
})

const contentModel = computed({
  get: () => localModel.value.content ?? '',
  set: (value: string) => {
    localModel.value = {
      ...localModel.value,
      content: value,
    }
  },
})

const testParamModel = computed({
  get: () => localModel.value.testParam ?? '{\n  \n}',
  set: (value: string) => {
    localModel.value = {
      ...localModel.value,
      testParam: value,
    }
  },
})

const resultDescModel = computed({
  get: () => localModel.value.resultDesc ?? '',
  set: (value: string) => {
    localModel.value = {
      ...localModel.value,
      resultDesc: value,
    }
  },
})

const handleClose = () => {
  emit('update:show', false)
}

const openDslGuide = () => {
  const route = router.resolve('/online/api/dsl-guide')
  window.open(route.href, '_blank', 'noopener,noreferrer')
}

const handleSubmit = async () => {
  await basicFormRef.value?.validate()
  await codeFormRef.value?.validate()
  emit('submit')
}
</script>

<template>
  <n-modal
    :show="show"
    class="online-api-fullscreen-modal"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
    @after-leave="emit('after-leave')"
  >
    <div class="online-api-fullscreen">
      <div class="online-api-fullscreen__header">
        <div class="online-api-fullscreen__title">{{ title }}</div>

        <n-button quaternary circle @click="handleClose">
          <template v-if="closeIcon" #icon>
            <component :is="closeIcon" />
          </template>
        </n-button>
      </div>

      <n-spin :show="loading" class="online-api-fullscreen__spin">
        <div class="online-api-fullscreen__body">
          <n-tabs
            :value="activeTab"
            type="line"
            animated
            class="online-api-fullscreen__tabs"
            @update:value="emit('update:activeTab', $event)"
          >
            <n-tab-pane name="basic" tab="基础信息">
              <DynamicForm
                ref="basicFormRef"
                v-model="localModel"
                :schemas="basicFormSchemas"
                :rules="basicFormRules"
                :show-action-row="false"
                label-width="100"
              />
            </n-tab-pane>

            <n-tab-pane name="code" tab="代码编辑">
              <div class="online-api-editor">
                <DynamicForm
                  ref="codeFormRef"
                  v-model="localModel"
                  :schemas="codeFormSchemas"
                  :rules="codeFormRules"
                  :show-action-row="false"
                  label-width="110"
                />

                <div class="online-api-editor__section">
                  <n-button w-10 text type="primary" @click="openDslGuide">语法说明</n-button>
                  <CodeEditor
                    v-model="contentModel"
                    language="dsl"
                    height="48vh"
                    placeholder="请输入动态SQL DSL内容"
                  />
                </div>

                <div class="online-api-editor__section">
                  <div class="online-api-editor__header">
                    <div class="online-api-editor__label">测试参数(JSON对象)</div>
                    <n-button type="primary" ghost :loading="testLoading" @click="emit('execute-test')">
                      测试执行
                    </n-button>
                  </div>
                  <CodeEditor
                    v-model="testParamModel"
                    language="json"
                    height="24vh"
                    placeholder="请输入JSON对象，例如 {&quot;id&quot;: 1}"
                  />
                </div>

                <div class="online-api-editor__section">
                  <div class="online-api-editor__label">执行结果{{ `(${testResultRows.length})` }}</div>
                  <n-spin :show="testLoading">
                    <div
                      v-if="testResultColumns.length > 0"
                      class="online-api-editor__result-table"
                    >
                      <n-data-table
                        :columns="testResultColumns"
                        :data="testResultRows"
                        :bordered="false"
                        :single-line="false"
                        size="small"
                        :scroll-x="Math.max(testResultColumns.length * 160, 640)"
                        max-height="28vh"
                      />
                    </div>
                    <n-empty v-else description="暂无测试结果" />
                  </n-spin>
                </div>

                <div class="online-api-editor__section">
                  <div class="online-api-editor__label">返回字段说明</div>
                  <CodeEditor
                    v-model="resultDescModel"
                    language="json"
                    height="18vh"
                    placeholder="请输入接口返回字段说明，供其他人查看参考"
                  />
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-spin>

      <div class="online-api-fullscreen__footer">
        <div class="online-api-fullscreen__footer-actions">
          <n-button @click="handleClose">取 消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">保 存</n-button>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.online-api-editor {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-height: 0;
  min-width: 0;
  overflow-x: hidden;
}

.online-api-editor__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.online-api-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.online-api-editor__label {
  color: var(--global-text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.online-api-editor__result-table {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.online-api-editor__result-table :deep(.n-data-table) {
  width: 100%;
  min-width: 100%;
}

.online-api-fullscreen {
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-width: 0;
  overflow: hidden;
  height: 100vh;
  background: var(--global-bg-container);
}

.online-api-fullscreen__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  padding: 16px 20px;
  border-bottom: 1px solid var(--global-border-color);
}

.online-api-fullscreen__title {
  color: var(--global-text-color);
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
}

.online-api-fullscreen__spin {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

:deep(.online-api-fullscreen__spin .n-spin-content) {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.online-api-fullscreen__body {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
}

.online-api-fullscreen__tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 100%;
  overflow: hidden;
}

:deep(.online-api-fullscreen__tabs .n-tabs-nav) {
  flex: 0 0 auto;
}

:deep(.online-api-fullscreen__tabs .n-tabs-pane-wrapper) {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

:deep(.online-api-fullscreen__tabs .n-tab-pane) {
  min-width: 0;
  overflow-x: hidden;
}

.online-api-fullscreen__footer {
  flex: 0 0 auto;
  padding: 16px 20px;
  border-top: 1px solid var(--global-border-color);
  background: var(--global-bg-container);
}

.online-api-fullscreen__footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.online-api-fullscreen-modal .n-modal) {
  margin: 0;
  padding: 0;
  max-width: none;
  box-shadow: none;
}
</style>
