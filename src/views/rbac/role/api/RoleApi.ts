import BaseApi from '@/api/BaseApi'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysRole from '../type/resp/SysRole.ts'
import type SysRoleReq from '../type/req/SysRoleReq.ts'
import type SysRoleUserReq from '@/views/rbac/role/type/req/SysRoleUserReq.ts'
import type SysUserRole from '@/views/rbac/role/type/resp/SysUserRole.ts'

class RoleApi extends BaseApi {
  constructor() {
    super('/rbac/role')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysRoleReq) => {
    return this.get<PageResp<SysRole>, SysRoleReq>('page', params)
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysRoleReq) => {
    return this.post<unknown, SysRoleReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }

  // ============================== EXCEL =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出
   */
  export = (params: SysRoleReq) => {
    return this.download<SysRoleReq>('export', params)
  }

  // ============================== 其他 =================================>

  listUserRoleMapper = (params: {
    userId?: string
    roleName?: string
    roleCode?: string
    pageNo: number
    pageSize: number
  }) => {
    return this.get<
      PageResp<SysUserRole>,
      {
        userId?: string
        roleName?: string
        roleCode?: string
        pageNo: number
        pageSize: number
      }
    >('listUserRoleMapper', params)
  }

  refreshUserRoleMapper = (data: SysRoleUserReq) => {
    return this.post<unknown, SysRoleUserReq>('refreshUserRoleMapper', data)
  }
}

// 导出单例
export const roleApi = new RoleApi()
