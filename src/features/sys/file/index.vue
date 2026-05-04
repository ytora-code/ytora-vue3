<script setup lang="ts">
import FileInfoCard from './components/FileInfoCard.vue'
import FilePreviewPanel from './components/FilePreviewPanel.vue'
import { useFileManager } from './composable/useFileManager'

const {
  closeContextMenu,
  ctxOptions,
  ctxVisible,
  ctxX,
  ctxY,
  downloadFile,
  fileInfo,
  fileTreeStore,
  folders,
  handleBlankContextMenu,
  handleCtxSelect,
  handleFilePicked,
  handleLoad,
  nodeProps,
  percentage,
  previewLoading,
  previewText,
  previewTip,
  previewUrl,
  renderLabel,
  renderPrefix,
  treeRenderKey,
  uploadInputRef,
  uploading,
} = useFileManager()
</script>

<template>
  <div>
    <div class="tree-container" flex>
      <div w="[300px]" flex-shrink-0 @contextmenu="handleBlankContextMenu">
        <n-scrollbar style="max-height: 80vh">
          <n-tree
            :key="treeRenderKey"
            v-model:expanded-keys="fileTreeStore.expandedKeys"
            v-model:selected-keys="fileTreeStore.selectedKeys"
            :on-load="handleLoad"
            :node-props="nodeProps"
            :render-label="renderLabel"
            :render-prefix="renderPrefix"
            :data="folders"
            block-line
            children-field="children"
            expand-on-click
            key-field="id"
            label-field="path"
            show-line
          />
        </n-scrollbar>
      </div>

      <div class="mx-2" />

      <div flex-1>
        <FileInfoCard :file-info="fileInfo" />

        <FilePreviewPanel
          :file-info="fileInfo"
          :preview-loading="previewLoading"
          :preview-text="previewText"
          :preview-url="previewUrl"
          :preview-tip="previewTip"
          @download="downloadFile"
        />
      </div>
    </div>

    <n-dropdown
      :show="ctxVisible"
      :x="ctxX"
      :y="ctxY"
      placement="bottom-start"
      trigger="manual"
      :options="ctxOptions"
      @select="handleCtxSelect"
      @clickoutside="closeContextMenu"
    />

    <input ref="uploadInputRef" hidden type="file" @change="handleFilePicked">

    <n-modal
      v-model:show="uploading"
      w="[220px]"
      preset="card"
      title="上传中"
      :mask-closable="false"
    >
      <div flex justify-center>
        <n-progress type="circle" :percentage="percentage" />
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
:deep(.n-tree-node.n-tree-node--expanded .n-tree-node-content__text) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.ctx-selected .n-tree-node-content__text) {
  color: #1ca15b !important;
  font-weight: 700;
}

:deep(.ctx-selected .n-tree-node-content__prefix svg) {
  color: #1ca15b !important;
}

.tree-container > div:first-child {
  width: 320px;
  min-height: calc(100vh - 136px);
  cursor: default;
  padding: 10px;
  background-color: var(--global-bg-container);
  border: 1px solid var(--global-border-color);
  border-radius: 3px;
}
</style>
