import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type BizDeployData from '../type/BizDeployData'
import type BizDeployParam from '../type/BizDeployParam'

class BizDeployApi extends BaseApi {

  constructor() {
    super('/biz/deploy')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: BizDeployParam & PageParam) => {
    return this.get<PageData<BizDeployData>, BizDeployParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<BizDeployData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: BizDeployParam) => {
    return this.post<unknown, BizDeployParam>('upsert', data)
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', { ids: ids.join(',') })
  }

  // ============================== EXCEL导入导出 =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入数据
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出数据
   */
  export = (params: BizDeployParam) => {
    return this.download<BizDeployParam>('export', params)
  }

  // ============================== 其他 =================================>

}

export default new BizDeployApi()
