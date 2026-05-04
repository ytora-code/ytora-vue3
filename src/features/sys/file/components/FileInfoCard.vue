<script setup lang="ts">
import type SysFile from '@/features/sys/file/type/SysFileData'

defineProps<{
  fileInfo?: SysFile
}>()
</script>

<template>
  <n-card :title="fileInfo?.fileName" size="huge">
    <n-empty v-if="!fileInfo" description="请选择一个文件" />
    <n-grid v-else :cols="2">
      <n-gi> 文件ID：{{ fileInfo.fileId }}</n-gi>
      <n-gi> 文件大小：{{ fileInfo.fileSizeText }}</n-gi>
      <n-gi> 文件类型：{{ fileInfo.ext }}</n-gi>
      <n-gi> 上传人：{{ fileInfo.createBy }}</n-gi>
      <n-gi> 上传时间：{{ fileInfo.createTime }}</n-gi>
      <n-gi> 下载次数：{{ fileInfo.downloadCount }}</n-gi>
    </n-grid>
  </n-card>
</template>
