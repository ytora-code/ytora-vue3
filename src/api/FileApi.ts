import BaseApi from '@/api/BaseApi'
import type { AxiosProgressEvent } from 'axios'

class FileApi extends BaseApi {
  constructor() {
    super('/sys/file')
  }

  /**
   * 文件上传
   * @param formData 文件
   * @param progress 进度回调函数
   */
  fileUpload = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('upload', formData, progress)
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
