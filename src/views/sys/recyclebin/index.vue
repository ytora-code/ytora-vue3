<script setup lang="ts">
import { recycleBinApi } from './api/SysRecycleBinApi.ts'
import { onMounted, watch } from 'vue'
import type PageResp from '@/types/resp/PageResp.ts'
import type PageReq from '@/types/req/PageReq.ts'
import DynamicTable from '@/components/table/index.vue'
import { type DataTableColumn, NButton, NFlex, NPopconfirm } from 'naive-ui'

const props = defineProps<{
  tableName: string
  tableCode: string
}>()

const emit = defineEmits<{
  /**
   * 还原成功发送的事件
   * @param e
   * @param row
   */
  (e: 'restore', row: Record<string, unknown>): void

  /**
   * 彻底删除成功发送的事件
   * @param e
   * @param row
   */
  (e: 'deleteCompletely', row: Record<string, unknown>): void
}>()

/**
 * 分页数据
 */
const pageModel = reactive<PageReq>({
  pageNo: 1,
  pageSize: 10
})

/**
 * 表格呼叫
 */
const tableModel = ref<PageResp<Record<string, unknown>>>()

/**
 * 表格Loading
 */
const tableLoading = ref(false)

/**
 * 固定操作列
 */
const flexCol: DataTableColumn<Record<string, unknown>> = {
  title: '操作',
  key: 'actions',
  width: 180,
  fixed: 'right',
  render(row: Record<string, unknown>) {
    return h(
      NFlex,
      { size: 8, justify: 'center', wrap: false },
      {
        default: () => [
          h(
            NButton,
            { size: 'small', type: 'primary', ghost: true, onClick: () => restore(row) },
            { default: () => '还原' }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => deleteCompletely(row),
              negativeText: '取消',
              positiveText: '确定'
            },
            {
              trigger: () =>
                h(
                  NButton,
                  { size: 'small', type: 'error', ghost: true },
                  { default: () => '彻底删除' }
                ),
              default: () => `确定彻底删除吗？`
            }
          )
        ]
      }
    )
  }
}

const pageChange = (pageNo: number, pageSize: number) => {
  if (tableModel.value) {
    tableModel.value.pageNo = pageNo
    tableModel.value.pageSize = pageSize
  }
  pageModel.pageNo = pageNo
  pageModel.pageSize = pageSize
  pageData()
}


const pageData = async () => {
  tableLoading.value = true
  try {
    tableModel.value = await recycleBinApi.page({ originalTable: props.tableName, ...toRaw(pageModel) })
    pageModel.pageNo = tableModel.value.pageNo
    pageModel.pageSize = tableModel.value.pageSize
  } finally {
    tableLoading.value = false
  }
}

const restore = async (row: Record<string, unknown>) => {
  await recycleBinApi.restore(row.binId)
  await pageData()
  emit('restore', row)
}

const deleteCompletely = async (row: Record<string, unknown>) => {
  await recycleBinApi.deleteCompletely(row.binId)
  await pageData()
  emit('deleteCompletely', row)
}

onMounted(pageData)
watch(() => props.tableName, pageData)
</script>

<template>
  <DynamicTable
    :loading="tableLoading"
    :data="tableModel?.records"
    :exclude="[tableCode + '::action']"
    :colCallback="columnArr => [...columnArr, flexCol]"
    :tableCode="tableCode"
    :page-no="tableModel?.pageNo"
    :page-size="tableModel?.pageSize"
    :total="tableModel?.total"
    @pageChange="pageChange"
    :single-line="false"
  />
</template>

<style scoped>

</style>
