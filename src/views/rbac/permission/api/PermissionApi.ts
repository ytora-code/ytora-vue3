import BaseApi from '@/api/BaseApi.ts'
import type SysPermissionReq from '../type/req/SysPermissionReq.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import type { SysRolePermissionResp } from '@/views/rbac/permission/type/resp/SysRolePermissionResp.ts'
import type SysRolePermissionReq from '@/views/rbac/permission/type/req/SysRolePermissionReq.ts'

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

  /**
   * 获取指定角色的资源树
   */
  treePermissionByRoleId = (roleId: string) => {
    return this.get<SysRolePermissionResp, { roleId: string }>('treePermissionByRoleId', { roleId })
  }

  /**
   * refreshRolePermission
   */
  refreshRolePermission = (data: SysRolePermissionReq) => {
    return this.post<unknown, SysRolePermissionReq>('refreshRolePermission', data)
  }
}

export const permissionApi = new PermissionApi()
