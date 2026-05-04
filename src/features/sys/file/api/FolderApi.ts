import BaseApi from '@/api/BaseApi'
import SysFolderData from '@/features/sys/file/type/SysFolderData'
import SysFolderReq from '@/features/sys/file/type/SysFolderReq'

class FolderApi extends BaseApi {
  constructor() {
    super('/sys/folder')
  }

  // ============================== 文件夹 =================================>

  /**
   * 获取所有文件夹的树形数据
   */
  treeFolder = () => {
    return this.get<SysFolderData[]>('treeFolder')
  }

  /**
   * 根据PID获取子文件夹
   */
  listFolderByPid = (pid: string) => {
    if (pid.startsWith('temp-')) {
      console.log('临时文件夹')
      return []
    }
    return this.get<SysFolderData[], { pid: string }>('listFolderByPid', { pid })
  }

  /**
   * 新增或编辑文件夹
   */
  insertOrUpdateFolder = (data: SysFolderReq) => {
    return this.post<SysFolderData, SysFolderReq>('insertOrUpdateFolder', data)
  }

  /**
   * 删除文件夹
   */
  deleteFolder = (id: string) => {
    return this.delete<never, { id: string }>('deleteFolder', { id })
  }
}

// 导出单例
export default new FolderApi()
