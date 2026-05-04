<script setup lang="ts">
import { ref, watch } from 'vue'

import DynamicTable from '@/components/table/index.vue'
import type SysUserData from '@/features/rbac/user/type/SysUserData'
import { dialog, message } from '@/utils/naiveApi'
import sysDepartApi from '../api/SysDepartApi'
import useDepartManager from '../composable/useDepartManager'
import useSchema from '../composable/useSchema'
import type SysUserDepartParam from '../type/SysUserDepartParam'

const { bindUserTableSchemas, userTableSchemas } = useSchema()
const { currentDepart } = useDepartManager()

const userLoading = ref(false)
const bindUserLoading = ref(false)
const bindDialogVisible = ref(false)
const bindSubmitLoading = ref(false)

const currentUsers = ref<SysUserData[]>([])
const currentUserPageNo = ref(1)
const currentUserPageSize = ref(10)
const currentUserTotal = ref(0)
const checkedUserKeys = ref<Array<string | number>>([])

const bindUserOptions = ref<SysUserData[]>([])
const bindUserPageNo = ref(1)
const bindUserPageSize = ref(10)
const bindUserTotal = ref(0)
const checkedBindUserKeys = ref<Array<string | number>>([])

const loadedDepartId = ref('')

const buildMapperParam = (
  userIds: string[],
  departId: string,
  type: 'add' | 'delete',
): SysUserDepartParam => ({
  userIds,
  departId,
  type,
})

const resetUserState = () => {
  currentUsers.value = []
  currentUserPageNo.value = 1
  currentUserTotal.value = 0
  checkedUserKeys.value = []
  loadedDepartId.value = ''
}

const loadCurrentUsers = async (params?: { pageNo?: number; pageSize?: number }, force = false) => {
  if (!currentDepart.value?.id) {
    resetUserState()
    return
  }

  if (!force && loadedDepartId.value === currentDepart.value.id && !params) {
    return
  }

  userLoading.value = true

  try {
    const result = await sysDepartApi.pageUserByDepartId(currentDepart.value.id, {
      pageNo: params?.pageNo ?? currentUserPageNo.value,
      pageSize: params?.pageSize ?? currentUserPageSize.value,
    })
    currentUsers.value = result.records
    currentUserPageNo.value = result.pageNo
    currentUserPageSize.value = result.pageSize
    currentUserTotal.value = result.total ?? result.records.length
    checkedUserKeys.value = []
    loadedDepartId.value = currentDepart.value.id
  } catch (error) {
    console.error(error)
    currentUsers.value = []
    currentUserTotal.value = 0
  } finally {
    userLoading.value = false
  }
}

const loadBindUserOptions = async (params?: { pageNo?: number; pageSize?: number }) => {
  if (!currentDepart.value?.id) {
    return
  }

  bindUserLoading.value = true

  try {
    const result = await sysDepartApi.pageNonUserByDepartId(currentDepart.value.id, {
      pageNo: params?.pageNo ?? bindUserPageNo.value,
      pageSize: params?.pageSize ?? bindUserPageSize.value,
    })
    bindUserOptions.value = result.records
    bindUserPageNo.value = result.pageNo
    bindUserPageSize.value = result.pageSize
    bindUserTotal.value = result.total ?? result.records.length
    checkedBindUserKeys.value = []
  } catch (error) {
    console.error(error)
    bindUserOptions.value = []
    bindUserTotal.value = 0
  } finally {
    bindUserLoading.value = false
  }
}

const closeBindUserDialog = () => {
  bindDialogVisible.value = false
  bindSubmitLoading.value = false
  bindUserLoading.value = false
  bindUserOptions.value = []
  bindUserPageNo.value = 1
  bindUserTotal.value = 0
  checkedBindUserKeys.value = []
}

const refreshMapper = async (param: SysUserDepartParam) => {
  await sysDepartApi.refreshUserDepartMapper(param)
}

const openBindUserDialog = async () => {
  if (!currentDepart.value?.id) {
    message.warning('请先选择部门')
    return
  }

  bindDialogVisible.value = true
  bindUserPageNo.value = 1
  await loadBindUserOptions({
    pageNo: 1,
    pageSize: bindUserPageSize.value,
  })
}

const bindSelectedUsers = async () => {
  if (!currentDepart.value?.id) {
    message.warning('请先选择部门')
    return
  }

  if (!checkedBindUserKeys.value.length) {
    message.warning('请先选择要绑定的用户')
    return
  }

  bindSubmitLoading.value = true

  try {
    const selectedUserIds = checkedBindUserKeys.value.map((item) => String(item))
    await refreshMapper(buildMapperParam(selectedUserIds, currentDepart.value.id, 'add'))
    closeBindUserDialog()
    await loadCurrentUsers(undefined, true)
  } catch (error) {
    console.error(error)
    bindSubmitLoading.value = false
  }
}

const unbindUsers = async (userIds: string[]) => {
  if (!currentDepart.value?.id) {
    message.warning('请先选择部门')
    return
  }

  if (!userIds.length) {
    message.warning('请先选择要解绑的用户')
    return
  }

  userLoading.value = true

  try {
    await refreshMapper(buildMapperParam(userIds, currentDepart.value.id, 'delete'))
    await loadCurrentUsers(undefined, true)
  } catch (error) {
    console.error(error)
  } finally {
    userLoading.value = false
  }
}

const handleBatchUnbind = async () => {
  const userIds = checkedUserKeys.value.map((item) => String(item))
  if (!userIds.length) {
    message.warning('请先选择要解绑的用户')
    return
  }

  dialog.warning({
    title: '解绑确认',
    content: '确定要解绑当前选择的部门用户吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await unbindUsers(userIds)
    },
  })
}

const handleSingleUnbind = (user: SysUserData) => {
  if (!user.id) {
    message.warning('缺少用户ID，无法解绑')
    return
  }

  dialog.warning({
    title: '解绑确认',
    content: `确定要解绑用户“${user.realName || user.userName || user.id}”吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await unbindUsers([user.id])
    },
  })
}

const handleCurrentUserPageChange = async (pageNo: number) => {
  await loadCurrentUsers(
    {
      pageNo,
      pageSize: currentUserPageSize.value,
    },
    true,
  )
}

const handleCurrentUserPageSizeChange = async (pageSize: number) => {
  await loadCurrentUsers(
    {
      pageNo: 1,
      pageSize,
    },
    true,
  )
}

const handleBindUserPageChange = async (pageNo: number) => {
  await loadBindUserOptions({
    pageNo,
    pageSize: bindUserPageSize.value,
  })
}

const handleBindUserPageSizeChange = async (pageSize: number) => {
  await loadBindUserOptions({
    pageNo: 1,
    pageSize,
  })
}

watch(
  () => currentDepart.value?.id,
  async (departId, previousDepartId) => {
    if (!departId) {
      resetUserState()
      return
    }

    if (departId !== previousDepartId) {
      loadedDepartId.value = ''
    }

    await loadCurrentUsers()
  },
  { immediate: true },
)
</script>

<template>
  <div class="depart-page__tab-section">
    <div class="depart-page__tab-toolbar">
      <n-button type="primary" @click="openBindUserDialog">新增绑定用户</n-button>
      <n-button ghost type="error" :loading="userLoading" @click="handleBatchUnbind">
        批量解绑
      </n-button>
    </div>

    <DynamicTable
      v-model:data="currentUsers"
      v-model:checked-row-keys="checkedUserKeys"
      :schemas="userTableSchemas"
      :loading="userLoading"
      row-key="id"
      empty-description="当前部门暂无绑定用户"
      :min-height="140"
    >
      <template #action="{ row }">
        <n-button type="error" ghost size="small" @click="handleSingleUnbind(row)">解绑</n-button>
      </template>
    </DynamicTable>

    <div class="depart-page__pagination-bar">
      <n-pagination
        :page="currentUserPageNo"
        :page-size="currentUserPageSize"
        :item-count="currentUserTotal"
        :page-sizes="[10, 20, 30, 50]"
        :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
        show-size-picker
        show-quick-jumper
        @update:page="handleCurrentUserPageChange"
        @update:page-size="handleCurrentUserPageSizeChange"
      />
    </div>

    <n-modal
      v-model:show="bindDialogVisible"
      preset="card"
      title="新增绑定用户"
      :style="{ width: 'min(920px, calc(100vw - 32px))' }"
      :mask-closable="false"
    >
      <n-spin :show="bindUserLoading">
        <div class="depart-page__tab-section">
          <div class="depart-page__tab-hint">当前可绑定用户数：{{ bindUserTotal }}</div>

          <DynamicTable
            v-model:data="bindUserOptions"
            v-model:checked-row-keys="checkedBindUserKeys"
            :schemas="bindUserTableSchemas"
            row-key="id"
            empty-description="当前没有可绑定到该部门的用户"
            :min-height="180"
          />

          <div class="depart-page__pagination-bar">
            <n-pagination
              :page="bindUserPageNo"
              :page-size="bindUserPageSize"
              :item-count="bindUserTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleBindUserPageChange"
              @update:page-size="handleBindUserPageSizeChange"
            />
          </div>
        </div>
      </n-spin>

      <template #footer>
        <div class="depart-page__dialog-footer">
          <n-button @click="closeBindUserDialog">取 消</n-button>
          <n-button type="primary" :loading="bindSubmitLoading" @click="bindSelectedUsers">
            绑 定
          </n-button>
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
  gap: 12px;
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
