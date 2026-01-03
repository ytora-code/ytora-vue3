import BaseApi from '@/api/BaseApi.ts'
import type SysPermissionReq from '../type/req/SysPermissionReq.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'

class PermissionApi extends BaseApi {
  constructor() {
    super('/rbac/permission')
  }

  /**
   * 查询资源
   */
  list = (params: SysPermissionReq) => {
    return this.get<Array<SysPermission>, SysPermissionReq>('list', params)
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysPermissionReq) => {
    return this.post<unknown, SysPermissionReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }
}

export const permissionApi = new PermissionApi()
