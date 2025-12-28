import BaseApi from '@/api/BaseApi'
import type { AxiosProgressEvent } from 'axios'

class FileApi extends BaseApi {
  constructor() {
    super('/sys/file')
  }

  /**
   * 文件上传
   * @param formData 文件
   * @param onUploadProgress 进度回调函数
   */
  fileUpload = (
    formData: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ) => {
    return this.upload<string>('upload', formData, onUploadProgress)
  }

  /**
   * 文件下载
   * @param fileId 文件ID
   */
  fileDownload = (fileId: string) => {
    return this.download<string>('download', fileId)
  }
}

// 导出单例
export const fileApi = new FileApi()
