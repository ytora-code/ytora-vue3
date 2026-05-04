import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysConfigData from '../type/SysConfigData'
import type SysConfigParam from '../type/SysConfigParam'

class SysConfigApi extends BaseApi {
  constructor() {
    super('/sys/config')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysConfigParam & PageParam) => {
    return this.get<PageData<SysConfigData>, SysConfigParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysConfigData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysConfigParam) => {
    return this.post<unknown, SysConfigParam>('upsert', data)
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
  export = (params: SysConfigParam) => {
    return this.download<SysConfigParam>('export', params)
  }

  // ============================== 其他 =================================>
}

export default new SysConfigApi()
