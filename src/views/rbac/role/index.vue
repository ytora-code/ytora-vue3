<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { roleApi } from './api/RoleApi.ts'
import { permissionApi } from '../permission/api/PermissionApi.ts'
import { NButton, NFlex } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import type PageResp from '@/types/resp/PageResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysRoleReq from './type/req/SysRoleReq.ts'
import type SysRole from './type/resp/SysRole.ts'
import type { SysRolePermissionResp } from '@/views/rbac/permission/type/resp/SysRolePermissionResp.ts'

/**
 * 分页数据
 */
const pageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10,
})

/**
 * search表单数据
 */
const searchModel = reactive<SysRoleReq>({})

/**
 * 表格数据
 */
const tableLoading = ref(false)

/**
 * 抽屉显示状态
 */
const drawShowStatus = ref(false)

/**
 * 新增或编辑时的数据
 */
const currentModel = ref<SysRoleReq>({})

const tableModel = ref<PageResp<SysRole>>()

const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await roleApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
    pageModel.pageNo = tableModel.value.pageNo
    pageModel.pageSize = tableModel.value.pageSize
  } finally {
    tableLoading.value = false
  }
}

const reset = () => {
  resetDefault(searchModel)
  page()
}

const pageChange = (pageNo: number, pageSize: number) => {
  if (tableModel.value) {
    tableModel.value.pageNo = pageNo
    tableModel.value.pageSize = pageSize
  }
  pageModel.pageNo = pageNo
  pageModel.pageSize = pageSize
  page()
}

const action = (payload: { eventKey: string; row: SysRole }) => {
  console.log(payload)
  if (payload.eventKey === 'role-table::action::permission') {
    currentRoleId = payload.row.id
    openPermissionDraw()
  }
  if (payload.eventKey === 'role-table::action::edit') {
    openEditDraw(payload.row)
  }
  if (payload.eventKey === 'role-table::action::delete-popconfirm') {
    del(payload.row)
  }
}

const openAddDraw = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const openEditDraw = (row: SysRole) => {
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const doAddOrEdit = () => {
  roleApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      page()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const del = async (row: SysRole) => {
  await roleApi.remove(row.id)
  await page()
}

function railStyle({ focused, checked }: { focused: boolean; checked: boolean }) {
  const style: CSSProperties = {}
  if (!checked) {
    style.background = '#d03050'
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040'
    }
  } else {
    style.background = '#2080f0'
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040'
    }
  }
  return style
}

// PERMISSION
const rolePermission = reactive<SysRolePermissionResp>({
  tree: [],
  permissionIds: [],
})
// 当前被勾选的权限 ID
const checkedKeys = ref<string[]>([])
// 半选状态（父节点部分子节点被选）
const indeterminateKeys = ref<string[]>([])
const permissionDrawShowStatus = ref(false)
let currentRoleId: string | undefined

const openPermissionDraw = async () => {
  if (!currentRoleId) {
    return
  }
  permissionDrawShowStatus.value = true
  const result: SysRolePermissionResp = await permissionApi.treePermissionByRoleId(currentRoleId)
  rolePermission.tree = result.tree
  rolePermission.permissionIds = result.permissionIds
  checkedKeys.value = [...result.permissionIds]
  console.log(result)
}

const closePermissionDraw = async () => {
  permissionDrawShowStatus.value = false
  rolePermission.permissionIds = []
  checkedKeys.value = []
}

const onCheckedChange = (
  keys: string[],
  options: {
    node: unknown
    action: 'check' | 'uncheck'
    checkedKeys: string[]
    indeterminateKeys: string[]
  },
) => {
  console.log(keys)
  checkedKeys.value = keys
  indeterminateKeys.value = options.indeterminateKeys
}

const doUploadPermission = async () => {
  await permissionApi.refreshRolePermission({
    roleId: currentRoleId,
    originPermissionIds: rolePermission.permissionIds,
    currentPermissionIds: checkedKeys.value,
  })
  permissionDrawShowStatus.value = false
}

onMounted(() => {
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="角色名称" path="roleName">
          <n-input placeholder="角色名称" v-model:value="searchModel.roleName" clearable />
        </n-form-item>
        <n-form-item label="角色编码" path="roleCode">
          <n-input placeholder="角色编码" v-model:value="searchModel.roleCode" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="page">
          搜索
        </n-button>
        <n-button type="primary" ghost :render-icon="renderAsyncIcon('SyncOutline')" @click="reset">
          重置
        </n-button>
      </n-form>
    </div>

    <div flex gap-x="3px">
      <n-button
        type="success"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('AddOutline')"
        @click="openAddDraw"
      >
        新增
      </n-button>
      <n-button
        type="primary"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('CloudUploadOutline')"
        >导入
      </n-button>
      <n-button
        type="primary"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('CloudDownloadOutline')"
      >
        导出
      </n-button>
      <n-button type="error" size="small" ghost :render-icon="renderAsyncIcon('TrashOutline')">
        回收站
      </n-button>
    </div>

    <!--    <n-data-table-->
    <!--      remote-->
    <!--      :loading="tableLoading"-->
    <!--      :columns="columns"-->
    <!--      :data="tableModel?.records"-->
    <!--      :pagination="pagination"-->
    <!--      :single-line="false"-->
    <!--      :scroll-x="1000"-->
    <!--    />-->
    <DynamicTable
      :loading="tableLoading"
      tableCode="role-table"
      :data="tableModel?.records"
      :page-no="tableModel?.pageNo"
      :page-size="tableModel?.pageSize"
      :total="tableModel?.total"
      @pageChange="pageChange"
      @onAction="action"
      :single-line="false"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="角色名称" path="roleName">
            <n-input placeholder="角色名称" v-model:value="currentModel.roleName" />
          </n-form-item>
          <n-form-item label="角色编码" path="roleCode">
            <n-input placeholder="角色编码" v-model:value="currentModel.roleCode" />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch
              checked-value="1"
              unchecked-value="2"
              v-model:value="currentModel.status"
              :rail-style="railStyle"
            >
              <template #checked>正常</template>
              <template #unchecked>禁用</template>
            </n-switch>
          </n-form-item>
          <n-form-item label="备注" path="remark">
            <n-input type="textarea" placeholder="备注" v-model:value="currentModel.remark" />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="drawShowStatus = false">退　出</n-button>
            <n-button type="primary" @click="doAddOrEdit">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 角色-资源抽屉 -->
    <n-drawer
      v-model:show="permissionDrawShowStatus"
      :default-width="502"
      :mask-closable="false"
      resizable
    >
      <n-drawer-content :native-scrollbar="false">
        <template #header> 资源 </template>

        <n-tree
          :data="rolePermission.tree"
          checkable
          check-strategy="all"
          key-field="id"
          label-field="permissionName"
          :checked-keys="checkedKeys"
          :indeterminate-keys="indeterminateKeys"
          @update:checked-keys="onCheckedChange"
        />

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="closePermissionDraw"
              >退　出
            </n-button>
            <n-button type="primary" @click="doUploadPermission">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped></style>
