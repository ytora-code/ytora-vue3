import { ref, type Ref } from 'vue'

import type SysUserParam from '@/features/rbac/user/type/SysUserParam'
import userApi from '../api/UserApi'

/**
 * 文件的导入导出
 */
const useImportExport = (options: {
  searchFormModel: Ref<SysUserParam>
  page: () => Promise<void>
}) => {
  /**
   * 导入框是否显示
   */
  const importDialogVisible = ref<boolean>(false)
  /**
   * 导入的loading状态
   */
  const importLoading = ref<boolean>(false)
  /**
   * 导出的loading状态
   */
  const exportLoading = ref<boolean>(false)
  /**
   * 模板下载的loading状态
   */
  const templateLoading = ref<boolean>(false)

  /**
   * 打开文件导入框
   */
  const openImportDialog = () => {
    importDialogVisible.value = true
  }

  /**
   * 关闭文件导入框
   */
  const closeImportDialog = () => {
    importDialogVisible.value = false
  }

  /**
   * 上传成功
   */
  const handleImportDialogAfterLeave = () => {
    importLoading.value = false
  }

  /**
   * 下载导入模板
   */
  const downloadTemplate = async () => {
    templateLoading.value = true
    try {
      await userApi.downloadTemplate()
    } catch (error) {
      console.error(error)
    } finally {
      templateLoading.value = false
    }
  }

  /**
   * 导入文件
   */
  const submitImport = async (formData: FormData) => {
    importLoading.value = true

    try {
      await userApi.import(formData)
      importDialogVisible.value = false
      await options.page()
    } catch (error) {
      console.error(error)
    } finally {
      importLoading.value = false
    }
  }

  /**
   * 导出数据
   */
  const exportData = async () => {
    exportLoading.value = true
    try {
      await userApi.export({ ...options.searchFormModel.value })
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
