import BaseApi from '@/api/BaseApi'
import type SysPermissionData from '../type/SysPermissionData'
import type SysPermissionParam from '../type/SysPermissionParam'
import { SysRolePermissionData } from '@/features/rbac/permission/type/SysRolePermissionData'
import SysRolePermissionParam from '@/features/rbac/permission/type/SysRolePermissionParam'

class SysPermissionApi extends BaseApi {
  constructor() {
    super('/rbac/permission')
  }

  /**
   * 获取整颗资源树
   */
  tree = (pid: string) => {
    return this.get<Array<SysPermissionData>, { pid: string }>('tree', { pid })
  }

  /**
   * 根据PID查询子资源，顶级资源PID为0
   */
  listByPid = (pid: string) => {
    return this.get<Array<SysPermissionData>, { pid: string }>('listByPid', { pid })
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysPermissionData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysPermissionParam) => {
    return this.post<unknown, SysPermissionParam>('upsert', data)
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
   * 获取指定角色的资源信息
   * @param roleId
   */
  treePermissionByRoleId = (roleId: string) => {
    return this.get<SysRolePermissionData, { roleId: string }>('treePermissionByRoleId', { roleId })
  }

  /**
   * 更新角色-资源映射
   */
  refreshRolePermission = (param: SysRolePermissionParam) => {
    return this.post<unknown, SysRolePermissionParam>('refreshRolePermission', param)
  }
}

export default new SysPermissionApi()
