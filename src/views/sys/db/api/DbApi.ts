import BaseApi from '@/api/BaseApi'
import type DataSourceDesc from '@/views/sys/db/type/resp/DataSourceDesc.ts'

class DbApi extends BaseApi {
  constructor() {
    super('/sys/db')
  }

  // ============================== CRUD =================================>

  /**
   * 获取当前系统所有数据源
   */
  dataSources = () => {
    return this.get<DataSourceDesc[]>('dataSources')
  }
}

// 导出单例
export const dbApi = new DbApi()
