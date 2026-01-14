import BaseApi from '@/api/BaseApi'
import type SysFolder from '../type/resp/SysFolder.ts'

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
}

// 导出单例
export const fileApi = new FileApi()
