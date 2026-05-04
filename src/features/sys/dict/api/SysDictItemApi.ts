import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysDictItemData from '../type/SysDictItemData'
import type SysDictItemParam from '../type/SysDictItemParam'

class SysDictItemApi extends BaseApi {
  constructor() {
    super('/sys/dict/item')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysDictItemParam & PageParam & Record<string, string | number>) => {
    params['sql_order_col'] = 'index↑'
    return this.get<PageData<SysDictItemData>, SysDictItemParam & PageParam>('page', params)
  }

  /**
   * 查询字典项
   */
  listDictItem = (dictCode: string) => {
    return this.get<SysDictItemData[], { dictCode: string; sql_order_col: string }>(
      'listDictItem',
      {
        dictCode,
        sql_order_col: 'index↑',
      },
    )
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysDictItemData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysDictItemParam) => {
    return this.post<unknown, SysDictItemParam>('upsert', data)
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

  // ============================== EXCEL导入导出 =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入数据
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出数据
   */
  export = (params: SysDictItemParam) => {
    return this.download<SysDictItemParam>('export', params)
  }

  // ============================== 其他 =================================>
}

export default new SysDictItemApi()
