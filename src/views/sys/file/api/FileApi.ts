import BaseApi from '@/api/BaseApi'
import type SysFolder from '../type/resp/SysFolder.ts'
import type SysFile from '@/views/sys/file/type/resp/SysFile.ts'
import type { AxiosRequestHeaders } from 'axios'
import type SysFolderReq from '@/views/sys/file/type/req/SysFolderReq.ts'
import type SysFileReq from '@/views/sys/file/type/req/SysFileReq.ts'

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

  /**
   * 新增或编辑文件夹
   */
  insertOrUpdateFolder = (data: SysFolderReq) => {
    return this.post<SysFolder, SysFolderReq>('insertOrUpdateFolder', data)
  }

  /**
   * 删除文件夹
   */
  deleteFolder = (id: string) => {
    return this.delete<never, { id: string }>('deleteFolder', { id })
  }

  // ============================== 文件 =================================>

  /**
   * 根据ID获取文件信息
   */
  queryById = (id: string) => {
    return this.get<SysFile, { id: string }>('queryById', { id })
  }

  /**
   * 新增或编辑文件
   */
  insertOrUpdate = (data: SysFileReq) => {
    return this.post<unknown, SysFileReq>('insertOrUpdate', data)
  }

  /**
   * 新增或编辑文件
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
    return this.upload<SysFile>('upload', formData, progress)
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
