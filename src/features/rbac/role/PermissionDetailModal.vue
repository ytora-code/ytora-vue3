<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DynamicTable from '@/components/table/index.vue'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import { message } from '@/utils/naiveApi'
import dataScopeApi from '@/features/rbac/datascope/api/SysDataScopeApi'
import type SysDataScopeData from '@/features/rbac/datascope/type/SysDataScopeData'
import type SysDataScopeGroupData from '@/features/rbac/datascope/type/SysDataScopeGroupData'
import usePermissionDataScope from '@/features/rbac/permission/composable/usePermissionDataScope'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import dataScopeGroupApi from '@/features/rbac/datascope/api/SysDataScopeGroupApi'

const props = defineProps<{
  show: boolean
  roleId: string | null
  permission: SysPermissionData | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const close = () => {
  emit('update:show', false)
}

const activeTab = ref<'data-scope' | 'table' | 'form'>('data-scope')
const permissionId = computed(() => props.permission?.id ?? null)
const submitLoading = ref(false)
const scopeModalVisible = ref(false)
const scopeLoading = ref(false)
const scopeSubmitLoading = ref(false)
const currentGroup = ref<SysDataScopeGroupData | null>(null)
const scopeRecords = ref<SysDataScopeData[]>([])
const checkedScopeKeys = ref<string[]>([])

const {
  groupLoading,
  groupPageNo,
  groupPageSize,
  groupTotal,
  groupRecords,
  roleGroupTableSchemas,
  handleGroupPageChange,
  handleGroupPageSizeChange,
} = usePermissionDataScope(permissionId)

const scopeTableSchemas: DynamicTableSchema<SysDataScopeData>[] = [
  { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
  { title: '名称', key: 'name', dataKey: 'name', minWidth: 160 },
  { title: '类型', key: 'type', dataKey: 'type', minWidth: 160 },
  { title: '规则值', key: 'value', dataKey: 'value', minWidth: 260, ellipsis: true },
]

// 当前角色在当前菜单拥有的数据范围分组
const checkedGroupKeys = ref<string[]>([])

// 查询当前角色在当前菜单拥有的数据范围分组
const listRoleGroup = async () => {
  const show = props.show
  const roleId = props.roleId
  const currentPermissionId = props.permission?.id
  if (!show || !roleId || !currentPermissionId) {
    checkedGroupKeys.value = []
    return
  }

  try {
    checkedGroupKeys.value = await dataScopeGroupApi.listGroup({
      roleId,
      permissionId: currentPermissionId,
    })
  } catch (error) {
    console.error(error)
    checkedGroupKeys.value = []
  }
}

// 提交该角色在当前菜单下最新的分组数据
const refreshRoleGroup = async () => {
  if (!props.roleId || !permissionId.value) {
    message.warning('缺少角色或资源信息，无法提交分组配置')
    return
  }

  submitLoading.value = true

  try {
    await dataScopeGroupApi.refreshRoleGroup({
      roleId: props.roleId,
      permissionId: permissionId.value,
      groupIds: checkedGroupKeys.value.map((item) => String(item)),
    })
    await listRoleGroup()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const closeScopeModal = () => {
  scopeModalVisible.value = false
  scopeLoading.value = false
  scopeSubmitLoading.value = false
  currentGroup.value = null
  scopeRecords.value = []
  checkedScopeKeys.value = []
}

const openScopeModal = async (group: SysDataScopeGroupData) => {
  if (!props.roleId || !group?.id) {
    message.warning('缺少角色或分组信息，无法查看数据范围')
    return
  }

  currentGroup.value = group
  scopeModalVisible.value = true
  scopeLoading.value = true

  try {
    const [records, checkedKeys] = await Promise.all([
      dataScopeApi.listByGroupId({
        groupId: Number(group.id),
        pageNo: 1,
        pageSize: 999,
      }),
      dataScopeApi.listDataScopeByGroupId({
        roleId: props.roleId,
        groupId: String(group.id),
      }),
    ])
    scopeRecords.value = records
    checkedScopeKeys.value = checkedKeys
  } catch (error) {
    console.error(error)
    scopeRecords.value = []
    checkedScopeKeys.value = []
  } finally {
    scopeLoading.value = false
  }
}

const refreshRoleGroupDataScope = async () => {
  if (!props.roleId || !currentGroup.value?.id) {
    message.warning('缺少角色或分组信息，无法提交数据范围配置')
    return
  }

  scopeSubmitLoading.value = true

  try {
    await dataScopeApi.refreshRoleGroupDataScope({
      roleId: props.roleId,
      groupId: String(currentGroup.value.id),
      scopeIds: checkedScopeKeys.value.map((item) => String(item)),
    })
    checkedScopeKeys.value = await dataScopeApi.listDataScopeByGroupId({
      roleId: props.roleId,
      groupId: String(currentGroup.value.id),
    })
  } catch (error) {
    console.error(error)
  } finally {
    scopeSubmitLoading.value = false
  }
}

watch(
  () => [props.show, props.roleId, props.permission?.id] as const,
  async () => {
    await listRoleGroup()
  },
  { immediate: true },
)

watch(
  () => props.show,
  (show) => {
    if (!show) {
      closeScopeModal()
    }
  },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="资源详情"
    :style="{ width: 'min(800px, calc(100vw - 32px))', height: 'min(580px, calc(100vw - 64px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && close()"
  >
    <div class="permission-detail-modal__content">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 数据范围 -->
        <n-tab-pane name="data-scope" tab="数据范围">
          <DynamicTable
            v-model:data="groupRecords"
            v-model:checked-row-keys="checkedGroupKeys"
            :schemas="roleGroupTableSchemas"
            :loading="groupLoading"
            row-key="id"
            empty-description="当前资源暂无数据范围组"
          >
            <template #action="{ row }">
              <n-button type="primary" size="small" ghost @click="openScopeModal(row)">
                数据范围
              </n-button>
            </template>
          </DynamicTable>

          <div class="permission-scope__pagination">
            <n-pagination
              :page="groupPageNo"
              :page-size="groupPageSize"
              :item-count="groupTotal"
              :page-sizes="[10, 20, 30, 50]"
              :prefix="({ itemCount }) => `共 ${itemCount ?? 0} 条`"
              show-size-picker
              show-quick-jumper
              @update:page="handleGroupPageChange"
              @update:page-size="handleGroupPageSizeChange"
            />
          </div>
        </n-tab-pane>

        <n-tab-pane name="table" tab="表格">
          <n-empty description="表格配置暂未接入" />
        </n-tab-pane>

        <n-tab-pane name="form" tab="表单">
          <n-empty description="表格配置暂未接入" />
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="close">关 闭</n-button>
        <n-button type="primary" :loading="submitLoading" @click="refreshRoleGroup">确 认</n-button>
      </div>
    </template>
  </n-modal>

  <n-modal
    :show="scopeModalVisible"
    preset="card"
    :title="currentGroup?.name ? `数据范围：${currentGroup.name}` : '数据范围'"
    :style="{ width: 'min(920px, calc(100vw - 32px))' }"
    :bordered="false"
    :mask-closable="false"
    @update:show="(value) => !value && closeScopeModal()"
  >
    <n-spin :show="scopeLoading">
      <DynamicTable
        v-model:data="scopeRecords"
        v-model:checked-row-keys="checkedScopeKeys"
        :schemas="scopeTableSchemas"
        row-key="id"
        empty-description="当前分组暂无数据范围"
      />
    </n-spin>

    <template #footer>
      <div class="permission-detail-modal__footer">
        <n-button @click="closeScopeModal">关 闭</n-button>
        <n-button type="primary" :loading="scopeSubmitLoading" @click="refreshRoleGroupDataScope">
          确 认
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.permission-detail-modal__content {
  min-height: 160px;
}

.permission-detail-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-scope__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
