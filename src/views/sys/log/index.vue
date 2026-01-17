<script setup lang="ts">
import { ref } from 'vue'
import { type VxeTableInstance } from 'vxe-table'
import { useMessage } from 'naive-ui'

const message = useMessage()
const xTable = ref<VxeTableInstance>()

// 模拟数据库数据
const tableData = ref([
  { id: 101, name: 'root', content: 'system-admin', updateTime: '2023-10-01' },
  { id: 102, name: 'user_01', content: 'test-data', updateTime: '2023-10-02' },
  { id: 103, name: 'user_02', content: 'demo-info', updateTime: '2023-10-03' },
])

// 保存逻辑
const saveChanges = async () => {
  const $table = xTable.value
  if ($table) {
    // 获取修改后的数据
    const { updateRecords } = $table.getRecordset()

    if (updateRecords.length === 0) {
      message.info('没有发现任何更改')
      return
    }

    console.log('提交到数据库:', updateRecords)

    // 模拟接口请求
    message.loading('正在保存到数据库...')
    setTimeout(async () => {
      // 保存成功后，清除修改标记（小红角）
      for (const row of updateRecords) {
        // 用当前行作为新的 source
        await $table.reloadRow(row, row)
      }
      message.success(`成功更新 ${updateRecords.length} 条数据`)
    }, 1000)
  }
}

// 还原逻辑
const revertChanges = () => {
  xTable.value?.revertData()
  message.info('已还原未保存的内容')
}
</script>

<template>
  <div class="db-container">
    <div class="toolbar">
      <n-button @click="saveChanges" type="primary" size="small">保存更改</n-button>
      <n-button @click="revertChanges" size="small" ml-2>还原</n-button>
    </div>

    <!-- vxe-table 核心配置 -->
    <vxe-table
      ref="xTable"
      border
      show-overflow="title"
      keep-source
      height="700"
      :column-config="{ resizable: true }"
      :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
      :data="tableData"
    >
      <!-- 1. 自动序号列 -->
      <vxe-column type="seq" width="50"></vxe-column>

      <!-- 2. 普通显示列（ID通常不可编辑） -->
      <vxe-column field="id" title="ID" width="80"></vxe-column>

      <!-- 3. 可编辑列 (edit-render) -->
      <!-- 只需要加上 edit-render，它就会在点击时变成输入框 -->
      <vxe-column
        field="name"
        align="center"
        title="用户名"
        :edit-render="{ name: 'input' }"
        width="150"
      ></vxe-column>

      <vxe-column
        field="content"
        title="数据内容"
        align="center"
        :edit-render="{ name: 'input' }"
        min-width="200"
      ></vxe-column>

      <vxe-column field="updateTime" title="更新时间" align="center" width="180"></vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped>
.db-container {
  padding: 10px;
}
.toolbar {
  margin-bottom: 10px;
}
/* 调整 vxe-table 的样式使其更贴合 Naive UI */
:deep(.vxe-table) {
  font-family: inherit;
}
</style>
