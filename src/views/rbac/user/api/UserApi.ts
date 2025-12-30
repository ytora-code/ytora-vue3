import BaseApi from '@/api/BaseApi'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserReq from '@/views/rbac/user/type/req/SysUserReq.ts'

class UserApi extends BaseApi {
  constructor() {
    super('/rbac/user')
  }

  /**
   * 分页请求
   */
  page = (params: SysUserReq) => {
    return this.get<PageResp<SysUserResp>, SysUserReq>('page', params)
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysUserReq) => {
    return this.post<unknown, SysUserReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }
}

// 导出单例
export const userApi = new UserApi()
