<script setup lang="ts">
// ======================= 依赖导入 =======================>>
import { renderAsyncIcon } from '@/utils/icon.ts'
import type PageReq from '@/types/req/PageReq.ts'
import type SysDictReq from '@/views/sys/dict/type/req/SysDictReq.ts'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysDict from '@/views/sys/dict/type/resp/SysDict.ts'
import { dictApi } from './api/DictApi.ts'
import resetDefault from '@/utils/resetDefault.ts'
import { NButton, NFlex } from 'naive-ui'
import { onMounted } from 'vue'
import DynamicTable from '@/components/table/index.vue'
import type SysDictItem from '@/views/sys/dict/type/resp/SysDictItem.ts'

// ======================= 基础信息 =======================>>
/**
 * 数据库表名称
 */
const tableName = 'sys_dict'

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
    tableModel.value = await dictApi.page({
      ...toRaw(searchModel),
      ...toRaw(pageModel),
      type: 1,
      orderCol: 'update_time↓',
    })
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
  if (payload.eventKey === 'sys_dict::action::dictItem') {
    openDictItemDialog(payload.row)
  }
  if (payload.eventKey === 'sys_dict::action::edit') {
    openAddEditDraw(payload.row)
  }
  if (payload.eventKey === 'sys_dict::action::delete-popconfirm') {
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
    currentModel.value.id = undefined
    currentModel.value.pid = '0'
    currentModel.value.type = 1
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

// ======================= 字典项 =======================>>

/**
 * 字典项表格弹出框显示状态
 */
const dictItemDialogShowStatus = ref(false)
/**
 * 字典项表格loading状态
 */
const dictItemTableLoading = ref(false)
/**
 * 字典项数据
 */
const dictItemModel = ref<SysDictItem[]>([])
/**
 * 字典项新增/编辑弹出框的显示状态
 */
const dictItemAddEditDialogShowStatus = ref(false)

const currentDictName = ref<string | undefined>()
let currentDictCode: string | undefined
/**
 * 打开字典项弹出框
 */
const openDictItemDialog = async (row: SysDict) => {
  currentDictName.value = row.dictName
  currentDictCode = row.dictCode
  dictItemDialogShowStatus.value = true
  await listDictItem(currentDictCode)
}

/**
 * 执行查询操作
 */
const listDictItem = async (dictCode: string) => {
  dictItemTableLoading.value = true
  try {
    dictItemModel.value = await dictApi.listDictItem(dictCode)
  } finally {
    dictItemTableLoading.value = false
  }
}

/**
 * 字典项的新增/编辑
 */
const dictItemAddEditAction = (payload: { eventKey: string; row: SysDictItem }) => {
  if (payload.eventKey === 'sys_dict_item::action::edit') {
    openDictItemAddEditDialog(payload.row)
  }
  if (payload.eventKey === 'sys_dict_item::action::delete-popconfirm') {
    doDictItemDel(payload.row)
  }
}

/**
 * 打开字典项新增/编辑弹出框
 */
const openDictItemAddEditDialog = (row?: SysDictItem) => {
  // 编辑
  if (row) {
    Object.assign(currentModel.value, row)
  }
  // 新增
  else {
    resetDefault(currentModel.value)
    currentModel.value.id = undefined
    currentModel.value.dictCode = currentDictCode
    currentModel.value.type = 2
  }
  dictItemAddEditDialogShowStatus.value = true
}

/**
 * 执行字典项新增/编辑操作
 */
const doDictItemAddOrEdit = () => {
  dictApi
    .insertOrUpdate(currentModel.value)
    .then(() => {
      listDictItem(currentDictCode!)
    })
    .finally(() => {
      dictItemAddEditDialogShowStatus.value = false
    })
}

/**
 * 执行字典项删除操作
 */
const doDictItemDel = async (row: SysDict) => {
  await dictApi.remove(row.id)
  await listDictItem(row.dictCode)
}

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
    </div>

    <!-- 数据表格 -->
    <DynamicTable
      :loading="tableLoading"
      :data="tableModel?.records"
      @onAction="addEditAction"
      :tableCode="tableName"
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
          <!--          <n-form-item label="排序" path="index">-->
          <!--            <n-input-number placeholder="排序" v-model:value="currentModel.index" clearable />-->
          <!--          </n-form-item>-->
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

    <!-- 字典项查询弹出框 -->
    <n-modal
      w="[45%]"
      min-w="[400px]"
      v-model:show="dictItemDialogShowStatus"
      preset="card"
      :title="currentDictName"
      flex-height
      draggable
    >
      <!-- 操作按钮 -->
      <div class="operaBox" flex gap-x="3px" mb-1>
        <n-button
          type="success"
          size="small"
          ghost
          :render-icon="renderAsyncIcon('AddOutline')"
          @click="openDictItemAddEditDialog(undefined)"
        >
          新增
        </n-button>
      </div>

      <!-- 字典项表格 -->
      <DynamicTable
        :loading="dictItemTableLoading"
        :data="dictItemModel"
        @onAction="dictItemAddEditAction"
        tableCode="sys_dict_item"
        :single-line="false"
        max-height="600px"
      />
    </n-modal>

    <!-- 字典项新增/编辑弹出框 -->
    <n-modal
      w="[20%]"
      min-w="[300px]"
      v-model:show="dictItemAddEditDialogShowStatus"
      preset="card"
      :title="currentModel.id ? '编辑' : '新增'"
      flex-height
      draggable
    >
      <n-form :model="currentModel" label-placement="left" :label-width="70" gap-2>
        <n-form-item label="文本" path="dictItemText">
          <n-input placeholder="文本" v-model:value="currentModel.dictItemText" clearable />
        </n-form-item>
        <n-form-item label="字典项值" path="dictItemValue">
          <n-input placeholder="字典项值" v-model:value="currentModel.dictItemValue" clearable />
        </n-form-item>
        <n-form-item label="序号" path="index">
          <n-input-number
            placeholder="序号"
            v-model:value="currentModel.index"
            style="width: 100%"
            clearable
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            placeholder="备注"
            type="textarea"
            v-model:value="currentModel.remark"
            clearable
          />
        </n-form-item>
      </n-form>
      <n-button ml="[220px]" type="primary" size="small" ghost @click="doDictItemAddOrEdit">
        提交
      </n-button>
    </n-modal>
  </div>
</template>

<style scoped></style>
