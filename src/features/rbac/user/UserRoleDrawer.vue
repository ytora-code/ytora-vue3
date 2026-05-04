<script setup lang="ts">
import { computed } from 'vue'
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useUserRole from '@/features/rbac/user/composable/useUserRole'
import useUserRoleSchema from '@/features/rbac/user/composable/useUserRoleSchema'
import type SysUserRoleData from '@/features/rbac/role/type/data/SysUserRoleData'
import type UserRoleDrawerExpose from '@/features/rbac/user/type/UserRoleDrawerExpose'

const { searchFormSchemas, tableSchemas } = useUserRoleSchema()

const {
  visible,
  tableLoading,
  currentUserName,
  searchFormModel,
  pageNo,
  pageSize,
  total,
  records,
  open,
  close,
  handleAfterLeave,
  search,
  resetSearch,
  pageChange,
  pageSizeChange,
  toggleRole,
  isRoleUpdating,
} = useUserRole()

defineExpose<UserRoleDrawerExpose>({
  open,
})

const modalStyle = computed(() => ({
  width: 'min(780px, calc(100vw - 32px))',
}))

const handleOwnerChange = async (row: SysUserRoleData, value: boolean) => {
  await toggleRole(row, value)
}
</script>

<template>
  <n-modal
    :show="visible"
    preset="card"
    :title="`当前用户：${currentUserName}`"
    :style="modalStyle"
    :bordered="false"
    size="huge"
    :mask-closable="false"
    @update:show="(value) => !value && close()"
    @after-leave="handleAfterLeave"
  >
    <div class="user-role-drawer">
      <DynamicForm
        v-model="searchFormModel"
        :schemas="searchFormSchemas"
        submit-text="查 询"
        submit-icon="i-lucide-search"
        reset-text="重 置"
        reset-icon="i-lucide-rotate-ccw"
        action-placement="inline"
        :show-feedback="false"
        @submit="search"
        @reset="resetSearch"
      />

      <DynamicTable
        v-model:data="records"
        :schemas="tableSchemas"
        :loading="tableLoading"
        :row-key="(row) => row.roleId || row.id"
        empty-description="暂无角色数据"
      >
        <template #owner="{ row }">
          <n-switch
            :value="row.owner"
            :loading="isRoleUpdating(row.roleId || row.id)"
            @update:value="handleOwnerChange(row, $event)"
          >
            <template #checked />
            <template #unchecked />
          </n-switch>
        </template>
      </DynamicTable>

      <div class="pagination-bar">
        <n-pagination
          :page="pageNo"
          :page-size="pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 30, 50]"
          :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
          show-size-picker
          show-quick-jumper
          @update:page="pageChange"
          @update:page-size="pageSizeChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <n-button @click="close">关 闭</n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.user-role-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 220px);
  overflow: auto;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
