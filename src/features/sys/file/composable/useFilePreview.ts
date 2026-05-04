import { ref, watch, type Ref } from 'vue'
import fileApi from '@/features/sys/file/api/FileApi'
import type SysFile from '@/features/sys/file/type/SysFileData'

type PreviewState = {
  previewLoading: ReturnType<typeof ref<boolean>>
  previewText: ReturnType<typeof ref<string>>
  previewTip: ReturnType<typeof ref<string>>
  previewUrl: ReturnType<typeof ref<string>>
}

const PREVIEW_FILE_SIZE_LIMIT = 1024 * 1024

export const useFilePreview = (fileInfo: Ref<SysFile | undefined>) => {
  const previewRequestId = ref(0)
  const previewLoading = ref(false)
  const previewText = ref('')
  const previewUrl = ref('')
  const previewTip = ref('暂不支持预览，请点击')

  const buildDownloadUrl = (id: string) =>
    `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?id=${id}`

  const resetPreviewState = (state: PreviewState) => {
    state.previewText.value = ''
    state.previewUrl.value = ''
    state.previewTip.value = '暂不支持预览，请点击'
  }

  const loadTextPreview = async (state: PreviewState, requestId: number, id: string) => {
    await fileApi.fileDownload(id, async (_header, body) => {
      const text = await body.text()
      if (requestId !== previewRequestId.value) {
        return
      }
      state.previewText.value = text
    })
  }

  /**
   * 预览加载需要处理“快速切换文件”的竞态。
   * 这里通过递增 requestId，仅允许最后一次请求写回预览区，避免旧响应覆盖新文件。
   */
  watch(
    () => fileInfo.value?.id,
    async () => {
      const requestId = ++previewRequestId.value
      previewLoading.value = true

      try {
        const info = fileInfo.value
        resetPreviewState({ previewLoading, previewText, previewTip, previewUrl })

        if (!info) {
          return
        }

        if (
          (info.ext === 'html' || ['text', 'log', 'json', 'code'].includes(info.ext)) &&
          info.fileSize <= PREVIEW_FILE_SIZE_LIMIT
        ) {
          await loadTextPreview(
            { previewLoading, previewText, previewTip, previewUrl },
            requestId,
            info.id,
          )

          if (requestId !== previewRequestId.value) {
            return
          }

          previewTip.value = ''
          return
        }

        if (['image', 'pdf', 'video'].includes(info.ext)) {
          previewUrl.value = buildDownloadUrl(info.id)
          previewTip.value = ''
        }
      } finally {
        if (requestId === previewRequestId.value) {
          previewLoading.value = false
        }
      }
    },
    { immediate: true },
  )

  return {
    previewLoading,
    previewText,
    previewTip,
    previewUrl,
  }
}
