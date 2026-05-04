<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import DynamicForm from '@/components/form/index.vue'
import { message } from '@/utils/naiveApi'
import sysPermissionApi from '../api/SysPermissionApi'
import {
  createInitialPermissionModel,
  normalizePermissionForForm,
  ROOT_PID,
  type FormInstance,
} from '../composable/permissionShared'
import type SysPermissionParam from '../type/SysPermissionParam'
import usePermissionManager from '../composable/usePermissionManager'
import useSchema from '../composable/useSchema'

const { permissionFormSchemas, permissionFormRules } = useSchema()
const { currentPermission, loadTree } = usePermissionManager()

const detailLoading = ref(false)
const saveLoading = ref(false)
const detailFormModel = ref<SysPermissionParam>(createInitialPermissionModel())
const detailFormRef = ref<FormInstance | null>(null)
const loadedPermissionId = ref('')

const title = computed(() => '保 存')

const resetDetailState = () => {
  detailFormModel.value = createInitialPermissionModel()
  loadedPermissionId.value = ''
}

const loadDetail = async (force = false) => {
  if (!currentPermission.value?.id) {
    resetDetailState()
    return
  }

  if (!force && loadedPermissionId.value === currentPermission.value.id) {
    return
  }

  detailLoading.value = true

  try {
    const result = await sysPermissionApi.queryById(currentPermission.value.id)
    detailFormModel.value = normalizePermissionForForm(result)
    loadedPermissionId.value = currentPermission.value.id
  } catch (error) {
    console.error(error)
    resetDetailState()
  } finally {
    detailLoading.value = false
  }
}

const submitDetail = async () => {
  if (!currentPermission.value?.id) {
    message.warning('请先选择菜单')
    return
  }

  await detailFormRef.value?.validate()
  saveLoading.value = true

  try {
    await sysPermissionApi.upsert({
      ...detailFormModel.value,
      id: currentPermission.value.id,
      pid: detailFormModel.value.pid ?? ROOT_PID,
    })
    await loadDetail(true)
    await loadTree(currentPermission.value.id)
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

watch(
  () => currentPermission.value?.id,
  async (permissionId, previousPermissionId) => {
    if (!permissionId) {
      resetDetailState()
      return
    }

    if (permissionId !== previousPermissionId) {
      loadedPermissionId.value = ''
    }

    await loadDetail()
  },
  { immediate: true },
)
</script>

<template>
  <div class="permission-page__tab-section">
    <div class="permission-page__tab-toolbar">
      <n-button type="primary" :loading="saveLoading" @click="submitDetail">{{ title }}</n-button>
    </div>

    <n-spin :show="detailLoading">
      <DynamicForm
        ref="detailFormRef"
        v-model="detailFormModel"
        :schemas="permissionFormSchemas"
        :rules="permissionFormRules"
        :show-action-row="false"
        label-width="110"
      />
    </n-spin>
  </div>
</template>

<style scoped>
.permission-page__tab-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-page__tab-toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
