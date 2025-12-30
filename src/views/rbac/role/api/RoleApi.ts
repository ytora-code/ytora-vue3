import BaseApi from '@/api/BaseApi'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysRole from '../type/resp/SysRole.ts'
import type SysRoleReq from '../type/req/SysRoleReq.ts'

class RoleApi extends BaseApi {
  constructor() {
    super('/rbac/role')
  }

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
}

// 导出单例
export const roleApi = new RoleApi()
