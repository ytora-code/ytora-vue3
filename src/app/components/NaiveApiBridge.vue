<script setup lang="ts">
import { useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui'
import { registerNaiveApis } from '@/utils/naiveApi'

registerNaiveApis({
  message: useMessage(),
  notification: useNotification(),
  dialog: useDialog(),
  loadingBar: useLoadingBar(),
})
</script>

<template>
  <span v-if="false" />
</template>
