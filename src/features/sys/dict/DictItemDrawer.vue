<script setup lang="ts">
import DynamicForm from '@/components/form/index.vue'
import DynamicTable from '@/components/table/index.vue'
import useDictItem from './composable/useDictItem'
import useDictItemSchema from './composable/useDictItemSchema'
import type SysDictData from './type/SysDictData'

const { searchFormSchemas, drawerFormSchemas, drawerRules, tableSchemas } = useDictItemSchema()

const {
  itemCheckedRowKeys,
  itemDrawerLoading,
  itemDrawerTitle,
  itemDrawerVisible,
  itemPageNo,
  itemPageSize,
  itemSearchFormModel,
  itemTotal,
  itemFormDrawerLoading,
  itemFormDrawerTitle,
  itemFormDrawerVisible,
  itemFormModel,
  itemFormRef,
  itemRecords,
  itemSubmitLoading,
  deleteItemLoading,
  openDictItemDrawer,
  closeDictItemDrawer,
  handleItemDrawerAfterLeave,
  searchDictItems,
  resetDictItemSearch,
  itemPageChange,
  itemPageSizeChange,
  openCreateDictItemDrawer,
  openEditDictItemDrawer,
  closeItemFormDrawer,
  handleItemFormDrawerAfterLeave,
  submitItemDrawer,
  deleteDictItemRow,
  deleteDictItemBatch,
} = useDictItem()

const open = async (dict: SysDictData) => {
  await openDictItemDrawer(dict)
}

defineExpose({
  open,
})
</script>

<template>
  <n-drawer
    v-model:show="itemDrawerVisible"
    :width="920"
    placement="right"
    @after-leave="handleItemDrawerAfterLeave"
  >
    <n-drawer-content :title="itemDrawerTitle" closable>
      <div class="dict-item-panel">
        <DynamicForm
          v-model="itemSearchFormModel"
          :schemas="searchFormSchemas"
          submit-text="查 询"
          submit-icon="i-lucide-search"
          reset-text="重 置"
          reset-icon="i-lucide-rotate-ccw"
          action-placement="inline"
          :show-feedback="false"
          @submit="searchDictItems"
          @reset="resetDictItemSearch"
        />

        <div class="dict-item-panel__toolbar-actions">
          <n-button size="small" type="success" ghost @click="openCreateDictItemDrawer">
            新 增
          </n-button>
          <n-button
            size="small"
            type="error"
            ghost
            :loading="deleteItemLoading"
            @click="deleteDictItemBatch"
          >
            批量删除
          </n-button>
        </div>

        <n-spin :show="itemDrawerLoading">
          <DynamicTable
            v-model:data="itemRecords"
            v-model:checked-row-keys="itemCheckedRowKeys"
            :schemas="tableSchemas"
            :loading="itemDrawerLoading"
            row-key="id"
          >
            <template #action="{ row }">
              <div flex justify-center gap-2>
                <n-button type="primary" ghost size="small" @click="openEditDictItemDrawer(row.id)">
                  编辑
                </n-button>
                <n-popconfirm @positive-click="deleteDictItemRow(row)">
                  <template #trigger>
                    <n-button type="error" ghost size="small" :loading="deleteItemLoading">
                      删除
                    </n-button>
                  </template>
                  确定删除当前字典项吗？
                </n-popconfirm>
              </div>
            </template>
          </DynamicTable>
        </n-spin>

        <div class="dict-item-panel__pagination">
          <n-pagination
            :page="itemPageNo"
            :page-size="itemPageSize"
            :item-count="itemTotal"
            :page-sizes="[10, 20, 30, 50]"
            :prefix="({ itemCount }) => '共 ' + (itemCount ?? 0) + ' 条'"
            show-size-picker
            show-quick-jumper
            @update:page="itemPageChange"
            @update:page-size="itemPageSizeChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeDictItemDrawer">关 闭</n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>

  <n-drawer
    v-model:show="itemFormDrawerVisible"
    :width="520"
    placement="right"
    @after-leave="handleItemFormDrawerAfterLeave"
  >
    <n-drawer-content :title="itemFormDrawerTitle" closable>
      <n-spin :show="itemFormDrawerLoading">
        <DynamicForm
          ref="itemFormRef"
          v-model="itemFormModel"
          :schemas="drawerFormSchemas"
          :rules="drawerRules"
          :show-action-row="false"
        />
      </n-spin>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeItemFormDrawer">取 消</n-button>
          <n-button type="primary" :loading="itemSubmitLoading" @click="submitItemDrawer">
            保 存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dict-item-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.dict-item-panel__toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.dict-item-panel__pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
