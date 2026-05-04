import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysDataScopeGroupData from '../type/SysDataScopeGroupData'
import type SysDataScopeGroupParam from '../type/SysDataScopeGroupParam'

class SysDataScopeGroupApi extends BaseApi {
  constructor() {
    super('/rbac/data-scope-group')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysDataScopeGroupParam & PageParam) => {
    return this.get<PageData<SysDataScopeGroupData>, SysDataScopeGroupParam & PageParam>(
      'page',
      params,
    )
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysDataScopeGroupData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDataScopeGroupParam) => {
    return this.post<unknown, SysDataScopeGroupParam>('upsert', data)
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
  export = (params: SysDataScopeGroupParam) => {
    return this.download<SysDataScopeGroupParam>('export', params)
  }

  // ============================== 其他 =================================>
  /**
   * 查询指定角色在指定资源下的分组
   */
  listGroup = (params: { roleId: string; permissionId: string }) => {
    return this.get<Array<string>, { roleId: string; permissionId: string }>('listGroup', params)
  }

  /**
   * 查询指定角色在指定资源下的分组
   */
  refreshRoleGroup = (params: { roleId: string; permissionId: string; groupIds: string[] }) => {
    return this.post<Array<string>, { roleId: string; permissionId: string; groupIds: string[] }>(
      'refreshRoleGroup',
      params,
    )
  }
}

export default new SysDataScopeGroupApi()
