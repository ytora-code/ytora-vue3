import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysDynamicApiData from '../type/SysDynamicApiData'
import type SysDynamicApiParam from '../type/SysDynamicApiParam'

class SysDynamicApiApi extends BaseApi {

  constructor() {
    super('/online/dynamic-api')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysDynamicApiParam & PageParam) => {
    return this.get<PageData<SysDynamicApiData>, SysDynamicApiParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysDynamicApiData, { id: string | number }>('queryById', {id})
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDynamicApiParam) => {
    return this.post<unknown, SysDynamicApiParam>('upsert', data)
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', {ids: ids.join(',')})
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
  export = (params: SysDynamicApiParam) => {
    return this.download<SysDynamicApiParam>('export', params)
  }

  // ============================== 其他 =================================>

  /**
   * 接口上线
   */
  publish = (id: string) =>
    this.get<unknown, {id: string}>('publish', {id})

  /**
   * 接口下线
   */
  offline = (id: string) =>
    this.get<unknown, {id: string}>('offline', {id})

}

export default new SysDynamicApiApi()
