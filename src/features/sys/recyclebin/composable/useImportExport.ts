import { ref, type Ref } from 'vue'

import type SysRecycleBinParam from '../type/SysRecycleBinParam'
import sysRecycleBinApi from '../api/SysRecycleBinApi'

/**
 * 文件的导入导出
 */
const useImportExport = (options: {
  searchFormModel: Ref<SysRecycleBinParam>
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
      await sysRecycleBinApi.downloadTemplate()
    } catch (error) {
      console.error(error)
    } finally {
      templateLoading.value = false
    }
  }

  const submitImport = async (formData: FormData) => {
    importLoading.value = true

    try {
      await sysRecycleBinApi.import(formData)
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
      await sysRecycleBinApi.export({ ...options.searchFormModel.value })
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
