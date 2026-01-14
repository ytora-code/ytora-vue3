<script setup lang="ts" generic="T extends Record<string, any>">
import { useUserStore } from '@/stores/userStore.ts'
import type FormItem from '@/components/form/type/FormItem.ts'
import Dict from '@/components/dict/index.vue'

const userStore = useUserStore()

const props = defineProps<{
  formCode: string
}>()

const modelValue = defineModel<T>({
  required: true,
})

const formItems = computed(() => {
  const forms = userStore.forms
  if (!forms) return []
  const formRoot = forms.find((c) => c.permissionCode === props.formCode)
  if (!formRoot?.children) return []
  console.log(formRoot.children)
  const items: FormItem[] = formRoot.children
    .filter((item) => !!item.meta?.type)
    .map((item) => {
      const meta = item.meta || {}
      const attr = (meta.attr as Record<string, unknown>) || {}
      return {
        id: item.id,
        type: meta.type as string,
        label: item.permissionName,
        key: meta.key as string,
        width: meta.width as number ?? 120,
        attr,
      }
    })
  return items
})

</script>

<template>
  <!-- 表单组件 -->
  <div class="form-container">
    <n-form v-bind="$attrs">
      <n-form-item v-for="item in formItems" :key="item.id" :label="item.label" :path="item.key">
        <!-- 输入框 -->
        <n-input
          v-if="item.type === 'form-item::input'"
          v-model:value="modelValue[item.key]"
          v-bind="item.attr"
        />

        <!-- 数字输入框 -->
        <n-input-number
          v-if="item.type === 'form-item::numInput'"
          v-model:value="modelValue[item.key]"
          v-bind="item.attr"
        />

        <!-- 日期输入框 -->
        <n-date-picker
          v-if="item.type === 'form-item::date'"
          v-model:formatted-value="modelValue[item.key]"
          :value-format="item.attr.format ?? 'yyyy-MM-dd'"
          :type="item.attr.type ?? 'date'"
          v-bind="item.attr"
        />

        <!-- 字典下拉框 -->
        <dict
          v-if="item.type === 'form-item::dict'"
          :dictCode="item.attr.dictCode as string"
          v-model:value="modelValue[item.key]"
          :style="{ width: item.width + 'px' }"
          v-bind="item.attr"
        />

        <!-- 开关 -->
        <n-switch v-if="item.type === 'form-item::switch'" v-model:value="modelValue[item.key]" v-bind="item.attr">
          <template #checked>{{ item.attr['checked'] }}</template>
          <template #unchecked>{{ item.attr['unchecked'] }}</template>
        </n-switch>
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped></style>
