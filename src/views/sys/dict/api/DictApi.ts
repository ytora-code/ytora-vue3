import BaseApi from '@/api/BaseApi'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysDict from '../type/resp/SysDict.ts'
import type SysDictItem from '../type/resp/SysDictItem.ts'
import type SysDictReq from '../type/req/SysDictReq.ts'

class DictApi extends BaseApi {
  constructor() {
    super('/sys/dict')
  }

  /**
   * 分页请求
   */
  page = (params: SysDictReq) => {
    return this.get<PageResp<SysDict>, SysDictReq>('page', params)
  }

  /**
   * 查询字典项
   */
  listDictItem = (dictCode: string) => {
    return this.get<Array<SysDictItem>, { dictCode: string }>('listDictItem', { dictCode })
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysDictReq) => {
    return this.post<unknown, SysDictReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }
}

// 导出单例
export const dictApi = new DictApi()
