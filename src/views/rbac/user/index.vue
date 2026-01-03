<script setup lang="ts">
import { type CSSProperties, onMounted, reactive } from 'vue'
import { userApi } from './api/UserApi.ts'
import { roleApi } from '@/views/rbac/role/api/RoleApi.ts'
import { fileApi } from '@/api/FileApi.ts'
import { NButton, NFlex, NSwitch, type UploadCustomRequestOptions } from 'naive-ui'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import type SysUserReq from '@/views/rbac/user/type/req/SysUserReq.ts'
import type SysRoleReq from '@/views/rbac/role/type/req/SysRoleReq.ts'
import { renderAsyncIcon } from '@/utils/icon.ts'
import resetDefault from '@/utils/resetDefault.ts'
import { getDefaultAvatar } from '@/utils/image.ts'
import DynamicTable from '@/components/table/index.vue'
import type { AxiosProgressEvent } from 'axios'
import type SysRole from '@/views/rbac/role/type/resp/SysRole.ts'
import { useUserStore } from '@/stores/userStore.ts'
import type SysRoleUserReq from '@/views/rbac/role/type/req/SysRoleUserReq.ts'

const userStore = useUserStore()

/**
 * 分页数据
 */
const pageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10
})

/**
 * search表单数据
 */
const searchModel = reactive<SysUserReq>({})

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
const currentModel = ref<SysUserReq>({})

const tableModel = ref<PageResp<SysUserResp>>()

const pageChange = (pageNo: number, pageSize: number) => {
  if (tableModel.value) {
    tableModel.value.pageNo = pageNo
    tableModel.value.pageSize = pageSize
  }
  pageModel.pageNo = pageNo
  pageModel.pageSize = pageSize
  page()
}

const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await userApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
    pageModel.pageNo = tableModel.value.pageNo
    pageModel.pageSize = tableModel.value.pageSize
  } finally {
    tableLoading.value = false
  }
}

/**
 * ROLE
 */
const rolePageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10
})
const roleSearchModel = reactive<SysRoleReq>({})

const roleTableModel = ref<PageResp<SysRole>>()

const rolePage = async () => {
  roleTableModel.value = await roleApi.page({ ...toRaw(roleSearchModel), ...toRaw(rolePageModel) })
  rolePageModel.pageNo = roleTableModel.value.pageNo
  rolePageModel.pageSize = roleTableModel.value.pageSize
}

const roleAction = (payload: { eventKey: string; row: SysRole }) => {
  console.log(payload)
}

/**
 * 判断当前行角色是否被用户拥有
 */
const isRoleOwned = (roleCode: string | undefined) => {
  if (!roleCode) {
    return false
  }
  // 假设 userStore.roles 是一个对象数组，每个对象包含 roleCode 属性
  return userStore.roles?.some((role) => role.roleCode === roleCode) ?? false
}

/**
 * 处理 Switch 切换事件
 */
const handleToggleRole = async (status: boolean, row: SysRole) => {
  const roleId = row.id as string
  const userId = currentModel.value.id as string
  await roleApi.refreshUserRoleMapper({userId, roleId, add: status})
  if (status) {
    if (!userStore.roles.some(r => r.id === roleId)) userStore.roles.push(row)
  } else {
    userStore.roles = userStore.roles.filter(r => r.id !== roleId)
  }
  await rolePage()
}

const reset = () => {
  resetDefault(searchModel)
  page()
}

const action = (payload: { eventKey: string; row: SysUserResp }) => {
  console.log(payload)
  if (payload.eventKey === 'user-table::action::role') {
    roleModal.value = true
    Object.assign(currentModel.value, payload.row)
    rolePage()
  }
  if (payload.eventKey === 'user-table::action::edit') {
    openEditDraw(payload.row)
  }
  if (payload.eventKey === 'user-table::action::delete-popconfirm') {
    doDel(payload.row)
  }
}

const openAddDraw = () => {
  resetDefault(currentModel.value)
  drawShowStatus.value = true
}

const openEditDraw = (row: SysUserResp) => {
  Object.assign(currentModel.value, row)
  drawShowStatus.value = true
}

const doAddOrEdit = () => {
  userApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      page()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

const doDel = async (row: SysUserResp) => {
  await userApi.remove(row.id)
  await page()
}

const uploading = ref(false)

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

/*======================= 角色 ==================*/
const roleModal = ref(false)

const handleCustomUpload = async ({
                                    file,
                                    onFinish,
                                    onError,
                                    onProgress
                                  }: UploadCustomRequestOptions) => {
  if (!file.file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file.file)

  try {
    const fileId = await fileApi.fileUpload(formData, (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress({ percent })
      }
    })
    currentModel.value.avatar = `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?fileId=${fileId}`
    onFinish()
  } catch (err: unknown) {
    console.error('上传失败:', err)
    onError()
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <div>
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="用户名" path="userName">
          <n-input placeholder="用户名" v-model:value="searchModel.userName" clearable />
        </n-form-item>
        <n-form-item label="真实姓名" path="realName">
          <n-input placeholder="真实姓名" v-model:value="searchModel.realName" clearable />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input placeholder="电话" v-model:value="searchModel.phone" clearable />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-input placeholder="状态" v-model:value="searchModel.status" clearable />
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

    <DynamicTable
      :loading="tableLoading"
      :data="tableModel?.records"
      @onAction="action"
      tableCode="user-table"
      :page-no="tableModel?.pageNo"
      :page-size="tableModel?.pageSize"
      :total="tableModel?.total"
      @pageChange="pageChange"
    />

    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="头像" path="avatar" style="align-items: center">
            <n-flex w="[100%]" h="[120px]" align="center" inline>
              <n-image
                height="120px"
                object-fit="contain"
                :src="currentModel.avatar || getDefaultAvatar()"
              />
              <n-upload
                :show-file-list="false"
                accept="image/*"
                w-auto
                :custom-request="handleCustomUpload"
              >
                <n-button type="primary" ghost :loading="uploading">更换头像</n-button>
              </n-upload>
            </n-flex>
          </n-form-item>
          <n-form-item label="用户名" path="userName">
            <n-input placeholder="用户名" v-model:value="currentModel.userName" />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input placeholder="密码" v-model:value="currentModel.password" />
          </n-form-item>
          <n-form-item label="真实姓名" path="realName">
            <n-input placeholder="真实姓名" v-model:value="currentModel.realName" />
          </n-form-item>
          <n-form-item label="电话" path="phone">
            <n-input placeholder="电话" v-model:value="currentModel.phone" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input placeholder="邮箱" v-model:value="currentModel.email" />
          </n-form-item>
          <n-form-item label="生日" path="birthday">
            <n-date-picker
              placeholder="生日"
              v-model:formatted-value="currentModel.birthday"
              value-format="yyyy-MM-dd"
              type="date"
            />
          </n-form-item>
          <n-form-item label="证件号" path="idCard">
            <n-input placeholder="证件号" v-model:value="currentModel.idCard" />
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

    <!-- 弹出框 -->
    <n-modal
      w="[800px]"
      h="[800px]"
      v-model:show="roleModal"
      preset="card"
      title="分配角色"
      flex-height
      draggable
    >
      <DynamicTable
        flex-height
        h="[100%]"
        tableCode="user-role-table"
        :data="roleTableModel?.records"
        :page-no="roleTableModel?.pageNo"
        :page-size="roleTableModel?.pageSize"
        :total="roleTableModel?.total"
        @pageChange="pageChange"
        @onAction="roleAction"
      >
        <template #abc="{ row }">
          <n-switch :value="isRoleOwned(row.roleCode)" @update:value="(val: boolean) => handleToggleRole(val, row)" >
            <template #checked>拥有</template>
            <template #unchecked>未拥有</template>
          </n-switch>
        </template>
      </DynamicTable>

    </n-modal>
  </div>
</template>

<style scoped></style>
