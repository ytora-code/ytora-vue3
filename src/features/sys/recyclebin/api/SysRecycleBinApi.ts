import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysRecycleBinData from '../type/SysRecycleBinData'
import type SysRecycleBinParam from '../type/SysRecycleBinParam'

class SysRecycleBinApi extends BaseApi {
  constructor() {
    super('/sys/recycle-bin')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysRecycleBinParam & PageParam) => {
    return this.get<PageData<SysRecycleBinData>, SysRecycleBinParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysRecycleBinData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysRecycleBinParam) => {
    return this.post<unknown, SysRecycleBinParam>('upsert', data)
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
  export = (params: SysRecycleBinParam) => {
    return this.download<SysRecycleBinParam>('export', params)
  }

  // ============================== 其他 =================================>
}

export default new SysRecycleBinApi()
