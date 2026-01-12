<script setup lang="ts">
// ======================= 依赖导入 =======================>>
import { renderAsyncIcon } from '@/utils/icon.ts'
import type PageReq from '@/types/req/PageReq.ts'
import type SysDictReq from '@/views/sys/dict/type/req/SysDictReq.ts'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysDict from '@/views/sys/dict/type/resp/SysDict.ts'
import { dictApi } from './api/DictApi.ts'
import resetDefault from '@/utils/resetDefault.ts'
import { NButton, NFlex, NSwitch, type UploadCustomRequestOptions } from 'naive-ui'
import { userApi } from '@/views/rbac/user/api/UserApi.ts'
import { onMounted } from 'vue'
import DynamicTable from '@/components/table/index.vue'
import RecycleBin from '@/views/sys/recyclebin/index.vue'

// ======================= USE HOOK =======================>>
const dialog = useDialog()

// ======================= 基础信息 =======================>>
/**
 * 数据库表名称
 */
const tableName = 'sys_dict'
/**
 * 数据库表CODE
 */
const tableCode = 'dict-table'

// ======================= 查询 =======================>>
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
const searchModel = reactive<SysDictReq>({})

/**
 * 表格Loading
 */
const tableLoading = ref(false)

/**
 * 表格数据
 */
const tableModel = ref<PageResp<SysDict>>()

/**
 * 根据当前条件分页查询
 */
const page = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await dictApi.page({ ...toRaw(searchModel), ...toRaw(pageModel) })
    pageModel.pageNo = tableModel.value.pageNo
    pageModel.pageSize = tableModel.value.pageSize
  } finally {
    tableLoading.value = false
  }
}

/**
 * 重置查询
 */
const reset = () => {
  resetDefault(searchModel)
  page()
}

/**
 * 分页数据改变时
 */
const pageChange = (pageNo: number, pageSize: number) => {
  if (tableModel.value) {
    tableModel.value.pageNo = pageNo
    tableModel.value.pageSize = pageSize
  }
  pageModel.pageNo = pageNo
  pageModel.pageSize = pageSize
  page()
}

// ======================= 新增/编辑/删除 =======================>>
/**
 * 新增/编辑抽屉显示状态
 */
const drawShowStatus = ref(false)

/**
 * 新增/编辑的数据
 */
const currentModel = ref<SysDictReq>({})

/**
 * 接受数据表格发送的事件
 */
const addEditAction = (payload: { eventKey: string; row: SysDict }) => {
  if (payload.eventKey === 'user-table::action::edit') {
    openAddEditDraw(payload.row)
  }
  if (payload.eventKey === 'user-table::action::delete-popconfirm') {
    doDel(payload.row)
  }
}

/**
 * 打开新增/编辑抽屉
 */
const openAddEditDraw = (row?: SysDict) => {
  // 编辑
  if (row) {
    Object.assign(currentModel.value, row)
  }
  // 新增
  else {
    resetDefault(currentModel.value)
  }
  drawShowStatus.value = true
}

/**
 * 执行新增/编辑操作
 */
const doAddOrEdit = () => {
  dictApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      page()
    })
    .finally(() => {
      drawShowStatus.value = false
    })
}

/**
 * 执行删除操作
 */
const doDel = async (row: SysDict) => {
  await dictApi.remove(row.id)
  await page()
}

// ======================= 导入/导出 =======================>>
/**
 * 导入框显示状态
 */
const importBoxShowStatus = ref(false)
/**
 * 是否正在导入 EXCEL
 */
const uploading = ref(false)

/**
 * 导入文件百分比
 */
const percentage = ref(0)

/**
 * 下载导入模板
 */
const downloadTemplate = async () => {
  await dictApi.template()
}

/**
 * 导入 EXCEL
 */
const importXlsx = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  if (!file.file) return

  try {
    const formData = new FormData()
    formData.append('file', file.file)
    uploading.value = true
    await userApi.import(formData, (loaded, total, percent) => {
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

/**
 * 导出 EXCEL
 */
const openExportXlsxConfirmDialog = () => {
  // 导出数据时，弹出提示框
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
  userApi.export({ ...toRaw(searchModel) })
}

// ======================= 回收站 =======================>>
/**
 * 回收站弹出框显示状态
 */
const recycleBinShowStatus = ref(false)

// ======================= 生命周期函数 =======================>>
onMounted(() => {
  page()
})
</script>

<template>
  <div flex flex-col gap-1 px-6 py-3>
    <!-- 搜索条件 -->
    <div class="searchBox">
      <n-form :model="searchModel" label-placement="left" inline flex flex-wrap gap-2>
        <n-form-item label="字典名称" path="dictName">
          <n-input placeholder="字典名称" v-model:value="searchModel.dictName" clearable />
        </n-form-item>
        <n-form-item label="字典编码" path="dictCode">
          <n-input placeholder="字典编码" v-model:value="searchModel.dictCode" clearable />
        </n-form-item>

        <n-button type="primary" :render-icon="renderAsyncIcon('SearchOutline')" @click="page">
          搜索
        </n-button>
        <n-button type="primary" ghost :render-icon="renderAsyncIcon('SyncOutline')" @click="reset">
          重置
        </n-button>
      </n-form>
    </div>

    <!-- 操作按钮 -->
    <div class="operaBox" flex gap-x="3px">
      <n-button
        type="success"
        size="small"
        ghost
        :render-icon="renderAsyncIcon('AddOutline')"
        @click="openAddEditDraw(undefined)"
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

    <!-- 数据表格 -->
    <DynamicTable
      :loading="tableLoading"
      :data="tableModel?.records"
      @onAction="addEditAction"
      :tableCode="tableCode"
      :page-no="tableModel?.pageNo"
      :page-size="tableModel?.pageSize"
      :total="tableModel?.total"
      @pageChange="pageChange"
      :single-line="false"
    />

    <!-- 侧边栏新增/编辑抽屉 -->
    <!-- 侧边栏抽屉 -->
    <n-drawer v-model:show="drawShowStatus" :default-width="502" :mask-closable="false" resizable>
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          {{ currentModel.id ? '编辑' : '新增' }}
        </template>

        <n-form :model="currentModel" label-placement="left" :label-width="100">
          <n-form-item label="字典名称" path="dictName">
            <n-input placeholder="字典名称" v-model:value="currentModel.dictName" />
          </n-form-item>
          <n-form-item label="字典编码" path="dictCode">
            <n-input placeholder="字典编码" v-model:value="currentModel.dictCode" />
          </n-form-item>
          <n-form-item label="排序" path="index">
            <n-input-number placeholder="排序" v-model:value="currentModel.index" clearable />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch checked-value="1" unchecked-value="2" v-model:value="currentModel.status">
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
          <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传</n-text>
        </n-upload-dragger>
      </n-upload>

      <div flex justify-center v-else>
        <n-progress type="circle" :percentage="percentage" />
      </div>
    </n-modal>

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
  </div>
</template>

<style scoped></style>
