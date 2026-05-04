<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useCrud from './composable/useCrud'
import useSchema from './composable/useSchema'

/**
 * 表单和表格结构元数据
 */
const { searchFormSchemas, tableSchemas } = useSchema()

/**
 * 查询逻辑
 */
const {
  searchFormModel,
  pageNo,
  pageSize,
  total,
  records,
  tableLoading,
  page,
  search,
  resetSearch,
  pageChange,
  pageSizeChange,
} = useCrud()

onMounted(async () => {
  await page()
})
</script>

<template>
  <div>
    <PageLayout>
      <template #search>
        <DynamicForm
          v-model="searchFormModel"
          :schemas="searchFormSchemas"
          submit-text="搜 索"
          submit-icon="i-lucide-search"
          reset-text="重 置"
          reset-icon="i-lucide-rotate-ccw"
          action-placement="inline"
          :show-feedback="false"
          @submit="search"
          @reset="resetSearch"
        />
      </template>

      <template #table>
        <DynamicTable
          v-model:data="records"
          :schemas="tableSchemas"
          :loading="tableLoading"
          row-key="id"
        />
      </template>

      <template #pagination>
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
      </template>
    </PageLayout>
  </div>
</template>

<style scoped>
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
