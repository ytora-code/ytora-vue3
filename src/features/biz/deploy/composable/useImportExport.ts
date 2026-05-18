import { ref, type Ref } from 'vue'

import type BizDeployParam from '../type/BizDeployParam'
import bizDeployApi from '../api/BizDeployApi'

/**
 * 文件的导入导出
 */
const useImportExport = (options: {
  searchFormModel: Ref<BizDeployParam>
  page: () => Promise<void>
}) => {
  const importDialogVisible = ref<boolean>(false)
  const importLoading = ref<boolean>(false)
  const exportLoading = ref<boolean>(false)
  const templateLoading = ref<boolean>(false)

  const openImportDialog = () => {
    importDialogVisible.value = true
  }

  const closeImportDialog = () => {
    importDialogVisible.value = false
  }

  const handleImportDialogAfterLeave = () => {
    importLoading.value = false
  }

  const downloadTemplate = async () => {
    templateLoading.value = true
    try {
      await bizDeployApi.downloadTemplate()
    } catch (error) {
      console.error(error)
    } finally {
      templateLoading.value = false
    }
  }

  const submitImport = async (formData: FormData) => {
    importLoading.value = true

    try {
      await bizDeployApi.import(formData)
      closeImportDialog()
      await options.page()
    } catch (error) {
      console.error(error)
    } finally {
      importLoading.value = false
    }
  }

  const exportData = async () => {
    exportLoading.value = true
    try {
      await bizDeployApi.export({ ...options.searchFormModel.value })
    } catch (error) {
      console.error(error)
    } finally {
      exportLoading.value = false
    }
  }

  return {
    importDialogVisible,
    importLoading,
    exportLoading,
    templateLoading,
    openImportDialog,
    closeImportDialog,
    handleImportDialogAfterLeave,
    downloadTemplate,
    submitImport,
    exportData,
  }
}

export default useImportExport
