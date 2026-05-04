<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import PageLayout from '@/components/page-layout/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useCrud from './composable/useCrud'
import useSchema from './composable/useSchema'

const { searchFormSchemas, tableSchemas } = useSchema()

const {
  searchFormModel,
  pageNo,
  pageSize,
  total,
  records,
  tableLoading,
  checkedRowKeys,
  page,
  search,
  resetSearch,
  pageChange,
  pageSizeChange,
  kickLoading,
  kickRow,
  kickBatch,
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

      <template #toolbar>
        <div class="toolbar-actions">
          <n-button type="error" size="small" ghost :loading="kickLoading" @click="kickBatch">
            批量踢下线
          </n-button>
        </div>
      </template>

      <template #table>
        <DynamicTable
          v-model:data="records"
          v-model:checked-row-keys="checkedRowKeys"
          :schemas="tableSchemas"
          :loading="tableLoading"
          :row-key="(row) => row.token || row.id"
        >
          <template #action="{ row }">
            <div flex justify-center gap-2>
              <n-button
                type="error"
                ghost
                size="small"
                :loading="kickLoading"
                @click="kickRow(row)"
              >
                踢下线
              </n-button>
            </div>
          </template>
        </DynamicTable>
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
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
