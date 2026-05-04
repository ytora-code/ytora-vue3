import BaseApi from '@/api/BaseApi'
import SysFileData from '@/features/sys/file/type/SysFileData'
import SysFileReq from '@/features/sys/file/type/SysFileReq'
import { AxiosRequestHeaders } from 'axios'

class FileApi extends BaseApi {
  constructor() {
    super('/sys/file')
  }

  /**
   * 根据ID获取文件信息
   */
  queryById = (id: string) => {
    return this.get<SysFileData, { id: string }>('queryById', { id })
  }

  /**
   * 新增或编辑文件
   */
  insertOrUpdate = (data: SysFileReq) => {
    return this.post<unknown, SysFileReq>('insertOrUpdate', data)
  }

  /**
   * 删除文件
   */
  deleteFile = (id: string) => {
    return this.delete<never, { id: string }>('delete', { id })
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
    return this.upload<SysFileData>('upload', formData, progress)
  }

  /**
   * 文件下载（将数据放进内存）
   * @param fileId 文件ID
   * @param callback 下载完成后的回调
   */
  fileDownload = (
    id: string,
    callback?: (header: Record<string, string> & Partial<AxiosRequestHeaders>, body: Blob) => void,
  ) => {
    return this.download<{ id: string }>('download', { id }, callback)
  }

  /**
   * 文件下载（以浏览器的默认方式）
   * @param fileId 文件ID
   */
  defaultDownload = (id: string) => {
    window.location.href = `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?fileId=${id}`
  }
}

// 导出单例
export default new FileApi()
