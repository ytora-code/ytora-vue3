import BaseApi from '@/api/BaseApi'
import SysUserParam from '@/features/rbac/user/type/SysUserParam'
import PageData from '@/types/PageData'
import SysUserData from '@/features/rbac/user/type/SysUserData'
import PageParam from '@/types/PageParam'

class UserApi extends BaseApi {
  constructor() {
    super('/rbac/user')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysUserParam & PageParam) => {
    return this.get<PageData<SysUserData>, SysUserParam & PageParam>('page', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (params: SysUserParam) => {
    return this.get<SysUserData, SysUserParam>('queryById', params)
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysUserParam) => {
    return this.post<unknown, SysUserParam>('upsert', data)
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length == 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', { ids: ids.join(',') })
  }

  // ============================== EXCEL =================================>

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
  export = (params: SysUserParam) => {
    return this.download<SysUserParam>('export', params)
  }
}

// 导出单例
export default new UserApi()
