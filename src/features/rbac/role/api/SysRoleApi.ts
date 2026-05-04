import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysRoleData from '../type/data/SysRoleData'
import type SysRoleParam from '../type/param/SysRoleParam'
import SysUserRoleMapperParam from '@/features/rbac/role/type/param/SysUserRoleMapperParam'
import SysUserRoleRefreshParam from '@/features/rbac/role/type/param/SysUserRoleRefreshParam'
import SysUserRoleData from '@/features/rbac/role/type/data/SysUserRoleData'

class SysRoleApi extends BaseApi {
  constructor() {
    super('/rbac/role')
  }

  /**
   * 分页请求
   */
  page = (params: SysRoleParam & PageParam) => {
    return this.get<PageData<SysRoleData>, SysRoleParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysRoleData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysRoleParam) => {
    return this.post<unknown, SysRoleParam>('upsert', data)
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
  export = (params: SysRoleParam) => {
    return this.download<SysRoleParam>('export', params)
  }

  /**
   * 获取用户-角色关系
   * @param params
   */
  listUserRoleMapper = (params: SysUserRoleMapperParam & PageParam) => {
    return this.get<PageData<SysUserRoleData>, SysUserRoleMapperParam & PageParam>(
      'listUserRoleMapper',
      params,
    )
  }

  /**
   * 更新用户-角色关系
   * @param params
   */
  refreshUserRoleMapper = (params: SysUserRoleRefreshParam) => {
    return this.post<string, SysUserRoleRefreshParam>('refreshUserRoleMapper', params)
  }
}

export default new SysRoleApi()
