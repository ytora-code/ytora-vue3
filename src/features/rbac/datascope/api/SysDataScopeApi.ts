import BaseApi from '@/api/BaseApi'
import type PageParam from '@/types/PageParam'
import type SysDataScopeData from '../type/SysDataScopeData'
import type SysDataScopeParam from '../type/SysDataScopeParam'

class SysDataScopeApi extends BaseApi {
  constructor() {
    super('/rbac/data-scope')
  }

  // ============================== CRUD =================================>

  /**
   * 查询指定分组下的数据范围
   */
  listByGroupId = (params: SysDataScopeParam & PageParam) => {
    return this.get<Array<SysDataScopeData>, SysDataScopeParam & PageParam>('listByGroupId', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysDataScopeData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDataScopeParam) => {
    return this.post<unknown, SysDataScopeParam>('upsert', data)
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
  export = (params: SysDataScopeParam) => {
    return this.download<SysDataScopeParam>('export', params)
  }

  // ============================== 其他 =================================>

  /**
   * 查询指定角色在指定分组下面的数据范围
   */
  listDataScopeByGroupId = (params: { roleId: string; groupId: string }) => {
    return this.get<Array<string>, { roleId: string; groupId: string }>(
      'listDataScopeByGroupId',
      params,
    )
  }

  /**
   * 更新指定角色在指定分组下的数据范围
   */
  refreshRoleGroupDataScope = (params: { roleId: string; groupId: string; scopeIds: string[] }) => {
    return this.post<Array<string>, { roleId: string; groupId: string; scopeIds: string[] }>(
      'refreshRoleGroupDataScope',
      params,
    )
  }
}

export default new SysDataScopeApi()
