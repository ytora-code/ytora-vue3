<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { roleApi } from './api/RoleApi.ts'
import { permissionApi } from '../permission/api/PermissionApi.ts'
import { NButton, NFlex, type TreeOption, type UploadCustomRequestOptions } from 'naive-ui'
import DynamicTable from '@/components/table/index.vue'
import type PageResp from '@/types/resp/PageResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import type SysRoleReq from './type/req/SysRoleReq.ts'
import type SysRole from './type/resp/SysRole.ts'
import type { SysRolePermissionResp } from '@/views/rbac/permission/type/resp/SysRolePermissionResp.ts'
import RecycleBin from '@/views/sys/recyclebin/index.vue'
import type SysDataRule from '@/views/rbac/permission/type/resp/SysDataRule.ts'
import type SysRoleDataRuleResp from '@/views/rbac/permission/type/resp/SysRoleDataRuleResp.ts'
import DynamicForm from '@/components/form/index.vue'

/**
 * 数据库表名称
 */
const tableName = 'sys_role'
/**
 * 数据库表CODE
 */
const tableCode = 'role-table'

const dialog = useDialog()

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
    tableModel.value = await roleApi.page({
      ...toRaw(searchModel),
      ...toRaw(pageModel),
      orderCol: 'update_time↓',
    })
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

const renderTreeSuffix = ({ option }: { option: TreeOption }) => {
  // id 是奇数才显示按钮
  if (option.permissionType === 4) {
    return h(
      NButton,
      {
        size: 'tiny',
        text: true,
        type: 'primary',
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          openDataRuleDialog(option.id as string)
        },
      },
      { default: () => '数据权限' },
    )
  }

  // 偶数：不显示后缀
  return null
}

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

const importBoxShowStatus = ref(false)
const percentage = ref(0)
const uploading = ref(false)

const downloadTemplate = async () => {
  await roleApi.downloadTemplate()
}

const importXlsx = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  if (!file.file) return

  try {
    const formData = new FormData()
    formData.append('file', file.file)
    uploading.value = true
    await roleApi.import(formData, (loaded, total, percent) => {
      percentage.value = percent
    })
    onFinish()
  } catch (err: unknown) {
    console.error('上传失败:', err)
    onError()
  } finally {
    importBoxShowStatus.value = false
    uploading.value = false
    await page()
  }
}

const openExportXlsxConfirmDialog = () => {
  dialog.info({
    title: '下载',
    content: '即将导出符合查询条件的所有数据，是否继续?',
    positiveText: '确认',
    negativeText: '算了',
    draggable: true,
    onPositiveClick: async () => {
      exportXlsx()
    },
    onNegativeClick: () => {},
  })
}
const exportXlsx = () => {
  roleApi.export({ ...toRaw(searchModel) })
}

const recycleBinShowStatus = ref(false)
// 数据规则快照
const originDataRuleIds = ref<(string | number)[]>([])
// 最新的数据规则数组
const currentDataRuleIds = ref<(string | number)[]>([])
// 进入数据规则弹出框时勾选的PermissionId
let currentPermissionId: string | undefined
const dataRuleShowStatus = ref(false)
const dataRuleModel = ref<SysDataRule[]>([])

const openDataRuleDialog = async (id: string) => {
  currentPermissionId = id
  dataRuleModel.value = []
  dataRuleShowStatus.value = true
  const result: SysRoleDataRuleResp = await permissionApi.listRoleDataRule(currentRoleId, id)
  dataRuleModel.value = result.dataRules
  currentDataRuleIds.value = result.ruleIds
  originDataRuleIds.value = result.ruleIds
}

const refreshRoleDataRule = async () => {
  await permissionApi.refreshRoleDataRule({
    roleId: currentRoleId,
    permissionId: currentPermissionId,
    originDataRuleIds: originDataRuleIds.value,
    currentDataRuleIds: currentDataRuleIds.value,
  })
  // 关闭弹框
  dataRuleShowStatus.value = false
  // 将下面数据置空
  currentPermissionId = undefined
  dataRuleModel.value = []
  currentDataRuleIds.value = []
  originDataRuleIds.value = []
  dataRuleModel.value = []
}

onMounted(() => {
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <!-- 搜索条件 -->
    <DynamicForm
      formCode="role-search"
      v-model="searchModel"
      label-placement="left"
      inline
      flex
      flex-wrap
      gap-2
    >
      <template #suffix>
        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="page">
          搜索
        </n-button>
        <n-button type="primary" ghost :render-icon="renderAsyncIcon('SyncOutline')" @click="reset">
          重置
        </n-button>
      </template>
    </DynamicForm>

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
        @click="importBoxShowStatus = true"
        >导入
      </n-button>
      <n-button
        type="primary"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('CloudDownloadOutline')"
        @click="openExportXlsxConfirmDialog"
      >
        导出
      </n-button>
      <n-button
        type="error"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('TrashOutline')"
        @click="recycleBinShowStatus = true"
      >
        回收站
      </n-button>
    </div>

    <DynamicTable
      :loading="tableLoading"
      :tableCode="tableCode"
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

    <!-- 数据导入弹出框 -->
    <n-modal
      w="[30%]"
      min-w="[300px]"
      h="[300px]"
      v-model:show="importBoxShowStatus"
      preset="card"
      title="数据导入"
      flex-height
      draggable
    >
      <n-button text type="primary" @click.stop="downloadTemplate">下载导入模板</n-button>
      <n-upload v-if="!uploading" :custom-request="importXlsx" accept=".xlsx,.xls">
        <n-upload-dragger>
          <div mb="[12px]">
            <n-icon size="48" :depth="3">
              <component :is="renderAsyncIcon('CloudUploadOutline')" />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">点击或者拖动文件到该区域来上传</n-text>
        </n-upload-dragger>
      </n-upload>

      <div flex justify-center v-else>
        <n-progress type="circle" :percentage="percentage" />
      </div>
    </n-modal>

    <!-- 角色-资源抽屉 -->
    <n-drawer
      v-model:show="permissionDrawShowStatus"
      :default-width="502"
      :mask-closable="false"
      resizable
    >
      <n-drawer-content :native-scrollbar="false">
        <template #header>资源</template>

        <n-tree
          :data="rolePermission.tree"
          checkable
          block-line
          check-strategy="all"
          key-field="id"
          label-field="permissionName"
          :checked-keys="checkedKeys"
          :indeterminate-keys="indeterminateKeys"
          :render-suffix="renderTreeSuffix"
          @update:checked-keys="onCheckedChange"
        />

        <template #footer>
          <n-flex>
            <n-button type="primary" ghost @click="closePermissionDraw">退　出</n-button>
            <n-button type="primary" @click="doUploadPermission">提　交</n-button>
          </n-flex>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 回收站弹出框 -->
    <n-modal
      w="[70%]"
      min-w="[500px]"
      v-model:show="recycleBinShowStatus"
      preset="card"
      title="回收站"
      flex-height
      draggable
    >
      <RecycleBin :table-name="tableName" :table-code="tableCode" @restore="page" />
    </n-modal>

    <!-- 数据权限弹出框 -->
    <n-modal
      w="[260px]"
      v-model:show="dataRuleShowStatus"
      preset="card"
      title="数据权限"
      flex-height
      draggable
    >
      <n-checkbox-group
        :value="currentDataRuleIds"
        @update:value="(value: (string | number)[]) => (currentDataRuleIds = value)"
      >
        <n-space vertical align="center">
          <n-checkbox
            v-for="item in dataRuleModel"
            :key="item.id"
            :value="item.id"
            :label="item.ruleName"
            w="[250px]"
          />
        </n-space>
      </n-checkbox-group>
      <n-divider />
      <n-button ml="[90px]" type="primary" size="small" ghost @click="refreshRoleDataRule"
        >提交</n-button
      >
    </n-modal>
  </div>
</template>

<style scoped></style>
