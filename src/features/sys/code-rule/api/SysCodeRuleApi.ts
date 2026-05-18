import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysCodeRuleData from '../type/SysCodeRuleData'
import type SysCodeRuleParam from '../type/SysCodeRuleParam'

class SysCodeRuleApi extends BaseApi {

  constructor() {
    super('/sys/code-rule')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysCodeRuleParam & PageParam) => {
    return this.get<PageData<SysCodeRuleData>, SysCodeRuleParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysCodeRuleData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysCodeRuleParam) => {
    return this.post<unknown, SysCodeRuleParam>('upsert', data)
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
  export = (params: SysCodeRuleParam) => {
    return this.download<SysCodeRuleParam>('export', params)
  }

  // ============================== 其他 =================================>

}

export default new SysCodeRuleApi()
