import BaseApi from '@/api/BaseApi.ts'
import type SysPermissionReq from '../type/req/SysPermissionReq.ts'
import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import type { SysRolePermissionResp } from '@/views/rbac/permission/type/resp/SysRolePermissionResp.ts'
import type SysRolePermissionReq from '@/views/rbac/permission/type/req/SysRolePermissionReq.ts'
import type SysDataRule from '@/views/rbac/permission/type/resp/SysDataRule.ts'
import type SysDataRuleReq from '@/views/rbac/permission/type/req/SysDataRuleReq.ts'
import type SysRoleDataRuleReq from '@/views/rbac/permission/type/req/SysRoleDataRuleReq.ts'
import type SysRoleDataRuleResp from '@/views/rbac/permission/type/resp/SysRoleDataRuleResp.ts'

class PermissionApi extends BaseApi {
  constructor() {
    super('/rbac/permission')
  }

  /**
   * 查询资源
   */
  tree = (params: SysPermissionReq) => {
    return this.get<Array<SysPermission>, SysPermissionReq>('tree', params)
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
   * 更新角色-资源映射
   */
  refreshRolePermission = (data: SysRolePermissionReq) => {
    return this.post<unknown, SysRolePermissionReq>('refreshRolePermission', data)
  }

  /**
   * 获取指定资源的数据规则
   */
  listDataRule = (permissionId?: string) => {
    return this.get<SysDataRule[], { permissionId?: string }>('listDataRule', { permissionId })
  }

  /**
   * 新增或编辑指定资源的数据规则
   */
  addOrUpdateDataRule = (data: SysDataRuleReq) => {
    return this.post<unknown, SysDataRuleReq>('addOrUpdateDataRule', data)
  }

  /**
   * 删除指定数据规则
   */
  deleteDataRule = (id?: string) => {
    return this.delete<unknown, { id?: string }>('deleteDataRule', { id })
  }

  /**
   * 获取指定角色在指定资源下配置的的数据规则信息
   */
  listRoleDataRule = (roleId?: string, permissionId?: string) => {
    return this.get<
      SysRoleDataRuleResp,
      {
        roleId?: string
        permissionId?: string
      }
    >('listRoleDataRule', { roleId, permissionId })
  }

  /**
   * 更新角色-数据规则
   */
  refreshRoleDataRule = (data: SysRoleDataRuleReq) => {
    return this.post<unknown, SysRoleDataRuleReq>('refreshRoleDataRule', data)
  }
}

export const permissionApi = new PermissionApi()
