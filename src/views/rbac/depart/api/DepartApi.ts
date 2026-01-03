import BaseApi from '@/api/BaseApi'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysDepartResp from '../type/resp/SysDepartResp.ts'
import type SysDepartReq from '../type/req/SysDepartReq.ts'

class DepartApi extends BaseApi {
  constructor() {
    super('/rbac/depart')
  }

  /**
   * 分页请求
   */
  page = (params: SysDepartReq) => {
    return this.get<PageResp<SysDepartResp>, SysDepartReq>('page', params)
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysDepartReq) => {
    return this.post<unknown, SysDepartReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }
}

// 导出单例
export const departApi = new DepartApi()
