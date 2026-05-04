import BaseApi from '@/api/BaseApi'
import type SysDepartData from '../type/SysDepartData'
import type SysDepartParam from '../type/SysDepartParam'
import SysUserData from '@/features/rbac/user/type/SysUserData'
import SysUserDepartParam from '@/features/rbac/depart/type/SysUserDepartParam'
import PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'

class SysDepartApi extends BaseApi {
  constructor() {
    super('/rbac/depart')
  }

  /**
   * 查询整颗部门树
   */
  tree = (departName: string) => {
    return this.get<Array<SysDepartData>, { departName: string }>('tree', { departName })
  }

  /**
   * 根据PID查询部门
   */
  listByPid = (pid: string) => {
    return this.get<Array<SysDepartData>, { pid: string }>('listByPid', { pid })
  }

  /**
   * 根据ID查询部门
   */
  queryById = (id: string | number) => {
    return this.get<SysDepartData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDepartParam) => {
    return this.post<unknown, SysDepartParam>('upsert', data)
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
   * 分页查询部门下的用户
   */
  pageUserByDepartId = (id: string, params?: PageParam) => {
    return this.get<PageData<SysUserData>, { id: string } & PageParam>('pageUserByDepartId', {
      id,
      ...params,
    })
  }

  /**
   * 分页查询部门下没有的用户
   */
  pageNonUserByDepartId = (id: string, params?: PageParam) => {
    return this.get<PageData<SysUserData>, { id: string } & PageParam>('pageNonUserByDepartId', {
      id,
      ...params,
    })
  }

  /**
   * 更新用户-部门关系
   */
  refreshUserDepartMapper = (param: SysUserDepartParam) => {
    return this.post<unknown, SysUserDepartParam>('refreshUserDepartMapper', param)
  }

  /**
   * 查询指定用户拥有的部门
   */
  listDepartByUserId = (userId: string) => {
    return this.get<Array<SysDepartData>, { userId: string }>('listDepartByUserId', { userId })
  }
}

export default new SysDepartApi()
