import BaseApi from '@/api/BaseApi'
import type SysDynamicApiGroupData from '../type/SysDynamicApiGroupData'
import type SysDynamicApiGroupParam from '../type/SysDynamicApiGroupParam'

class SysDynamicApiGroupApi extends BaseApi {

  constructor() {
    super('/online/dynamic-api-group')
  }

  // ============================== CRUD =================================>

  /**
   * 树形查询动态API接口分组
   */
  tree = (params: SysDynamicApiGroupParam) => {
    return this.get<Array<SysDynamicApiGroupData>, SysDynamicApiGroupParam>('tree', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysDynamicApiGroupData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDynamicApiGroupParam) => {
    return this.post<unknown, SysDynamicApiGroupParam>('upsert', data)
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
  export = (params: SysDynamicApiGroupParam) => {
    return this.download<SysDynamicApiGroupParam>('export', params)
  }

  // ============================== 其他 =================================>

}

export default new SysDynamicApiGroupApi()
