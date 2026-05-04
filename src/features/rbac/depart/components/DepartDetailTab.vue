<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import userApi from '@/features/rbac/user/api/UserApi'
import type SysUserData from '@/features/rbac/user/type/SysUserData'
import type PageParam from '@/types/PageParam'
import { message } from '@/utils/naiveApi'
import sysDepartApi from '../api/SysDepartApi'
import {
  createInitialDepartModel,
  normalizeDepartForForm,
  ROOT_PID,
} from '../composable/departShared'
import useDepartManager from '../composable/useDepartManager'
import useSchema from '../composable/useSchema'
import type SysDepartParam from '../type/SysDepartParam'

interface FormInstance {
  validate: () => Promise<void>
}

const { bindUserTableSchemas, createDepartFormRules, createDepartFormSchemas } = useSchema()
const { currentDepart, loadTree } = useDepartManager()

const detailLoading = ref(false)
const saveLoading = ref(false)
const detailFormModel = ref<SysDepartParam>(createInitialDepartModel())
const detailFormRef = ref<FormInstance | null>(null)
const detailContactName = ref('')
const loadedDepartId = ref('')

const contactDialogVisible = ref(false)
const contactDialogLoading = ref(false)
const contactUserOptions = ref<SysUserData[]>([])
const contactUserPageNo = ref(1)
const contactUserPageSize = ref(10)
const contactUserTotal = ref(0)
const checkedContactUserKeys = ref<Array<string | number>>([])
const selectedContactUser = ref<SysUserData | null>(null)

const detailFormSchemas = computed(() =>
  createDepartFormSchemas({
    showDepartCode: true,
    disableDepartCode: true,
    contactName: detailContactName.value,
    openContactPicker: () => {
      void openContactPicker()
    },
    clearContact: () => {
      clearContact()
    },
  }),
)

const detailFormRules = computed(() =>
  createDepartFormRules({
    showDepartCode: true,
  }),
)

const resetDetailState = () => {
  detailFormModel.value = createInitialDepartModel()
  detailContactName.value = ''
  loadedDepartId.value = ''
}

const loadDetail = async (force = false) => {
  if (!currentDepart.value?.id) {
    resetDetailState()
    return
  }

  if (!force && loadedDepartId.value === currentDepart.value.id) {
    return
  }

  detailLoading.value = true

  try {
    const result = await sysDepartApi.queryById(currentDepart.value.id)
    detailFormModel.value = normalizeDepartForForm(result)
    detailContactName.value = result.contactId_DICT
    loadedDepartId.value = currentDepart.value.id
  } catch (error) {
    console.error(error)
    resetDetailState()
  } finally {
    detailLoading.value = false
  }
}

const loadContactUsers = async (params?: PageParam) => {
  contactDialogLoading.value = true

  try {
    const result = await userApi.page({
      pageNo: params?.pageNo ?? contactUserPageNo.value,
      pageSize: params?.pageSize ?? contactUserPageSize.value,
    })
    contactUserOptions.value = result.records
    contactUserPageNo.value = result.pageNo
    contactUserPageSize.value = result.pageSize
    contactUserTotal.value = result.total ?? result.records.length
  } catch (error) {
    console.error(error)
    contactUserOptions.value = []
    contactUserTotal.value = 0
  } finally {
    contactDialogLoading.value = false
  }
}

const openContactPicker = async () => {
  contactDialogVisible.value = true
  contactUserPageNo.value = 1
  checkedContactUserKeys.value = []
  selectedContactUser.value = null
  await loadContactUsers({ pageNo: 1, pageSize: contactUserPageSize.value })
}

const closeContactDialog = () => {
  contactDialogVisible.value = false
  contactDialogLoading.value = false
  contactUserOptions.value = []
  contactUserPageNo.value = 1
  contactUserTotal.value = 0
  checkedContactUserKeys.value = []
  selectedContactUser.value = null
}

const clearContact = () => {
  detailFormModel.value.contactId = undefined
  detailContactName.value = ''
}

const handleContactSelectionChange = (payload: {
  checkedRowKeys: Array<string | number>
  checkedRows: SysUserData[]
}) => {
  const latestUser = payload.checkedRows.at(-1) ?? null
  const latestKey = latestUser?.id ?? payload.checkedRowKeys.at(-1)

  checkedContactUserKeys.value = latestKey ? [latestKey] : []
  selectedContactUser.value = latestUser
}

const confirmContactSelection = () => {
  if (!selectedContactUser.value?.id) {
    message.warning('请选择一个负责人')
    return
  }

  detailFormModel.value.contactId = selectedContactUser.value.id
  detailContactName.value =
    selectedContactUser.value.realName?.trim() || selectedContactUser.value.userName?.trim() || ''
  closeContactDialog()
}

const handleContactUserPageChange = async (pageNo: number) => {
  await loadContactUsers({
    pageNo,
    pageSize: contactUserPageSize.value,
  })
}

const handleContactUserPageSizeChange = async (pageSize: number) => {
  await loadContactUsers({
    pageNo: 1,
    pageSize,
  })
}

const submitDetail = async () => {
  if (!currentDepart.value?.id) {
    message.warning('请先选择部门')
    return
  }

  await detailFormRef.value?.validate()
  saveLoading.value = true

  try {
    await sysDepartApi.upsert({
      ...detailFormModel.value,
      id: currentDepart.value.id,
      pid: detailFormModel.value.pid ?? ROOT_PID,
    })
    await loadDetail(true)
    await loadTree(currentDepart.value.id)
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

watch(
  () => currentDepart.value?.id,
  async (departId, previousDepartId) => {
    if (!departId) {
      resetDetailState()
      return
    }

    if (departId !== previousDepartId) {
      loadedDepartId.value = ''
    }

    await loadDetail()
  },
  { immediate: true },
)
</script>

<template>
  <div class="depart-page__tab-section">
    <div class="depart-page__tab-toolbar">
      <n-button type="primary" :loading="saveLoading" @click="submitDetail">保 存</n-button>
    </div>

    <n-spin :show="detailLoading">
      <DynamicForm
        ref="detailFormRef"
        v-model="detailFormModel"
        :schemas="detailFormSchemas"
        :rules="detailFormRules"
        :show-action-row="false"
        label-width="110"
      />
    </n-spin>

    <n-modal
      v-model:show="contactDialogVisible"
      preset="card"
      title="选择部门负责人"
      :style="{ width: 'min(920px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="contactDialogLoading">
        <div class="depart-page__tab-section">
          <div class="depart-page__tab-hint">请选择一个用户作为当前部门负责人</div>

          <DynamicTable
            v-model:data="contactUserOptions"
            v-model:checked-row-keys="checkedContactUserKeys"
            :schemas="bindUserTableSchemas"
            row-key="id"
            empty-description="暂无可选择用户"
            :min-height="180"
            @selection-change="handleContactSelectionChange"
          />

          <div class="depart-page__pagination-bar">
            <n-pagination
              :page="contactUserPageNo"
              :page-size="contactUserPageSize"
              :item-count="contactUserTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleContactUserPageChange"
              @update:page-size="handleContactUserPageSizeChange"
            />
          </div>
        </div>
      </n-spin>

      <template #footer>
        <div class="depart-page__dialog-footer">
          <n-button @click="closeContactDialog">取 消</n-button>
          <n-button type="primary" @click="confirmContactSelection">确 定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.depart-page__tab-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.depart-page__tab-toolbar {
  display: flex;
  justify-content: flex-end;
}

.depart-page__tab-hint {
  color: var(--global-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.depart-page__pagination-bar {
  display: flex;
  justify-content: flex-end;
}

.depart-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
