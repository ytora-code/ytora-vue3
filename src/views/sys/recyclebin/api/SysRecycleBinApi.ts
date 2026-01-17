import BaseApi from '@/api/BaseApi'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysRecycleBinReq from '@/views/sys/recyclebin/type/req/SysRecycleBinReq.ts'

class SysRecycleBinApi extends BaseApi {
  constructor() {
    super('/sys/recycleBin')
  }

  /**
   * 分页请求
   */
  page = (param: SysRecycleBinReq) => {
    return this.get<PageResp<Record<string, unknown> & { id: string | number }>, SysRecycleBinReq>(
      'page',
      param,
    )
  }

  /**
   * 还原数据
   */
  restore = (ids: unknown) => {
    return this.get<unknown, { ids: unknown }>('restore', { ids })
  }

  /**
   * 彻底删除
   */
  deleteCompletely = (ids: unknown) => {
    return this.delete<unknown, { ids: unknown }>('deleteCompletely', { ids })
  }

  /**
   * 清空回收站数据
   */
  clear = (table: string) => {
    return this.delete<unknown, { table: string }>('clear', { table })
  }
}

// 导出单例
export const recycleBinApi = new SysRecycleBinApi()
