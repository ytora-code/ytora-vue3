<script setup lang="ts">
import { ref, watch } from 'vue'
import type SysFile from '@/features/sys/file/type/SysFileData'

const props = defineProps<{
  fileInfo?: SysFile
  previewLoading: boolean
  previewText: string
  previewUrl: string
  previewTip: string
}>()

defineEmits<{
  download: []
}>()

const videoRef = ref<globalThis.HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)

watch(
  () => props.fileInfo?.id,
  () => {
    isVideoPlaying.value = false
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.currentTime = 0
    }
  },
)

const playVideo = async () => {
  if (!videoRef.value) {
    return
  }

  await videoRef.value.play()
}
</script>

<template>
  <div v-if="fileInfo" class="preview">
    <h2 v-if="fileInfo.fileExist === false" text="[#F00]">对应的真实文件不存在，请检查!!!</h2>

    <n-scrollbar v-else style="max-height: 65vh">
      <div v-if="previewLoading">加载中...</div>

      <n-image
        v-else-if="fileInfo.ext === 'image'"
        width="80%"
        object-fit="contain"
        :src="previewUrl"
      />

      <iframe v-else-if="fileInfo.ext === 'pdf'" :src="previewUrl" w="[90%]" h="[65vh]" />

      <iframe
        v-else-if="fileInfo.ext === 'html'"
        :srcdoc="previewText"
        class="preview__html"
        referrerpolicy="no-referrer"
      />

      <div v-else-if="fileInfo.ext === 'video'" class="preview__video-shell">
        <video
          ref="videoRef"
          class="preview__video"
          :src="previewUrl"
          preload="auto"
          controls
          playsinline
          @play="isVideoPlaying = true"
          @pause="isVideoPlaying = false"
          @ended="isVideoPlaying = false"
        />

        <button v-if="!isVideoPlaying" type="button" class="preview__video-play" @click="playVideo">
          <span class="preview__video-triangle" />
        </button>
      </div>

      <pre
        v-else-if="['text', 'log', 'json', 'code'].includes(fileInfo.ext)"
        class="preview__text"
      >{{ previewText }}</pre>

      <div v-else>
        {{ previewTip }}
        <n-button text type="primary" @click="$emit('download')">下载</n-button>
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped>
.preview {
  margin-top: 5px;
  color: var(--global-text-color);
  border-width: 1px;
  border-style: solid;
  border-color: var(--global-border-color);
  background: var(--global-bg-container);
}

.preview__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview__html {
  width: 100%;
  height: 65vh;
  border: 0;
  background: var(--global-bg-container);
}

.preview__video-shell {
  position: relative;
  width: 100%;
  min-height: 320px;
  background: #000;
}

.preview__video {
  display: block;
  width: 100%;
  max-height: 65vh;
  background: #000;
}

.preview__video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 0;
  border-radius: 999px;
  background: rgb(0 0 0 / 55%);
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.preview__video-triangle {
  width: 0;
  height: 0;
  margin-left: 6px;
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 28px solid var(--global-bg-container);
}
</style>
