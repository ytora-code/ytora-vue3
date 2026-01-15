import BaseApi from '@/api/BaseApi'
import type SysFolder from '../type/resp/SysFolder.ts'
import type SysFile from '@/views/sys/file/type/resp/SysFile.ts'
import type { AxiosRequestHeaders } from 'axios'

class FileApi extends BaseApi {
  constructor() {
    super('/sys/file')
  }

  // ============================== 文件夹 =================================>

  /**
   * 获取所有文件夹的树形数据
   */
  treeFolder = () => {
    return this.get<SysFolder[]>('treeFolder')
  }

  /**
   * 根据PID获取子文件夹
   */
  listFolderByPid = (pid: string) => {
    return this.get<SysFolder[], { pid: string }>('listFolderByPid', { pid })
  }

  // ============================== 文件 =================================>

  /**
   * 根据ID获取文件信息
   */
  queryById = (id: string) => {
    return this.get<SysFile, { id: string }>('queryById', { id })
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
   * 文件下载（将数据放进内存）
   * @param fileId 文件ID
   * @param callback 下载完成后的回调
   */
  fileDownload = (
    fileId: string,
    callback?: (header: Record<string, string> & Partial<AxiosRequestHeaders>, body: Blob) => void,
  ) => {
    return this.download<{ fileId: string }>('download', { fileId }, callback)
  }

  /**
   * 文件下载（以浏览器的默认方式）
   * @param fileId 文件ID
   */
  defaultDownload = (fileId: string) => {
    window.location.href = `${import.meta.env.VITE_REQUEST_BASE_URL}sys/file/download?fileId=${fileId}`
  }
}

// 导出单例
export const fileApi = new FileApi()
